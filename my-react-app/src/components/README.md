# DatePagination Component

A responsive, accessible React date pa### 🎛️ Behavior

### Navigation Logic
- **Week view (Desktop)**: Shows Sunday through Saturday
- **Day view (Mobile)**: Shows previous day, view day, next day
- **Arrow navigation**: Changes week/day view WITHOUT changing selected date
- **Date selection**: Only changes when user clicks on a specific date
- **Future restriction**: Cannot navigate beyond today's date
- **State separation**: View date and selected date are independentn component that adapts to screen size and provides smooth navigation through dates.

## ✨ Features

### 📱 **Responsive Design**
- **Desktop**: Displays 7 days (full week view)
- **Mobile**: Displays 3 days (selected day + neighbors)
- **Automatic adaptation** using JavaScript media queries

### 🎯 **Smart Navigation**
- **Left/Right arrows** for week/day navigation
- **Desktop**: Navigate by weeks (7 days)
- **Mobile**: Navigate by days (1 day)
- **Auto-disable**: Right arrow disabled when reaching current date

### 📅 **Date Display**
- **Format**: `dd MMM` (e.g., "08 Feb")
- **Day names**: Short format (Sun, Mon, Tue...)
- **Week generation**: Optimized with `useMemo`

### 🎨 **Visual Indicators**
- **Selected date**: Blue background with shadow
- **Today's date**: Green border with special styling
- **Hover effects**: Smooth animations and transitions

### ♿ **Accessibility**
- **ARIA labels**: Descriptive labels for screen readers
- **Keyboard navigation**: Arrow keys, Enter, and Space
- **Focus indicators**: Clear focus outline for keyboard users
- **Semantic HTML**: Proper button elements

## 🚀 Usage

```tsx
import DatePagination from './components/DatePagination';

function MyComponent() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <DatePagination
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
    />
  );
}
```

## 📋 Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `selectedDate` | `Date` | ✅ | The currently selected date |
| `onDateChange` | `(date: Date) => void` | ✅ | Callback when date is selected |

## ⌨️ Keyboard Navigation

| Key | Action |
|-----|--------|
| `←` | Navigate to previous week/day |
| `→` | Navigate to next week/day (if not disabled) |
| `Enter` / `Space` | Select the focused date |
| `Tab` | Navigate between buttons |

## 🎛️ Behavior

### Navigation Logic
- **Week view (Desktop)**: Shows Sunday through Saturday
- **Day view (Mobile)**: Shows previous day, selected day, next day
- **Future restriction**: Cannot navigate beyond today's date
- **State preservation**: Selected date remains when navigating weeks

### Responsive Breakpoints
- **Mobile**: `≤ 768px` - Shows 3 days
- **Tablet**: `769px - 1024px` - Shows 7 days (medium size)
- **Desktop**: `≥ 1025px` - Shows 7 days (large size)

## 🎨 Styling

The component uses CSS modules (`DatePagination.module.css`) with:
- **Clean design**: Minimal padding, subtle shadows
- **Smooth transitions**: Hover and focus effects
- **Responsive spacing**: Adapts to screen size
- **High contrast**: Accessible color combinations

## 🔧 Technical Details

- **Performance**: Uses `useMemo` for date generation
- **Debounced resize**: Optimized window resize handling
- **TypeScript**: Fully typed with strict mode support
- **CSS Modules**: Scoped styling to prevent conflicts

## 🌟 Integration

The component integrates seamlessly with:
- **React Context**: Works with state management
- **Energy Dashboard**: Pre-integrated in the demo app
- **Custom themes**: Easy to customize via CSS variables

## 📱 Demo

A complete demo is available in `DatePaginationDemo.tsx` showcasing all features and responsive behavior.
