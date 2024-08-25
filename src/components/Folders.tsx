import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Folder } from "../types";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Folder as FolderIcon } from "lucide-react";

const Folders: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "folders"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const folderData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Folder));
      setFolders(folderData);
    });

    return () => unsubscribe();
  }, []);

  const addFolder = async () => {
    const user = auth.currentUser;
    if (!user) return;

    await addDoc(collection(db, "folders"), {
      name: newFolderName,
      description: newFolderDescription,
      userId: user.uid
    });
    setNewFolderName("");
    setNewFolderDescription("");
  };

  const updateFolder = async () => {
    if (!editingFolder) return;
    await updateDoc(doc(db, "folders", editingFolder.id), {
      name: editingFolder.name,
      description: editingFolder.description
    });
    setEditingFolder(null);
  };

  const deleteFolder = async (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this folder? This action cannot be undone.")) {
      await deleteDoc(doc(db, "folders", folderId));
    }
  };

  const handleFolderClick = (folderId: string) => {
    navigate(`/folder/${folderId}`);
  };

  const handleEditClick = (e: React.MouseEvent, folder: Folder) => {
    e.stopPropagation();
    setEditingFolder(folder);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-white text-center">My Folders</h1>
      <div className="mb-4">
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="New folder name"
          className="w-full p-2 mb-2 rounded"
        />
        <input
          type="text"
          value={newFolderDescription}
          onChange={(e) => setNewFolderDescription(e.target.value)}
          placeholder="Folder description"
          className="w-full p-2 mb-2 rounded"
        />
        <button onClick={addFolder} className="bg-blue-500 text-white px-4 py-2 rounded w-full">
          Add Folder
        </button>
      </div>
      <div className="space-y-4">
        {folders.map((folder) => (
          <div 
            key={folder.id} 
            className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleFolderClick(folder.id)}
          >
            {editingFolder?.id === folder.id ? (
              <div onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editingFolder.name}
                  onChange={(e) => setEditingFolder({...editingFolder, name: e.target.value})}
                  className="w-full p-2 mb-2 rounded border"
                />
                <input
                  type="text"
                  value={editingFolder.description}
                  onChange={(e) => setEditingFolder({...editingFolder, description: e.target.value})}
                  className="w-full p-2 mb-2 rounded border"
                />
                <button onClick={updateFolder} className="bg-green-500 text-white px-4 py-2 rounded mr-2">
                  Save
                </button>
                <button onClick={() => setEditingFolder(null)} className="bg-red-500 text-white px-4 py-2 rounded">
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center mb-2">
                  <FolderIcon className="text-blue-500 mr-2" size={24} />
                  <h2 className="text-xl font-semibold">{folder.name}</h2>
                </div>
                <p className="text-gray-600 mb-2">{folder.description}</p>
                <div className="flex justify-end">
                  <button onClick={(e) => handleEditClick(e, folder)} className="text-yellow-500 mr-2">
                    <Pencil size={20} />
                  </button>
                  <button onClick={(e) => deleteFolder(e, folder.id)} className="text-red-500">
                    <Trash2 size={20} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Folders;