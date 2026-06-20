/* eslint-disable react-hooks/purity */
import { useState, useEffect } from "react";
import "./App.css";

function loadData(key, fallback) {
  const savedData = localStorage.getItem(key);
  return savedData ? JSON.parse(savedData) : fallback;
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function App() {
  // STATES
  const [view, setView] = useState("board");

  const [tasks, setTasks] = useState(() =>
    loadData("workspace_tasks", [
      { id: 1, title: "Sketch workspace layout", status: "todo", dueDate: "2026-06-20", priority: "medium" },
      { id: 2, title: "Draft Q3 goals doc", status: "progress", dueDate: "2026-06-25", priority: "high" },
      { id: 3, title: "Review team notes", status: "done", dueDate: "2026-06-18", priority: "low" },
    ])
  );

  const [taskSearch, setTaskSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const [newTask, setNewTask] = useState("");
  const [newTaskDate, setNewTaskDate] = useState(getToday());

  const [notes, setNotes] = useState(() =>
    loadData("workspace_notes", [
      { id: 1, title: "Project kickoff", body: "Define milestones and owners." },
    ])
  );

  useEffect(() => {
    saveData("workspace_notes", notes);
  }, [notes]);

  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [noteSearch, setNoteSearch] = useState("");
  const [selectedNote, setSelectedNote] = useState(null)

  const columns = [
    { id: "todo", title: "To do" },
    { id: "progress", title: "In progress" },
    { id: "done", title: "Done" },
  ];

  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
        (task.description || "").toLowerCase().includes(taskSearch.toLowerCase());

      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    })
    .sort((a, b) => {
      if (sortBy === "dueDate") {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }

      return 0;
    });

  useEffect(() => {
    saveData("workspace_tasks", tasks);
  }, [tasks]);

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
    note.body.toLowerCase().includes(noteSearch.toLowerCase())
  );

  const completedTasks = tasks.filter((task) => task.status === "done").length;

  const completionPercent =
    tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);

  const [selectedTask, setSelectedTask] = useState(null);

  const [selectedDate, setSelectedDate] = useState(getToday());
  const [calendarDate, setCalendarDate] = useState(new Date());

  //FUNCTIONS
  function addTask() {
    if (newTask.trim() === "") return;

    const task = {
      id: Date.now(),
      title: newTask,
      description: "",
      status: "todo",
      dueDate: newTaskDate,
      priority: "medium"
    };

    setTasks([...tasks, task]);
    setNewTask("");
    setNewTaskDate(getToday())
  }

  function deleteTask(id) {
    setTasks(tasks.filter((task) => task.id !== id));
  }

  function moveTask(id, newStatus) {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task
      )
    )
  }

  function addNote() {
    if (noteTitle.trim() === "" && noteBody.trim() === "") return;

    const note = {
      id: Date.now(),
      title: noteTitle || "Untitled note",
      body: noteBody,
    };

    setNotes([note, ...notes]);
    setNoteTitle("");
    setNoteBody("");
  }

  function deleteNote(id) {
    setNotes(notes.filter((note) => note.id !== id));
  }

  function updateNote(id, updatedNote) {
    setNotes(
      notes.map((note) =>
        note.id === id ? updatedNote : note
      )
    )

    setSelectedNote(null);
  }

  function getToday() {
    return new Date().toISOString().slice(0, 10);
  }

  function getMonthDays(date) {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= totalDays; day++) {
      days.push(day);
    }

    return days;
  }

  function formatDate(year, month, day) {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");

    return `${year}-${mm}-${dd}`;
  }

  function updateTask(id, updatedTask) {
    setTasks(
      tasks.map((task) =>
        task.id === id ? updatedTask : task
      )
    );

    setSelectedTask(null);
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Studio</h1>
          <p>Tasks, notes, and calendar in one workspace.</p>
        </div>

        <nav className="tabs">
          <button onClick={() => setView("dashboard")}>Dashboard</button>
          <button onClick={() => setView("board")}>Board</button>
          <button onClick={() => setView("notes")}>Notes</button>
          <button onClick={() => setView("calendar")}>Calendar</button>
        </nav>
      </header>

      <main>
        {view === "dashboard" && (
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
                      (task) =>
                        task.dueDate < getToday() &&
                        task.status !== "done"
                    ).length
                  }
                </p>
              </div>

              <div className="stat-card">
                <h3>To Do</h3>
                <p>
                  {
                    tasks.filter(
                      (task) => task.status === "todo"
                    ).length
                  }
                </p>
              </div>

              <div className="progress-box">
                <h3>Task Completion</h3>

                <p>{completionPercent}% completed</p>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${completionPercent}` }}
                  ></div>
                </div>
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
              ))
            }

            <h3>Recent Notes</h3>
            {notes.slice(0, 5).map((note) => (
              <div className="note-card" key={note.id}>
                <h3>{note.title}</h3>
                <p>{note.body}</p>
              </div>
            ))}
          </section>
        )}

        {view === "board" && (
          <section>
            <h2>Board</h2>

            <input
              className="search-input"
              type="text"
              placeholder="Search tasks..."
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
            />

            <select
              className="filter-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Default order</option>
              <option value="dueDate">Sort by due date</option>
            </select>

            <div className="board">
              <div className="add-task">
                <input type="text" placeholder="Enter task..." value={newTask} onChange={(e) => setNewTask(e.target.value)} />

                <input type="date" value={newTaskDate} onChange={(e) => setNewTaskDate(e.target.value)} />

                <button onClick={addTask}>Add Task</button>
              </div>

              {columns.map((column) => (
                <div className="column" key={column.id}>
                  <h3>{column.title}</h3>

                  {filteredTasks
                    .filter((task) => task.status === column.id)
                    .map((task) => (
                      <div className="task-card" key={task.id} onClick={() => setSelectedTask(task)}>
                        <span>{task.title}</span>

                        <p className="task-date">Due: {task.dueDate}</p>

                        {task.dueDate < getToday() && task.status !== "done" && (
                          <p className="overdue-label">
                            Overdue
                          </p>
                        )}

                        {task.description && (
                          <p className="task-description">{task.description}</p>
                        )}

                        <p className={`priority ${task.priority}`}>
                          {task.priority}
                        </p>

                        <button onClick={() => deleteTask(task.id)}>
                          Delete
                        </button>

                        <select value={task.status} onChange={(e) => moveTask(task.id, e.target.value)}>
                          <option value="todo">To do</option>
                          <option value="progress">In progress</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </section>
        )}

        {view === "notes" && (
          <section>
            <h2>Notes</h2>

            <input
              className="search0-input"
              type="text"
              placeholder="Search notes..."
              value={noteSearch}
              onChange={(e) => setNoteSearch(e.target.value)}
            />

            <div className="add-note">
              <input type="text" placeholder="Note title..." value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />

              <textarea placeholder="Write note..." value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
              />

              <button onClick={addNote}>Add Note</button>
            </div>

            {filteredNotes.map((note) => (
              <div className="note-card" key={note.id} onClick={() => setSelectedNote(note)}>
                <div className="note-header">
                  <h3>{note.title}</h3>

                  <button onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}>
                    Delete
                  </button>
                </div>

                <p>{note.body}</p>
              </div>
            ))}
          </section>
        )}

        {view === "calendar" && (
          <section>
            <h2>Calendar</h2>

            <div className="calendar-box">
              <div className="calendar-header">
                <button onClick={() => setCalendarDate(
                  new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1)
                )}>Previous</button>

                <h3>
                  {calendarDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric"
                  })}
                </h3>

                <button onClick={() => setCalendarDate(
                  new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1)
                )}>Next</button>
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
                    return <div className="calendar-day empty" key={index}></div>
                  }

                  const dateString = formatDate(
                    calendarDate.getFullYear(),
                    calendarDate.getMonth(),
                    day
                  );

                  const dueTasks = tasks.filter((task) => task.dueDate === dateString);

                  return (
                    <button className={`calendar-day ${selectedDate === dateString ? "selected-day" : ""
                      }`}
                      key={index}
                      onClick={() => setSelectedDate(dateString)}
                    >
                      <strong>{day}</strong>

                      {dueTasks.length > 0 && (
                        <small>{dueTasks.length} task</small>
                      )}
                    </button>
                  )
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
        )}

        {selectedTask && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Edit Task</h2>

              <input
                value={selectedTask.title}
                onChange={(e) =>
                  setSelectedTask({
                    ...selectedTask,
                    title: e.target.value,
                  })
                }
              />

              <textarea
                placeholder="Task description..."
                value={selectedTask.description || ""}
                onChange={(e) =>
                  setSelectedTask({
                    ...selectedTask,
                    description: e.target.value,
                  })
                }
              />

              <input
                type="date"
                value={selectedTask.dueDate}
                onChange={(e) =>
                  setSelectedTask({
                    ...selectedTask,
                    dueDate: e.target.value,
                  })
                }
              />

              <select value={selectedTask.priority || "medium"}
                onChange={(e) =>
                  setSelectedTask({
                    ...selectedTask,
                    priority: e.target.value,
                  })
                }>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <button
                onClick={() =>
                  updateTask(selectedTask.id, selectedTask)
                }
              >
                Save
              </button>

              <button onClick={() => setSelectedTask(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {selectedNote && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Edit Note</h2>

              <input
                value={selectedNote.title}
                onChange={(e) =>
                  setSelectedNote({
                    ...selectedNote,
                    title: e.target.value,
                  })
                }
              />

              <textarea
                value={selectedNote.body}
                onChange={(e) =>
                  setSelectedNote({
                    ...selectedNote,
                    body: e.target.value,
                  })
                }
              />

              <button onClick={() => updateNote(selectedNote.id, selectedNote)}>
                Save
              </button>

              <button onClick={() => setSelectedNote(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;