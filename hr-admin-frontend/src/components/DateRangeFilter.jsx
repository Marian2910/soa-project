import React, { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const DateRangeFilter = ({ startDate, endDate, onApply, onClear }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selection, setSelection] = useState({
    start: startDate ? new Date(startDate) : null,
    end: endDate ? new Date(endDate) : null,
  });

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handleDateClick = (day) => {
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );

    // Reset if both selected or clicking before start
    if (
      (selection.start && selection.end) ||
      (selection.start && clickedDate < selection.start)
    ) {
      setSelection({ start: clickedDate, end: null });
    } else if (selection.start && !selection.end) {
      setSelection({ ...selection, end: clickedDate });
    } else {
      setSelection({ start: clickedDate, end: null });
    }
  };

  const handleApply = () => {
    const fmt = (d) => (d ? d.toISOString().split("T")[0] : "");
    onApply(fmt(selection.start), fmt(selection.end));
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month); // 0 = Sun

    // Adjust for Monday start if needed (standard is usually Sun=0 in JS)
    const padding = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return [...padding, ...days].map((day, idx) => {
      if (!day) return <div key={`pad-${idx}`} className="h-8 w-8" />;

      const date = new Date(year, month, day);
      const isStart =
        selection.start && date.getTime() === selection.start.getTime();
      const isEnd = selection.end && date.getTime() === selection.end.getTime();
      const isInRange =
        selection.start &&
        selection.end &&
        date > selection.start &&
        date < selection.end;

      let classes =
        "h-8 w-8 flex items-center justify-center text-sm rounded-full cursor-pointer hover:bg-gray-100 transition-colors";
      if (isStart || isEnd)
        classes =
          "h-8 w-8 flex items-center justify-center text-sm rounded-full bg-blue-600 text-white font-bold shadow-sm";
      else if (isInRange)
        classes =
          "h-8 w-8 flex items-center justify-center text-sm bg-indigo-50 text-indigo-900";

      return (
        <div key={day} onClick={() => handleDateClick(day)} className={classes}>
          {day}
        </div>
      );
    });
  };

  const changeMonth = (offset) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1)
    );
  };

  return (
    <div className="p-4 w-72" onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => changeMonth(-1)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <FiChevronLeft />
        </button>
        <span className="font-bold text-gray-700">
          {currentDate.toLocaleDateString("default", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button
          onClick={() => changeMonth(1)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <FiChevronRight />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
          <span key={d} className="text-xs font-bold text-gray-400">
            {d}
          </span>
        ))}
        {renderCalendar()}
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
        <button
          onClick={onClear}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded hover:bg-indigo-700"
        >
          Apply Range
        </button>
      </div>
    </div>
  );
};

export default DateRangeFilter;
