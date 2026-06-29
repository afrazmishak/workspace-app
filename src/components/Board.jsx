import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

function Board({
  taskSearch,
  setTaskSearch,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  handleDragEnd,
  newTask,
  setNewTask,
  newTaskDate,
  setNewTaskDate,
  addTask,
  columns,
  filteredTasks,
  getToday,
  setSelectedTask,
  deleteTask,
  moveTask,
}) {
  return (
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
            <input
              type="text"
              placeholder="Enter task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />

            <input
              type="date"
              value={newTaskDate}
              onChange={(e) => setNewTaskDate(e.target.value)}
            />

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
                      <Draggable
                        key={task.id}
                        draggableId={task.id.toString()}
                        index={index}
                      >
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

                            {task.dueDate < getToday() &&
                              task.status !== "done" && (
                                <p className="overdue-label">Overdue</p>
                              )}

                            {task.description && (
                              <p className="task-description">
                                {task.description}
                              </p>
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
                              onChange={(e) =>
                                moveTask(task.id, e.target.value)
                              }
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
  );
}

export default Board;