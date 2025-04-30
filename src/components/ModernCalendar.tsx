import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';


export default function ModernCalendar() {
  const [currentMonth, setCurrentMonth] = useState(0);
  
  // Month definitions with days and highlighted dates
  const months = [
    { name: "Jan", days: 31, highlightedDates: [4, 7, 11, 15, 19, 23, 28, 31] },
    { name: "Feb", days: 28, highlightedDates: [2, 5, 10, 14, 18, 22, 27] },
    { name: "Mar", days: 31, highlightedDates: [1, 6, 9, 12, 17, 21, 24, 29] },
    { name: "Apr", days: 30, highlightedDates: [3, 8, 11, 16, 20, 25, 30] },
    { name: "May", days: 1, highlightedDates: [1] }
  ];
  
  // Month navigation functions
  const goToPrevMonth = () => {
    setCurrentMonth(prev => (prev === 0 ? months.length - 1 : prev - 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(prev => (prev === months.length - 1 ? 0 : prev + 1));
  };
  
  // Get current month data
  const currentMonthData = months[currentMonth];
  
  // Generate calendar dates
  const generateDates = () => {
    const totalDays = currentMonthData.days;
    const highlightedDates = currentMonthData.highlightedDates;
    let dates = [];
    
    // Create weeks (rows)
    for (let i = 0; i < 6; i++) {
      let week = [];
      // Create 7 days per week
      for (let j = 0; j < 7; j++) {
        const dayNum = i * 7 + j + 1;
        if (dayNum <= totalDays) {
          const isHighlighted = highlightedDates.includes(dayNum);
          week.push({ day: dayNum, highlighted: isHighlighted });
        } else {
          week.push(null); // Empty cell
        }
      }
      // Only add week if it has at least one day
      if (week.some(day => day !== null)) {
        dates.push(week);
      }
    }
    
    return dates;
  };
  
  const calendarDates = generateDates();
  
  // Day names
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  
  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-lg w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">பங்களிப்பு</h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={goToPrevMonth}
            className="p-2 rounded-full bg-white text-gray-600 hover:bg-gray-100 shadow-sm flex items-center justify-center"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center space-x-2">
            <Calendar size={20} className="text-green-400" />
            <span className="font-medium text-gray-700">{currentMonthData.name} 2025</span>
          </div>
          
          <button 
            onClick={goToNextMonth}
            className="p-2 rounded-full bg-white text-gray-600 hover:bg-gray-100 shadow-sm flex items-center justify-center"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      {/* Days of week */}
      <div className="grid grid-cols-7 mb-2">
        {dayNames.map((day, index) => (
          <div key={index} className="text-center py-2 text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-3">
        {calendarDates.flat().map((dayData, index) => {
          if (dayData === null) {
            return <div key={index} className="h-12"></div>;
          }
          
          return (
            <div 
              key={index} 
              className={`h-12 rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer transition-all duration-200 ${
                dayData.highlighted 
                  ? "bg-green-400 text-white shadow-sm hover:bg-green-500" 
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {dayData.day}
            </div>
          );
        })}
      </div>
      
      {/* Footer with total contribution */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <span className="text-sm text-gray-600">Active Days</span>
        </div>
        <div className="text-sm font-medium text-gray-700">
          Total: {currentMonthData.highlightedDates.length} days
        </div>
      </div>
    </div>
  );
}