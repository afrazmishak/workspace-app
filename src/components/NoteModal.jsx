function NoteModal({ selectedNote, setSelectedNote, updateNote }) {
  if (!selectedNote) return null;

  return (
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
  );
}

export default NoteModal;