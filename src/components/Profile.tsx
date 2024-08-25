import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Note, Folder } from "../types";
import { FileText, Folder as FolderIcon } from "lucide-react";

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(true);
      setError(null);

      if (currentUser) {
        const foldersQuery = query(
          collection(db, "folders"),
          where("userId", "==", currentUser.uid),
          orderBy("name")
        );

        const notesQuery = query(
          collection(db, "notes"),
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc"),
          limit(5)
        );

        const unsubscribeFolders = onSnapshot(foldersQuery, 
          (snapshot) => {
            const foldersData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data()
            })) as Folder[];
            setFolders(foldersData);
          },
          (err) => {
            console.error("Error fetching folders:", err);
            setError("Failed to fetch folders. Please try again.");
          }
        );

        const unsubscribeNotes = onSnapshot(notesQuery, 
          (snapshot) => {
            const notesData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data()
            })) as Note[];
            setRecentNotes(notesData);
            setLoading(false);
          },
          (err) => {
            console.error("Error fetching notes:", err);
            setError("Failed to fetch notes. Please try again.");
            setLoading(false);
          }
        );

        return () => {
          unsubscribeFolders();
          unsubscribeNotes();
        };
      } else {
        setFolders([]);
        setRecentNotes([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return <div className="text-white text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  return (
    <div className="profile p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center text-white">Your Profile</h2>
      <button
        onClick={handleSignOut}
        className="bg-red-500 text-white px-4 py-2 rounded mb-4 w-full"
      >
        Sign Out
      </button>

      <h3 className="text-xl font-semibold mb-2 text-white">Your Folders</h3>
      <div className="space-y-2 mb-4">
        {folders.map((folder) => (
          <div 
            key={folder.id} 
            className="bg-white shadow-md rounded-lg p-3 cursor-pointer hover:shadow-lg transition-shadow flex items-center"
            onClick={() => navigate(`/folder/${folder.id}`)}
          >
            <FolderIcon className="text-blue-500 mr-2" size={20} />
            <span>{folder.name}</span>
          </div>
        ))}
      </div>

      <h3 className="text-xl font-semibold mb-2 text-white">Your Recent Notes</h3>
      <div className="space-y-2">
        {recentNotes.map((note) => (
          <div 
            key={note.id} 
            className="bg-white shadow-md rounded-lg p-3 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/note/${note.id}`)}
          >
            <div className="flex items-center mb-1">
              <FileText className="text-gray-500 mr-2" size={20} />
              <span className="font-semibold">{note.title}</span>
            </div>
            <div 
              className={`text-xs font-semibold px-2 py-1 rounded-full inline-block ${
                note.isPublic ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
              }`}
            >
              {note.isPublic ? 'Public' : 'Private'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;