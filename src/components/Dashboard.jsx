function Dashboard({
    tasks,
    notes,
    getToday,
    completionPercent,
    setView,
    setSelectedDate,
    setPriorityFilter,
    setSortBy,
    exportData,
    importData,
    resetData,
}) {
    return (
        <section>
            <h2>Dashboard</h2>

            <div className="dashboard-grid">
                <div className="stat-card">
                    <h3>Total Tasks</h3>
                    <p>{tasks.length}</p>
                </div>

                <div className="stat-card">
                    <h3>Completed</h3>
                    <p>{tasks.filter((task) => task.status === "done").length}</p>
                </div>

                <div
                    className="stat-card clickable"
                    onClick={() => {
                        setView("calendar");
                        setSelectedDate(getToday());
                    }}
                >
                    <h3>Due Today</h3>
                    <p>{tasks.filter((task) => task.dueDate === getToday()).length}</p>
                </div>

                <div
                    className="stat-card clickable"
                    onClick={() => {
                        setView("board");
                        setPriorityFilter("high");
                    }}
                >
                    <h3>High Priority</h3>
                    <p>{tasks.filter((task) => task.priority === "high").length}</p>
                </div>

                <div
                    className="stat-card clickable"
                    onClick={() => {
                        setView("board");
                        setSortBy("dueDate");
                    }}
                >
                    <h3>Overdue</h3>
                    <p>
                        {
                            tasks.filter(
                                (task) => task.dueDate < getToday() && task.status !== "done"
                            ).length
                        }
                    </p>
                </div>

                <div className="stat-card">
                    <h3>To Do</h3>
                    <p>{tasks.filter((task) => task.status === "todo").length}</p>
                </div>
            </div>

            <div className="progress-box">
                <h3>Task Completion</h3>
                <p>{completionPercent}% completed</p>

                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${completionPercent}%` }}
                    ></div>
                </div>
            </div>

            <div className="quick-actions">
                <h3>Quick Actions</h3>

                <div className="quick-actions-grid">
                    <button onClick={() => setView("board")}>Create Task</button>
                    <button onClick={() => setView("notes")}>Create Note</button>
                    <button onClick={() => setView("calendar")}>Open Calendar</button>
                    <button onClick={exportData}>Export Data</button>

                    <label className="import-button">
                        Import Data
                        <input
                            type="file"
                            accept="application/json"
                            onChange={importData}
                            hidden
                        />
                    </label>

                    <button onClick={resetData}>Reset Data</button>
                </div>
            </div>

            <h3>Upcoming Tasks</h3>
            {tasks
                .filter((task) => task.dueDate >= getToday() && task.status !== "done")
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .slice(0, 5)
                .map((task) => (
                    <div className="task-card" key={task.id}>
                        <div>
                            <span>{task.title}</span>
                            <p className="task-date">Due: {task.dueDate}</p>
                        </div>
                    </div>
                ))}

            <h3>Recent Notes</h3>
            {notes.slice(0, 5).map((note) => (
                <div className="note-card" key={note.id}>
                    <h3>{note.title}</h3>
                    <p>{note.body}</p>
                </div>
            ))}
        </section>
    );
}

export default Dashboard;