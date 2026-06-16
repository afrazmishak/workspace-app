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
      { id: 1, title: "Sketch workspace layout", status: "todo" },
      { id: 2, title: "Draft Q3 goals doc", status: "progress" },
      { id: 3, title: "Review team notes", status: "done" },
    ])
  );

  const [taskSearch, setTaskSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

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

  const columns = [
    { id: "todo", title: "To do" },
    { id: "progress", title: "In progress" },
    { id: "done", title: "Done" },
  ];

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      (task.description || "").toLowerCase().includes(taskSearch.toLowerCase());

    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  useEffect(() => {
    saveData("workspace_tasks", tasks);
  }, [tasks]);

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
          <button onClick={() => setView("board")}>Board</button>
          <button onClick={() => setView("notes")}>Notes</button>
          <button onClick={() => setView("calendar")}>Calendar</button>
        </nav>
      </header>

      <main>
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

            <div className="add-note">
              <input type="text" placeholder="Note title..." value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />

              <textarea placeholder="Write note..." value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
              />

              <button onClick={addNote}>Add Note</button>
            </div>

            {notes.map((note) => (
              <div className="note-card" key={note.id}>
                <div className="note-header">
                  <h3>{note.title}</h3>

                  <button onClick={() => deleteNote(note.id)}>
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
      </main>
    </div>
  );
}

export default App;