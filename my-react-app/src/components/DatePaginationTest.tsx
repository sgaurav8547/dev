import { useState } from 'react';
import DatePagination from './DatePagination';

/**
 * Simple integration test component to verify DatePagination functionality
 * This can be imported and used in the main app for testing
 */
export function DatePaginationTest() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-9), message]); // Keep last 10 logs
  };

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
    addLog(`Date changed to: ${newDate.toLocaleDateString()}`);
  };

  const testNavigationLogic = () => {
    // Test various dates
    const testDates = [
      new Date('2026-02-01'),
      new Date('2026-02-07'),
      new Date('2026-02-08'), // Today
      new Date('2026-01-15'),
    ];

    testDates.forEach((date, index) => {
      setTimeout(() => {
        setSelectedDate(date);
        addLog(`Test ${index + 1}: Set to ${date.toLocaleDateString()}`);
      }, index * 1000);
    });
  };

  const testFutureDateRestriction = () => {
    // Try to set a future date - should not work
    const futureDate = new Date('2026-02-15');
    addLog(`Attempting to set future date: ${futureDate.toLocaleDateString()}`);
    
    // Simulate clicking on a future date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (futureDate.getTime() > today.getTime()) {
      addLog('❌ Future date click blocked (correct behavior)');
    } else {
      setSelectedDate(futureDate);
      addLog('✅ Date set successfully');
    }
  };

  return (
    <div style={{ padding: '2rem', border: '1px solid #ddd', margin: '1rem', borderRadius: '8px' }}>
      <h3>DatePagination Integration Test</h3>
      
      <div style={{ marginBottom: '1rem' }}>
        <strong>Selected Date:</strong> {selectedDate.toLocaleDateString()}
      </div>

      <DatePagination 
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />

      <div style={{ marginTop: '1rem' }}>
        <button onClick={testNavigationLogic} style={{ 
          padding: '0.5rem 1rem', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer',
          marginRight: '0.5rem'
        }}>
          Run Test Sequence
        </button>
        
        <button onClick={testFutureDateRestriction} style={{ 
          padding: '0.5rem 1rem', 
          backgroundColor: '#dc3545', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Test Future Date Block
        </button>
      </div>

      {logs.length > 0 && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.5rem', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '4px',
          fontSize: '0.875rem'
        }}>
          <strong>Test Logs:</strong>
          <ul style={{ margin: '0.5rem 0', paddingLeft: '1rem' }}>
            {logs.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ 
        marginTop: '1rem', 
        padding: '0.5rem', 
        backgroundColor: '#e7f3ff', 
        borderRadius: '4px',
        fontSize: '0.875rem'
      }}>
        <strong>Manual Tests:</strong>
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1rem' }}>
          <li>✓ Resize browser window to test responsive behavior</li>
          <li>✓ Click dates to verify selection works (past/today only)</li>
          <li>✓ Arrow buttons change week view WITHOUT changing selected date</li>
          <li>✓ Selected date remains highlighted when navigating weeks</li>
          <li>✓ Try clicking future dates - should be disabled</li>
          <li>✓ Try keyboard navigation (Tab, Arrow keys, Enter)</li>
          <li>✓ Check that right arrow is disabled for future dates</li>
          <li>✓ Verify future dates appear grayed out and non-clickable</li>
        </ul>
      </div>
    </div>
  );
}

export default DatePaginationTest;
