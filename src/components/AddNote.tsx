import React, { useState, useEffect } from "react";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Folder } from "../types";

interface AddNoteProps {
  defaultFolderId?: string;
}

const AddNote: React.FC<AddNoteProps> = ({ defaultFolderId }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [folderId, setFolderId] = useState(defaultFolderId || "");
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    const fetchFolders = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const foldersSnapshot = await getDocs(collection(db, "folders"));
      const foldersData = foldersSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Folder));
      setFolders(foldersData);
    };

    fetchFolders();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, "notes"), {
        title,
        content,
        folderId,
        userId: user.uid,
        isPublic,
        createdAt: new Date()
      });
      setTitle("");
      setContent("");
      setIsPublic(false);
      alert("Note created successfully!");
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Failed to create note. Please try again.");
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center text-white">Create a New Note</h1>
      <div className="bg-sky-200 p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="w-full p-2 rounded border border-gray-300"
            required
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note here..."
            className="w-full p-2 rounded border border-gray-300"
            rows={4}
            required
          />
          <select
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
            className="w-full p-2 rounded border border-gray-300"
            required
          >
            <option value="">Select a folder</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mr-2"
              id="isPublic"
            />
            <label htmlFor="isPublic" className="text-gray-700">Make this note public</label>
          </div>
          <button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2 rounded">
            Create Note
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddNote;