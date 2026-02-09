import React, { useMemo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import type { DatePaginationProps } from '../types/AppTypes';
import styles from './DatePagination.module.css';

const DatePagination: React.FC<DatePaginationProps> = ({ selectedDate, onDateChange }) => {
  // State to track if we're on mobile
  const [isMobile, setIsMobile] = useState(false);
  
  // State to track the view date (for week navigation) separately from selected date
  const [viewDate, setViewDate] = useState(selectedDate);
  
  // State for date picker visibility and positioning
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
  const datePickerButtonRef = React.useRef<HTMLButtonElement>(null);

  // Function to calculate picker position
  const calculatePickerPosition = () => {
    if (datePickerButtonRef.current) {
      const rect = datePickerButtonRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      const pickerWidth = isMobile ? 220 : 280;
      const windowWidth = window.innerWidth;
      
      let left = rect.right + scrollLeft - pickerWidth;
      
      // Ensure picker doesn't go off screen on mobile
      if (isMobile && left < 10) {
        left = 10;
      } else if (left + pickerWidth > windowWidth - 10) {
        left = windowWidth - pickerWidth - 10;
      }
      
      setPickerPosition({
        top: rect.bottom + scrollTop + 4,
        left: left
      });
    }
  };

  // Handle date picker toggle
  const handleDatePickerToggle = () => {
    console.log('Date picker toggle clicked!', showDatePicker);
    if (!showDatePicker) {
      calculatePickerPosition();
    }
    setShowDatePicker(!showDatePicker);
  };

  // Handle clicking outside date picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDatePicker) {
        const target = event.target as HTMLElement;
        if (!target.closest('.react-datepicker') && 
            !target.closest(`.${styles.portalDatePicker}`) &&
            !datePickerButtonRef.current?.contains(target)) {
          setShowDatePicker(false);
        }
      }
    };

    if (showDatePicker) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDatePicker]);

  // Sync viewDate with selectedDate when selectedDate changes externally
  useEffect(() => {
    setViewDate(selectedDate);
  }, [selectedDate]);

  // Aria-live announcement for selected date changes
  const [ariaAnnouncement, setAriaAnnouncement] = useState('');
  
  useEffect(() => {
    if (selectedDate) {
      const announcement = `Selected date changed to ${selectedDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`;
      setAriaAnnouncement(announcement);
      
      // Clear announcement after 1 second to avoid repetitive announcements
      const timer = setTimeout(() => setAriaAnnouncement(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [selectedDate]);

  // Effect to handle resize and initial load
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    const recalculatePosition = () => {
      if (showDatePicker) {
        calculatePickerPosition();
      }
    };
    
    // Debounce resize events for better performance
    let timeoutId: number;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        checkMobile();
        recalculatePosition();
      }, 100);
    };
    
    // Check on initial load
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', recalculatePosition);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', recalculatePosition);
      clearTimeout(timeoutId);
    };
  }, [showDatePicker]);

  // Get today's date for comparison (memoized for consistency)
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  // Use useMemo to generate dates based on view date and screen size
  const weekDates = useMemo(() => {
    const dates = [];
    
    if (isMobile) {
      // For mobile, show 3 days centered around view date
      const centerDate = new Date(viewDate);
      centerDate.setHours(0, 0, 0, 0); // Normalize to midnight
      
      const dayBefore = new Date(centerDate.getTime() - 24 * 60 * 60 * 1000);
      const dayAfter = new Date(centerDate.getTime() + 24 * 60 * 60 * 1000);
      
      dates.push(dayBefore);
      dates.push(new Date(centerDate));
      dates.push(dayAfter);
    } else {
      // For desktop, show full week
      const startOfWeek = new Date(viewDate);
      startOfWeek.setHours(0, 0, 0, 0); // Normalize to midnight
      const dayOfWeek = startOfWeek.getDay();
      startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        date.setHours(0, 0, 0, 0); // Normalize to midnight
        dates.push(date);
      }
    }
    
    return dates;
  }, [viewDate, isMobile]);

  // Check if navigation should be disabled
  const shouldDisableNext = useMemo(() => {
    if (isMobile) {
      // On mobile, disable if view date is today or in the future
      const normalizedViewDate = new Date(viewDate);
      normalizedViewDate.setHours(0, 0, 0, 0);
      return normalizedViewDate.getTime() >= today.getTime();
    } else {
      // On desktop, disable if current week contains today
      return weekDates.some(date => date.getTime() === today.getTime());
    }
  }, [isMobile, viewDate, today, weekDates]);

  // Format date as "dd MMM yyyy"
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return `${day} ${month}`;
  };

  // Get short day name
  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Navigate to previous week/day (changes view, not selected date)
  const goToPreviousWeek = () => {
    const newDate = new Date(viewDate);
    newDate.setHours(0, 0, 0, 0); // Normalize to midnight
    
    if (isMobile) {
      // On mobile, move view to previous day without changing selected date
      newDate.setDate(newDate.getDate() - 1);
    } else {
      // On desktop, move view to previous week without changing selected date
      newDate.setDate(newDate.getDate() - 7);
    }
    
    // Only update the view, not the selected date
    setViewDate(newDate);
  };

  // Navigate to next week/day (changes view, not selected date)
  const goToNextWeek = () => {
    if (shouldDisableNext) return; // Disable based on mode
    
    const newDate = new Date(viewDate);
    newDate.setHours(0, 0, 0, 0); // Normalize to midnight
    
    if (isMobile) {
      // On mobile, move view to next day without changing selected date
      newDate.setDate(newDate.getDate() + 1);
    } else {
      // On desktop, move view to next week without changing selected date
      newDate.setDate(newDate.getDate() + 7);
    }
    
    // Only update the view, not the selected date
    setViewDate(newDate);
  };

  // Handle date selection
  const handleDateClick = (date: Date) => {
    // Don't allow selecting future dates
    if (isFutureDate(date)) {
      return;
    }
    
    // Don't allow clicking on already selected date
    if (isSelected(date)) {
      return;
    }
    
    // Provide haptic feedback on touch devices
    if (navigator.vibrate && 'ontouchstart' in window) {
      navigator.vibrate(50); // Light haptic feedback
    }
    
    onDateChange(date);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, date?: Date) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        goToPreviousWeek();
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (!shouldDisableNext) {
          goToNextWeek();
        }
        break;
      case 'Enter':
      case ' ':
        if (date && !isFutureDate(date) && !isSelected(date)) {
          event.preventDefault();
          handleDateClick(date);
        }
        break;
    }
  };

  // Check if a date is selected
  const isSelected = (date: Date) => {
    // Normalize both dates to midnight for comparison
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    
    const normalizedSelectedDate = new Date(selectedDate);
    normalizedSelectedDate.setHours(0, 0, 0, 0);
    
    return normalizedDate.getTime() === normalizedSelectedDate.getTime();
  };

  // Check if a date is today
  const isToday = (date: Date) => {
    return date.getTime() === today.getTime();
  };

  // Check if a date is in the future (after today)
  const isFutureDate = (date: Date) => {
    // Normalize the input date to midnight for fair comparison
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    
    return normalizedDate.getTime() > today.getTime();
  };

  return (
    <div 
      className={styles.datePagination}
      role="group"
      aria-label="Date selection widget"
      aria-describedby="date-pagination-instructions"
    >
      {/* Hidden instructions for screen readers */}
      <div id="date-pagination-instructions" className={styles.srOnly}>
        Use arrow keys to navigate between weeks. Press Enter or Space to select a date. Today is {today.toLocaleDateString()}. Selected date is {selectedDate.toLocaleDateString()}.
      </div>
      
      {/* Aria-live region for announcing date changes */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className={styles.srOnly}
      >
        {ariaAnnouncement}
      </div>

      {/* Left Arrow */}
      <button 
        className={styles.navButton}
        onClick={goToPreviousWeek}
        onKeyDown={handleKeyDown}
        aria-label={isMobile ? "Go to previous day" : "Go to previous week"}
        aria-describedby="date-pagination-instructions"
      >
        <FontAwesomeIcon icon={faChevronLeft} aria-hidden="true" />
      </button>

      {/* Days Container */}
      <div className={styles.daysContainer}>
        {weekDates.map((date, index) => (
          <button
            key={index}
            className={`${styles.dayButton} ${isSelected(date) ? styles.selected : ''} ${isToday(date) ? styles.today : ''} ${isFutureDate(date) ? styles.disabled : ''}`}
            onClick={() => handleDateClick(date)}
            onKeyDown={(e) => handleKeyDown(e, date)}
            aria-label={
              isFutureDate(date) 
                ? `${formatDate(date)} (disabled - future date)` 
                : isSelected(date)
                ? `${formatDate(date)} (currently selected, cannot change)`
                : `Select ${formatDate(date)}`
            }
            aria-pressed={isSelected(date)}
            aria-current={isToday(date) ? 'date' : undefined}
            role="button"
            tabIndex={isFutureDate(date) ? -1 : 0}
            disabled={isFutureDate(date)}
          >
            {/* Screen reader announcement for selected state */}
            {isSelected(date) && (
              <span className={styles.srOnly}>Currently selected date</span>
            )}
            {isToday(date) && (
              <span className={styles.srOnly}>Today</span>
            )}
            
            <div className={styles.dayName}>
              {getDayName(date)}
            </div>
            <div className={styles.dateText}>
              {formatDate(date)}
            </div>
          </button>
        ))}
      </div>

      {/* Right Arrow */}
      <button 
        className={`${styles.navButton} ${shouldDisableNext ? styles.disabled : ''}`}
        onClick={goToNextWeek}
        onKeyDown={handleKeyDown}
        disabled={shouldDisableNext}
        aria-label={
          shouldDisableNext 
            ? `Cannot navigate to future ${isMobile ? 'day' : 'week'}` 
            : isMobile ? "Go to next day" : "Go to next week"
        }
        aria-describedby="date-pagination-instructions"
      >
        <FontAwesomeIcon icon={faChevronRight} aria-hidden="true" />
      </button>

      {/* Date Picker Button */}
      <div className={styles.datePickerContainer}>
        <button
          ref={datePickerButtonRef}
          className={styles.datePickerButton}
          onClick={handleDatePickerToggle}
          aria-label="Open date picker"
          title="Choose any date"
        >
          <FontAwesomeIcon icon={faCalendarAlt} aria-hidden="true" />
        </button>
      </div>

      {/* Portal-rendered Date Picker */}
      {showDatePicker && createPortal(
        <div className={styles.portalOverlay}>
          <div 
            className={styles.portalBackdrop}
            onClick={() => setShowDatePicker(false)}
          />
          <div 
            className={styles.portalDatePicker}
            style={{
              position: 'fixed',
              top: `${pickerPosition.top}px`,
              left: `${pickerPosition.left}px`,
              zIndex: 10000,
              background: 'white',
              border: '3px solid red', // Debug: Make it super visible
              padding: '10px'
            }}
          >
            <div style={{color: 'black', fontWeight: 'bold', marginBottom: '10px'}}>
              DATE PICKER IS HERE! Position: {pickerPosition.top},{pickerPosition.left}
            </div>
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => {
                if (date && !isFutureDate(date)) {
                  onDateChange(date);
                  setViewDate(date);
                  setShowDatePicker(false);
                }
              }}
              maxDate={today}
              inline
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DatePagination;
