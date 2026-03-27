import React, { useEffect, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

const EventCalendar = () => {
  
  const [currentDate, setCurrentDate] = useState(new Date(2021, 3, 1));
  const [view, setView] = useState('Month');
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true)

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const allEvents = {
    2: [
      { name: 'Spicy Nugget', color: 'bg-error', time: '10:00 AM', description: 'Delicious spicy chicken nuggets special' },
      { name: 'Caesar Salad', color: 'bg-error', time: '11:30 AM', description: 'Fresh caesar salad with grilled chicken' },
      { name: 'Pasta Carbonara', color: 'bg-error', time: '01:00 PM', description: 'Creamy pasta carbonara' },
      { name: 'Grilled Salmon', color: 'bg-error', time: '02:30 PM', description: 'Fresh grilled salmon with vegetables' },
      { name: 'Pizza la Piazza BBQ', color: 'bg-error', time: '04:00 PM', description: 'Special BBQ pizza with extra cheese' }
    ],
    18: [
      { name: 'Spicy Nugget', color: 'bg-success', time: '10:00 AM', description: 'Spicy nugget special' },
      { name: 'Beef Burger', color: 'bg-success', time: '12:00 PM', description: 'Premium beef burger' },
      { name: 'Fish Tacos', color: 'bg-success', time: '02:00 PM', description: 'Fresh fish tacos' },
      { name: 'Pizza BBQ', color: 'bg-success', time: '04:00 PM', description: 'BBQ pizza special' }
    ],
    22: [
      { name: 'Spicy Nugget', color: 'bg-primary', time: '11:00 AM', description: 'Chicken nuggets' },
      { name: 'Veggie Bowl', color: 'bg-primary', time: '01:00 PM', description: 'Healthy vegetable bowl' },
      { name: 'Sushi Platter', color: 'bg-primary', time: '03:00 PM', description: 'Fresh sushi selection' },
      { name: 'Pizza BBQ', color: 'bg-primary', time: '05:00 PM', description: 'Evening pizza special' }
    ]
  };
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }
    while (days.length < 42) days.push({ day: days.length - daysInMonth + 1, isCurrentMonth: false });
    return days;
  };

  const getWeekDays = () => {
    const weekStart = new Date(2021, 3, 18); // April 18, 2021 (Sunday)
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      days.push({
        date: date.getDate(),
        dayName: daysOfWeek[i],
        isToday: date.getDate() === 18
      });
    }
    
    return days;
  };
   
  const handleDayClick = (day) => {
    if (allEvents[day]) {
      setSelectedDay(day);
      setShowModal(true);
    }
  };
useEffect(() => {
  const timer = setTimeout(() => {
    setLoading(false);
  }, 1000); // 1 sekund

  return () => clearTimeout(timer);
}, []);
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth(currentDate);
  const weekDays = getWeekDays();
  
  const getTodayCount = () => {
    return Object.values(allEvents).flat().length;
  };

  const getDateBg = (day) => {
    if (!day.isCurrentMonth) return '';
    if (day.day === 2) return 'bg-error/10';
    if (day.day === 18) return 'bg-success/10';
    if (day.day === 22) return 'bg-primary/10';
    return '';
  };

  if (loading) {
  return (
   <div className="flex items-center justify-center h-[60vh]">
      <span className="loading loading-spinner text-success w-12"></span>
    </div>
  );
}

  return (
    <div className="">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-base-content flex items-center gap-2">
          {monthYear} <ChevronDown className="w-6 h-6 text-base-content/60" />
        </h1>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex gap-4">
            {['Date', 'Week', 'Month', 'Year'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`btn btn-ghost btn-sm ${view === v ? 'btn-active text-primary' : ''}`}
              >
                {v}
              </button>
            ))}
          </div>
          <button className="btn btn-outline btn-sm">Today ({getTodayCount()})</button>
          <button className="btn btn-primary btn-sm flex items-center gap-2">+ New Schedule</button>
        </div>
      </div>

      {/* Month View */}
      {view === 'Month' && (
        <div className="bg-base-100 rounded-xl border border-base-300">
          <div className="grid grid-cols-7 border-b border-base-300">
            {daysOfWeek.map(d => (
              <div key={d} className="py-4 text-center font-semibold text-base-content text-sm">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((dateObj, idx) => {
              const dayEvents = dateObj.isCurrentMonth ? allEvents[dateObj.day] : null;
              return (
                <div
                  key={idx}
                  className={`min-h-32 border-r border-b border-base-300 p-3 cursor-pointer hover:shadow transition-all ${getDateBg(dateObj)} ${!dateObj.isCurrentMonth ? 'text-base-content/40' : ''}`}
                  onClick={() => dayEvents && handleDayClick(dateObj.day)}
                >
                  <div className="text-sm font-semibold mb-2">{dateObj.day}</div>
                  {dayEvents && (
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event, i) => (
                        <div key={i} className={`text-white text-xs rounded-full px-3 py-1.5 font-semibold truncate ${event.color}`}>{event.name}</div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="bg-primary text-white text-xs px-2 py-1 rounded-full font-bold text-center">{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="bg-primary text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Events for April {selectedDay}, 2021</h2>
                <p className="text-primary/30 text-sm mt-1">{allEvents[selectedDay].length} events scheduled</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-ghost btn-circle text-white"
              >
                <X className="w-6 h-6"/>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              {allEvents[selectedDay].map((event, i) => (
                <div key={i} className="border border-base-300 rounded-xl p-4 hover:shadow-lg transition-all">
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1 ${event.color}`}></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-base-content">{event.name}</h3>
                        {event.badge && (
                          <span className="bg-base-300 text-white text-xs px-3 py-1 rounded-full font-semibold">{event.badge}</span>
                        )}
                      </div>
                      <p className="text-base-content/70 text-sm mb-1">{event.description}</p>
                      <span className="text-xs text-base-content/50 bg-base-200 px-3 py-1 rounded-full">🕐 {event.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-base-300 p-4 bg-base-200 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="btn btn-ghost">Close</button>
              <button className="btn btn-primary">Add New Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCalendar;
