/* eslint-disable react-hooks/purity */
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Dashboard from "./components/Dashboard";
import "./App.css";
import TaskModal from "./components/TaskModal"
import NoteModal from "./components/NoteModal";
import CalendarView from "./components/CalendarView";

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

  const [darkMode, setDarkMode] = useState(() =>
    JSON.parse(localStorage.getItem("workspace_dark")) || false
  );

  useEffect(() => {
    localStorage.setItem(
      "workspace_dark",
      JSON.stringify(darkMode)
    );
  }, [darkMode]);

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

  function exportData() {
    const workspaceData = {
      tasks,
      notes,
      exportedAt: new Date().toISOString(),
    };

    const file = new Blob(
      [JSON.stringify(workspaceData, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(file);

    const link = document.createElement("a");
    link.href = url;
    link.download = "workspace-backup.json";
    link.click();

    URL.revokeObjectURL(url);
  }

  function importData(event) {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
      const importedData = JSON.parse(e.target.result);

      if (importedData.tasks && importedData.notes) {
        setTasks(importedData.tasks);
        setNotes(importedData.notes);
      }
    }

    reader.readAsText(file);
  }

  function resetData() {
    const confirmReset = window.confirm(
      "Are you sure you want to reset all tasks and notes?"
    );

    if (!confirmReset) return;

    localStorage.removeItem("workspace_tasks");
    localStorage.removeItem("workspace_notes");

    setTasks([]);
    setNotes([]);
  }

  function handleDragEnd(result) {
    const { destination, draggableId } = result;

    if (!destination) return;

    const draggedTask = tasks.find(
      (task) => task.id.toString() === draggableId
    );

    if (!draggedTask) return;

    const updatedTask = {
      ...draggedTask,
      status: destination.droppableId,
    };

    const remainingTasks = tasks.filter(
      (task) => task.id.toString() !== draggableId
    );

    const destinationTasks = remainingTasks.filter(
      (task) => task.status === destination.droppableId
    );

    const otherTasks = remainingTasks.filter(
      (task) => task.status !== destination.droppableId
    );

    destinationTasks.splice(destination.index, 0, updatedTask);

    setTasks([...otherTasks, ...destinationTasks]);
  }

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      <header className="header">
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
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
          <Dashboard
            tasks={tasks}
            notes={notes}
            getToday={getToday}
            completionPercent={completionPercent}
            setView={setView}
            setSelectedDate={setSelectedDate}
            setPriorityFilter={setPriorityFilter}
            setSortBy={setSortBy}
            exportData={exportData}
            importData={importData}
            resetData={resetData}
          />
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

            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="board">
                <div className="add-task">
                  <input type="text" placeholder="Enter task..." value={newTask} onChange={(e) => setNewTask(e.target.value)} />

                  <input type="date" value={newTaskDate} onChange={(e) => setNewTaskDate(e.target.value)} />

                  <button onClick={addTask}>Add Task</button>
                </div>

                {columns.map((column) => (
                  <Droppable droppableId={column.id} key={column.id}>
                    {(provided) => (
                      <div
                        className="column"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        <h3>{column.title}</h3>

                        {filteredTasks
                          .filter((task) => task.status === column.id)
                          .map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                              {(provided) => (
                                <div
                                  className="task-card"
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => setSelectedTask(task)}
                                >
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

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteTask(task.id);
                                    }}
                                  >
                                    Delete
                                  </button>

                                  <select
                                    value={task.status}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => moveTask(task.id, e.target.value)}
                                  >
                                    <option value="todo">To do</option>
                                    <option value="progress">In progress</option>
                                    <option value="done">Done</option>
                                  </select>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </DragDropContext>

          </section>
        )}

        {view === "notes" && (
          <section>
            <h2>Notes</h2>

            <input
              className="search-input"
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
          <CalendarView
            tasks={tasks}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            calendarDate={calendarDate}
            setCalendarDate={setCalendarDate}
            getMonthDays={getMonthDays}
            formatDate={formatDate}
          />
        )}

        <TaskModal
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
          updateTask={updateTask}
        />
        <NoteModal
          selectedNote={selectedNote}
          setSelectedNote={setSelectedNote}
          updateNote={updateNote}
        />
      </main>
    </div>
  );
}

export default App;