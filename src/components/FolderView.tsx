// components/FolderView.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Note, Folder } from "../types";
import AddNote from "./AddNote";

const FolderView: React.FC = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const [notes, setNotes] = useState<Note[]>([]);
  const [folder, setFolder] = useState<Folder | null>(null);

  useEffect(() => {
    if (!folderId) return;

    const fetchFolder = async () => {
      const folderDoc = await getDoc(doc(db, "folders", folderId));
      if (folderDoc.exists()) {
        setFolder({ ...folderDoc.data(), id: folderDoc.id } as Folder);
      }
    };
    fetchFolder();

    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "notes"),
      where("userId", "==", user.uid),
      where("folderId", "==", folderId)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const noteData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Note));
      setNotes(noteData);
    });

    return () => unsubscribe();
  }, [folderId]);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-white">{folder?.name}</h1>
      <p className="text-white mb-4">{folder?.description}</p>
      <AddNote defaultFolderId={folderId} />
      <div className="space-y-4 mt-8">
        <h2 className="text-2xl font-bold mb-2 text-white">Notes</h2>
        {notes.length === 0 ? (
          <p className="text-white">No notes in this folder yet.</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">{note.title}</h3>
              <p>{note.content}</p>
              <p className="text-sm text-gray-500 mt-2">
                {note.isPublic ? "Public" : "Private"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FolderView;