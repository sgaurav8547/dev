import React, { useState } from 'react';
import DatePagination from './DatePagination';

const DatePaginationDemo: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>DatePagination Component Demo</h2>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>Current Selected Date:</h3>
        <p style={{ 
          fontSize: '1.2rem', 
          fontWeight: 'bold',
          color: '#007bff'
        }}>
          {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      <DatePagination 
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      <div style={{ marginTop: '2rem' }}>
        <h3>Features Demonstrated:</h3>
        <ul style={{ textAlign: 'left' }}>
          <li>✅ Left and right arrow navigation</li>
          <li>✅ 7 days shown on desktop, 3 days on mobile</li>
          <li>✅ Right arrow disabled when week includes today's date</li>
          <li>✅ Selected date highlighted in blue</li>
          <li>✅ Today's date has a green border</li>
          <li>✅ Navigation changes week without changing selected date</li>
          <li>✅ Clicking a date changes the selected date</li>
          <li>✅ Date format: dd MMM (e.g., 08 Feb)</li>
          <li>✅ Responsive design with media queries</li>
          <li>✅ Generated dates using useMemo for performance</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h4>Instructions:</h4>
        <p><strong>Desktop:</strong> Use arrows to navigate by weeks (7 days at a time)</p>
        <p><strong>Mobile:</strong> Use arrows to navigate by days (1 day at a time)</p>
        <p><strong>Date Selection:</strong> Click any date to select it</p>
        <p><strong>Today Restriction:</strong> Cannot navigate to future weeks/days beyond today</p>
      </div>
    </div>
  );
};

export default DatePaginationDemo;
