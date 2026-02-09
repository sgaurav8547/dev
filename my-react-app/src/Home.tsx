import EnergyDashboard from "./components/EnergyDashboard";
import { useEnergyDashboardContext, useEnergyDashboardDispatch } from "./AppProvider";

export default function Home() {
  const { theme } = useEnergyDashboardContext();
  const dispatch = useEnergyDashboardDispatch();

  const toggleTheme = () => {
    dispatch && dispatch({
      type: "SET_THEME",
      payload: theme === "light" ? "dark" : "light",
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <h1 style={{ zIndex: 100 }}>Welcome to the Energy Dashboard</h1>
        <button 
          onClick={toggleTheme}
          style={{
            padding: "8px 16px",
            cursor: "pointer",
            borderRadius: "4px",
            border: "1px solid #ccc"
          }}
        >
          Switch to {theme === "light" ? "Dark" : "Light"} Mode
        </button>
      </div>
      <p>
        This dashboard provides insights into your energy consumption patterns.
        Use the controls to explore your data and optimize your energy usage.
      </p>
      {/* Add more content or components as needed */}
      
      <EnergyDashboard />
    </div>
  );
}
