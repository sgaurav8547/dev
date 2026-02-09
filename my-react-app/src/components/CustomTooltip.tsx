import { VictoryPortal } from "victory";

const CustomTooltip = (props: any) => {
  const { x, y, datum, active } = props;

  if (!active || !datum) return null;
  return (
    // VictoryPortal ensures this renders on top of everything else
    <VictoryPortal>
      <g style={{ pointerEvents: "none" }}>
        <foreignObject x={x - 75} y={y - 70} width="175" height="100">
          <div
            style={{
              background: "white",
              padding: "10px",
              border: "1px solid #3498db",
              borderRadius: "4px",
            }}
          >
            <p style={{ fontSize: "12px", color: "#333" }}>
              Usage at hour {datum.hour}:00 - {datum.delta?.toFixed(2)}
            </p>
          </div>
        </foreignObject>
      </g>
    </VictoryPortal>
  );
};

export default CustomTooltip;