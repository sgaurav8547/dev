import { generateMockData } from "../Api/MockApi";
import type { EnergyDashboardState, EnergyDashboardAction } from "../types/AppTypes";

function energyDashboardReducer(
  state: EnergyDashboardState,
  action: EnergyDashboardAction
): EnergyDashboardState {
  switch (action.type) {
    case "SET_DATA":
      return {
        ...state,
        data: action.payload,
      };
    case "SET_SELECTED_DATE":
      return {
        ...state,
        selectedDate: action.payload,
      };
    case "SET_THEME":
      return {
        ...state,
        theme: action.payload,
      };
    default:
      return state;
  }
}

const initialEnergyDashboardState: EnergyDashboardState = {
  data: generateMockData(new Date()), // Initialize with mock data
  theme: "light",
  selectedDate: (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight
    return today;
  })(), // Default to today at midnight
};

export { energyDashboardReducer, initialEnergyDashboardState };
