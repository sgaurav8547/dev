import { createContext, useContext, useReducer } from "react";
import type { EnergyDashboardAction, EnergyDashboardState } from "./types/AppTypes";
import { energyDashboardReducer, initialEnergyDashboardState } from "./reducers.ts/EnergyDashboardReducer";

//EnergyDashboardState context
const EnergyDashboardContext = createContext<EnergyDashboardState>(
  initialEnergyDashboardState
);

//EnergyDashboardAction context for dispatching actions
const EnergyDashboardDispatchContext =
  createContext<React.Dispatch<EnergyDashboardAction> | null>(null);

//AppProvider component to wrap the app and provide contexts
export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(energyDashboardReducer, initialEnergyDashboardState);
  return (
    <EnergyDashboardContext.Provider value={state}>
      <EnergyDashboardDispatchContext.Provider value={dispatch}>
        {children}
      </EnergyDashboardDispatchContext.Provider>
    </EnergyDashboardContext.Provider>
  );
}

export function useEnergyDashboardContext(): EnergyDashboardState {
  const context = useContext(EnergyDashboardContext);
  if (context === undefined) {
    throw new Error(
      "useEnergyDashboardContext must be used within an AppProvider"
    );
  }
  return context;
}

export function useEnergyDashboardDispatch(): React.Dispatch<EnergyDashboardAction> | null {
  const context = useContext(EnergyDashboardDispatchContext);
  if (context === undefined) {
    throw new Error(
      "useEnergyDashboardDispatch must be used within an AppProvider"
    );
  }
  return context;
}
