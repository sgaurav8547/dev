import type { DevicePing } from "../types/AppTypes";

export const generateMockData = (date: Date): DevicePing[] => {
  const data: DevicePing[] = [];
  let cumulativeValue = 1000; 
  
  // 1. Start 2 days ago to ensure we have "Past", "Current", and "Future" data
  const startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 2, 0, 0, 0).getTime();

  // 2. Generate data for a 72-hour window (4320 minutes)
  // This ensures the "Next Day Anchor" always exists for your charts
  for (let i = 0; i < 4320; i += Math.floor(Math.random() * 15) + 1) {
    const timestamp = startTime + i * 60000;

    const hour = new Date(timestamp).getHours();
    // Simulate realistic patterns: Morning (7-9) and Evening (18-21) spikes
    let hourlyActivity = 0.02; // Base usage (standby)
    if ((hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 21)) {
      hourlyActivity = 0.4; // High usage
    } else if (hour > 9 && hour < 18) {
      hourlyActivity = 0.1; // Moderate usage
    }

    const increment = Math.random() * hourlyActivity;
    cumulativeValue += increment;

    // Simulate occasional device dropouts
    if (Math.random() > 0.03) {
      data.push({ 
        timestamp, 
        value: parseFloat(cumulativeValue.toFixed(2)) 
      });
    }
  }
  return data;
};

//generate a mock data for device that pings every 5 minutes for 24 hours, with random consumption values between 0.01 and 0.2 kWh, 
//do not skip any pings, and ensure the values show a realistic daily pattern (e.g., higher consumption during the day, lower at night).
export const generateMockDataFixed = (): DevicePing[] => {
  const data: DevicePing[] = [];
  let cumulativeValue = 1000; 
  const now = new Date();
  const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0).getTime();

  for (let i = 0; i < 288; i++) { // 288 pings for every 5 minutes in 24 hours
    const timestamp = startTime + i * 5 * 60000; // Every 5 minutes
    const hour = new Date(timestamp).getHours();

    let hourlyActivity = 0.02; // Base usage (standby)
    if ((hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 21)) {
      hourlyActivity = 0.4; // High usage
    } else if (hour > 9 && hour < 18) {
      hourlyActivity = 0.1; // Moderate usage
    }

    const increment = Math.random() * hourlyActivity;
    cumulativeValue += increment;

    data.push({ 
      timestamp, 
      value: parseFloat(cumulativeValue.toFixed(2)) 
    });
  }
  return data;
};

