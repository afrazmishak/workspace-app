function Notes({
  noteSearch,
  setNoteSearch,
  noteTitle,
  setNoteTitle,
  noteBody,
  setNoteBody,
  addNote,
  filteredNotes,
  setSelectedNote,
  deleteNote,
}) {
  return (
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
        <input
          type="text"
          placeholder="Note title..."
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
        />

        <textarea
          placeholder="Write note..."
          value={noteBody}
          onChange={(e) => setNoteBody(e.target.value)}
        />

        <button onClick={addNote}>Add Note</button>
      </div>

      {filteredNotes.map((note) => (
        <div
          className="note-card"
          key={note.id}
          onClick={() => setSelectedNote(note)}
        >
          <div className="note-header">
            <h3>{note.title}</h3>

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteNote(note.id);
              }}
            >
              Delete
            </button>
          </div>

          <p>{note.body}</p>
        </div>
      ))}
    </section>
  );
}

export default Notes;