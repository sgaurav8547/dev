import { useMemo, useState } from "react";
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryLine,
  VictoryVoronoiContainer,
  VictoryLegend,
} from "victory";
import type { EnergyDataPoint } from "../types/AppTypes";
import CustomTooltip from "./CustomTooltip";
import {
  useEnergyDashboardContext,
  useEnergyDashboardDispatch,
} from "../AppProvider";
import { generateMockData } from "../Api/MockApi";
import DatePagination from "./DatePagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompress, faExpand } from "@fortawesome/free-solid-svg-icons";

import { VictoryTheme } from "victory";

const darkTheme = {
  ...VictoryTheme.clean,
  axis: {
    style: {
      axis: { stroke: "#fff" },
      tickLabels: { fill: "#fff", fontSize: 15, padding: 10 },
      grid: { stroke: "rgba(255,255,255,0.1)" },
    },
  },
  legend: {
    style: {
      labels: { fill: "#fff" },
      title: { fill: "#fff" },
    },
  },
};

const lightTheme = {
  ...VictoryTheme.clean,
  axis: {
    style: {
      axis: { stroke: "#333" },
      tickLabels: { fill: "#333", fontSize: 15, padding: 10 },
      grid: { stroke: "#ececec" },
    },
  },
};
export default function EnergyDashboard() {
  const state = useEnergyDashboardContext();
  const dispatch = useEnergyDashboardDispatch();
  const { data: externalData, selectedDate, theme } = state;

  if (!externalData || externalData.length === 0) {
    return <div>No data available</div>;
  }
  const [isExpanded, setIsExpanded] = useState(false);
  // Define styles for both states
  // Define styles for both states
  const containerStyle: React.CSSProperties = isExpanded
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor:
          theme === "light"
            ? "#fff"
            : "rgba(34, 34, 34, 0.95)",
        color: theme === "light" ? "black" : "white",
        zIndex: 999,
        // padding: "20px",
        display: "flex",
        flexDirection: "column",
        // transition: "all 0.5s ease-in-out", // Animates width/height/position changes
        WebkitOverflowScrolling: "touch",
        boxSizing: "border-box",
        overflow: "hidden",
      }
    : {
        position: "relative",
        // transition: "all 0.5s ease-in-out", // Animates width/height/position changes
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        width: "643px",
        height: "auto",
        backgroundColor:
          theme === "light"
            ? "#fff"
            : "rgba(34, 34, 34, 0.95)",
        color: theme === "light" ? "black" : "white",
        borderRadius: "8px",
        border: theme === "light" ? "1px solid #ddd" : "1px solid #555",
        padding: "10px",
        boxSizing: "border-box",
      };
  const GOAL_LIMIT = 2.0; // kWh per hour threshold
  const processed = useMemo(() => {
    // 1. Initialize Buckets
    const buckets: EnergyDataPoint[] = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${i}:00`,
      delta: null,
    }));

    const data = generateMockData(selectedDate);
    if (!data || data.length === 0) return buckets;

    // 2. Filter pings for the SELECTED day
    const currentDayPings = data.filter((p) => {
      const d = new Date(p.timestamp);
      return (
        d.getFullYear() === selectedDate.getFullYear() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getDate() === selectedDate.getDate()
      );
    });

    // 3. Find the "Anchor" (The very next ping available in the entire dataset)
    // We look for the first ping that happens AFTER the selected day ends
    const endOfDayTimestamp = selectedDate.setHours(23, 59, 59, 999);
    const anchorPing = data
      .filter((p) => p.timestamp > endOfDayTimestamp)
      .sort((a, b) => a.timestamp - b.timestamp)[0];

    // 4. Combine and Sort
    const processingPings = [...currentDayPings];
    if (anchorPing) processingPings.push(anchorPing);
    processingPings.sort((a, b) => a.timestamp - b.timestamp);

    // If we only have 0 or 1 ping, we can't interpolate deltas
    if (processingPings.length < 2) return buckets;

    const MAX_GAP_MS = 24 * 60 * 60 * 1000; // 24 hours

    for (let i = 1; i < processingPings.length; i++) {
      const start = processingPings[i - 1];
      const end = processingPings[i];
      const durationMs = end.timestamp - start.timestamp;

      if (durationMs > MAX_GAP_MS || durationMs <= 0) continue;

      const ratePerMs = (end.value - start.value) / durationMs;

      // Boundary: Start filling from the start of the ping or start of the day
      let ptr = Math.max(
        start.timestamp,
        new Date(selectedDate).setHours(0, 0, 0, 0)
      );
      // Boundary: Stop at the end of the ping or end of the day
      const stopAt = Math.min(end.timestamp, endOfDayTimestamp);

      while (ptr < stopAt) {
        const dObj = new Date(ptr);
        const hr = dObj.getHours();

        const nextHrStart = new Date(ptr).setHours(hr + 1, 0, 0, 0);
        const msInThisHr = Math.min(nextHrStart - ptr, stopAt - ptr);

        if (buckets[hr]) {
          if (buckets[hr].delta === null) buckets[hr].delta = 0;
          buckets[hr].delta! += msInThisHr * ratePerMs;
        }
        ptr = nextHrStart;
      }
    }
    return buckets;
  }, [selectedDate]);

  return (
    <div style={containerStyle}>
      {/* HEADER SECTION */}
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            position: "absolute",
            top: "0",
            right: "5px",
            zIndex: 10000,
            padding: "8px 12px",
            cursor: "pointer",
            backgroundColor: theme === "light" ? "#fff" : "rgba(34, 34, 34, 0.95)",
            color: theme !== "light" ? "#eee" : "#333",
            border: "none",
            fontWeight: "bold",
            fontSize: "20px",
          }}
        >
          <FontAwesomeIcon icon={isExpanded ? faCompress : faExpand} />
        </button>
      </div>
      <div style={{ flex: "1 1 auto", width: "100%" }}>
        <VictoryChart // 1. Pass the actual calculated dimensions
          width={isExpanded ? window.innerWidth : 800}
          height={isExpanded ? window.innerHeight - 150 : 400}
          // 2. Adjust padding based on state so it doesn't look stretched
          padding={{
            top: 50,
            bottom: 50,
            left: 60,
            right: isExpanded ? 60 : 20,
          }}
          //   animate={{
          //     duration: 500, // Speed of the expand/collapse animation in ms
          //     onLoad: { duration: 1000 }, // Initial entrance animation
          //     easing: "quadInOut", // Smooth start and end
          //   }}
          theme={theme === "light" ? lightTheme : darkTheme}
          domainPadding={{ x: 20, y: 20 }}
          containerComponent={
            <VictoryVoronoiContainer
              // 3. This is the "Magic" prop that prevents the zoom effect
              responsive={true}
            />
          }
        >
          <VictoryLegend
            title={`Energy Usage for Asset ABC - ${selectedDate.toLocaleDateString(
              "en-US",
              { month: "short", day: "2-digit", year: "numeric" }
            )}`}
            centerTitle
            x={isExpanded ? window.innerWidth / 2 - 100 : 653 / 2 - 100} // Center the legend based on the chart width
            orientation="horizontal"
            gutter={20}
            style={{
              title: {
                fontSize: 20,
                fontWeight: "bold",
                padding: 20,
              },
              border: { stroke: "transparent" },
            }}
            padding={{ top: 10, bottom: 10, left: 20, right: 20 }}
            data={[]}
          />
          <VictoryAxis
            tickValues={[0, 4, 8, 12, 16, 20, 23]}
            tickFormat={(t) => `${t}:00`}
            label="Hour of Day"
            style={{
              axisLabel: { padding: 35 },
              grid: { stroke: "transparent" },
            }}
          />
          <VictoryAxis
            dependentAxis
            label="kWh"
            style={
              {
                axis: { stroke: "none" }, // As we discussed, hiding this line helps clarity
                tickLabels: {
                  fontSize: 10,
                  padding: 5,
                  textAnchor: "end", // Ensures numbers align to the right
                },
                axisLabel: { padding: 40 }, // Moves the "kWh" title away from the numbers
                grid: { stroke: "#e0e0e0", strokeDasharray: "4,8" },
              } as any
            }
          />
          {/* GOAL LINE */}
          <VictoryLine
            style={{
              data: {
                stroke: "#e74c3c",
                strokeDasharray: "5,5",
                strokeWidth: 1,
              },
              labels: { visibility: "hidden" },
            }}
            data={[
              { x: 0, y: GOAL_LIMIT },
              { x: 23, y: GOAL_LIMIT },
            ]}
          />
          <VictoryBar
            data={processed}
            labels={() => ""} // Hides default labels since we have a custom tooltip
            labelComponent={<CustomTooltip />}
            x="hour"
            y={(d: EnergyDataPoint) => d.delta ?? 0}
            style={
              {
                data: {
                  fill: ({ datum }: any) =>
                    (datum?.delta ?? 0) > GOAL_LIMIT ? "#e74c3c" : "#3498db",
                },
              } as any
            }
            events={[
              {
                target: "data",
                eventHandlers: {
                  onMouseOver: () => ({
                    target: "labels",
                    mutation: () => ({ active: true }),
                  }),
                  onMouseOut: () => ({
                    target: "labels",
                    mutation: () => ({ active: false }),
                  }),
                },
              },
            ]}
          />
          {/* TREND LINE
          <VictoryLine
            data={processed.filter((d) => d.delta !== null)}
            x="hour"
            y="delta"
            interpolation="monotoneX"
            style={{
              data: { stroke: "#2c3e50", strokeWidth: 2 },
              labels: { visibility: "hidden" },
            }}
            animate={{ duration: 500 }}
          /> */}
        </VictoryChart>
      </div>
      <div style={{ padding: isExpanded ? "0 20px 20px 20px" : "0" }}>
        <DatePagination
          selectedDate={selectedDate}
          onDateChange={(date: Date) => {
            // Normalize the date to midnight before setting
            const normalizedDate = new Date(date);
            normalizedDate.setHours(0, 0, 0, 0);

            dispatch &&
              dispatch({
                type: "SET_SELECTED_DATE",
                payload: normalizedDate,
              });
          }}
        />
      </div>
    </div>
  );
}
