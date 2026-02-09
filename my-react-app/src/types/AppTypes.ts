export type DevicePing= {
    timestamp: number;
    value: number;
}

export type EnergyDataPoint = {
    hour: number;
    label: string;
    delta: number | null;
}

export type EnergyDashboardProps = {
    externalData: DevicePing[];
    selectedDate: string;
}

export type CustomTooltipProps = {
  x?: number;
  y?: number;
  datum?: EnergyDataPoint;
  active?: boolean;
}

export type DatePaginationProps = {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export type EnergyDashboardState = {
  data: DevicePing[];
  selectedDate: Date;
  theme: "light" | "dark";
};

export type EnergyDashboardAction =
  | { type: "SET_DATA"; payload: DevicePing[] }
  | { type: "SET_SELECTED_DATE"; payload: Date }
  | { type: "SET_THEME"; payload: "light" | "dark" };

