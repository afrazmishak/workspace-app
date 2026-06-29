/* eslint-disable react-hooks/purity */
import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import "./App.css";
import TaskModal from "./components/TaskModal"
import NoteModal from "./components/NoteModal";
import CalendarView from "./components/CalendarView";
import Notes from "./components/Notes";
import Board from "./components/Board";
import { loadData, saveData } from "./utils/storage";
import { getToday, getMonthDays, formatDate } from "./utils/data";

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
          <Board
            taskSearch={taskSearch}
            setTaskSearch={setTaskSearch}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            handleDragEnd={handleDragEnd}
            newTask={newTask}
            setNewTask={setNewTask}
            newTaskDate={newTaskDate}
            setNewTaskDate={setNewTaskDate}
            addTask={addTask}
            columns={columns}
            filteredTasks={filteredTasks}
            getToday={getToday}
            setSelectedTask={setSelectedTask}
            deleteTask={deleteTask}
            moveTask={moveTask}
          />
        )}

        {view === "notes" && (
          <Notes
            noteSearch={noteSearch}
            setNoteSearch={setNoteSearch}
            noteTitle={noteTitle}
            setNoteTitle={setNoteTitle}
            noteBody={noteBody}
            setNoteBody={setNoteBody}
            addNote={addNote}
            filteredNotes={filteredNotes}
            setSelectedNote={setSelectedNote}
            deleteNote={deleteNote}
          />
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