import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Note } from "../types";
import { Pencil, Trash2, Check, X } from "lucide-react";

const NotePage: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState<Note | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNote = async () => {
      if (!noteId) return;
      try {
        const noteDoc = await getDoc(doc(db, "notes", noteId));
        if (noteDoc.exists()) {
          const fetchedNote = { ...noteDoc.data(), id: noteDoc.id } as Note;
          setNote(fetchedNote);
          setEditedNote(fetchedNote);
        } else {
          setError("Note not found");
        }
      } catch (err) {
        console.error("Error fetching note:", err);
        setError("Failed to fetch note. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [noteId]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedNote || !noteId) return;
    try {
      await updateDoc(doc(db, "notes", noteId), {
        title: editedNote.title,
        content: editedNote.content,
        isPublic: editedNote.isPublic,
      });
      setNote(editedNote);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating note:", err);
      setError("Failed to update note. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!noteId) return;
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await deleteDoc(doc(db, "notes", noteId));
        navigate("/profile");
      } catch (err) {
        console.error("Error deleting note:", err);
        setError("Failed to delete note. Please try again.");
      }
    }
  };

  const handleCancel = () => {
    setEditedNote(note);
    setIsEditing(false);
  };

  if (loading) {
    return <div className="text-white text-center mt-8">Loading...</div>;
  }

  if (error || !note) {
    return <div className="text-red-500 text-center mt-8">{error || "Note not found"}</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="mb-4 text-white">&larr; Back</button>
      <div className="bg-white shadow-md rounded-lg p-4">
        {isEditing ? (
          <div>
            <input
              type="text"
              value={editedNote?.title}
              onChange={(e) => setEditedNote({ ...editedNote!, title: e.target.value })}
              className="w-full p-2 mb-2 text-2xl font-bold border-b"
            />
            <textarea
              value={editedNote?.content}
              onChange={(e) => setEditedNote({ ...editedNote!, content: e.target.value })}
              className="w-full p-2 mb-4 min-h-[200px] border rounded"
            />
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={editedNote?.isPublic}
                onChange={(e) => setEditedNote({ ...editedNote!, isPublic: e.target.checked })}
                className="mr-2"
              />
              <label>Public</label>
            </div>
            <div className="flex justify-end">
              <button onClick={handleSave} className="bg-green-500 text-white p-2 rounded mr-2">
                <Check size={20} />
              </button>
              <button onClick={handleCancel} className="bg-red-500 text-white p-2 rounded">
                <X size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold mb-4">{note.title}</h1>
            <p className="mb-4">{note.content}</p>
            <p className="text-sm text-gray-500 mb-4">
              {note.isPublic ? "Public" : "Private"}
            </p>
            <div className="flex justify-end">
              <button onClick={handleEdit} className="text-blue-500 p-2 rounded mr-2">
                <Pencil size={20} />
              </button>
              <button onClick={handleDelete} className="text-red-500 p-2 rounded">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotePage;