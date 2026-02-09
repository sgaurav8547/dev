import React, { forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  useEnergyDashboardContext,
  useEnergyDashboardDispatch,
} from "../AppProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";

// Custom Input component that only renders an icon
const CustomIconInput = forwardRef<
  HTMLButtonElement,
  { onClick?: React.MouseEventHandler<HTMLButtonElement> }
>(function CustomIconInput({ onClick }, ref) {
  const { selectedDate } = useEnergyDashboardContext();
  return (
    <button
      className="example-custom-input"
      onClick={onClick}
      ref={ref}
      aria-label="Open Date Picker"
      style={{
        border: "none",
        background: "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
      <span style={{ marginRight: 8, color: "rgb(69, 90, 100)", fontWeight: "bold" }}>
        {selectedDate.toLocaleDateString("en-US", {month: "long", year: "numeric"})}
      </span>
      <FontAwesomeIcon icon={faCalendar} size="lg" color="#3498db" />
    </button>
  );
});

const AppDatePicker = () => {
  const dispatch = useEnergyDashboardDispatch();
  const { selectedDate } = useEnergyDashboardContext(); // We can pull in any state if needed in the future

  return (
    // <input
    //   type="date"
    //   value={selectedDate.toISOString().split("T")[0]}
    //   max={new Date().toISOString().split("T")[0]}
    //   style={{
    //     colorScheme: "light",
    //     border: "none",
    //   }}
    //   onChange={(e) => {
    //     const date = new Date(e.target.value + "T00:00:00"); // Ensure time is set to start of day
    //     dispatch &&
    //       dispatch({
    //         type: "SET_SELECTED_DATE",
    //         payload: date,
    //       });
    //   }}
    // />
    <DatePicker
      selected={selectedDate}
      onChange={(date: Date | null) => {
        dispatch &&
          dispatch({
            type: "SET_SELECTED_DATE",
            payload: date || new Date(),
          });
      }}
      maxDate={new Date()}
      calendarClassName="custom-calendar"
      //   portalId="withPortal" // Or just use the prop 'withPortal'
      popperProps={{
        strategy: "fixed", // or positionFixed: true
      }}
      customInput={<CustomIconInput />}
    />
  );
};

export default AppDatePicker;
