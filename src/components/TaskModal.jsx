function TaskModal({ selectedTask, setSelectedTask, updateTask }) {
  if (!selectedTask) return null;

  return (
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

        <select
          value={selectedTask.priority || "medium"}
          onChange={(e) =>
            setSelectedTask({
              ...selectedTask,
              priority: e.target.value,
            })
          }
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button onClick={() => updateTask(selectedTask.id, selectedTask)}>
          Save
        </button>

        <button onClick={() => setSelectedTask(null)}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default TaskModal;