function CalendarView({
  tasks,
  selectedDate,
  setSelectedDate,
  calendarDate,
  setCalendarDate,
  getMonthDays,
  formatDate,
}) {
  return (
    <section>
      <h2>Calendar</h2>

      <div className="calendar-box">
        <div className="calendar-header">
          <button
            onClick={() =>
              setCalendarDate(
                new Date(
                  calendarDate.getFullYear(),
                  calendarDate.getMonth() - 1,
                  1
                )
              )
            }
          >
            Previous
          </button>

          <h3>
            {calendarDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h3>

          <button
            onClick={() =>
              setCalendarDate(
                new Date(
                  calendarDate.getFullYear(),
                  calendarDate.getMonth() + 1,
                  1
                )
              )
            }
          >
            Next
          </button>
        </div>

        <div className="calendar-weekdays">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        <div className="calendar-grid">
          {getMonthDays(calendarDate).map((day, index) => {
            if (day === null) {
              return <div className="calendar-day empty" key={index}></div>;
            }

            const dateString = formatDate(
              calendarDate.getFullYear(),
              calendarDate.getMonth(),
              day
            );

            const dueTasks = tasks.filter(
              (task) => task.dueDate === dateString
            );

            return (
              <button
                className={`calendar-day ${
                  selectedDate === dateString ? "selected-day" : ""
                }`}
                key={index}
                onClick={() => setSelectedDate(dateString)}
              >
                <strong>{day}</strong>

                {dueTasks.length > 0 && (
                  <small>{dueTasks.length} task</small>
                )}
              </button>
            );
          })}
        </div>

        <div className="selected-date-panel">
          <h3>Tasks due on {selectedDate}</h3>

          {tasks.filter((task) => task.dueDate === selectedDate).length === 0 ? (
            <p>No tasks for this date.</p>
          ) : (
            tasks
              .filter((task) => task.dueDate === selectedDate)
              .map((task) => (
                <div className="task-card" key={task.id}>
                  {task.title}
                </div>
              ))
          )}
        </div>
      </div>
    </section>
  );
}

export default CalendarView;