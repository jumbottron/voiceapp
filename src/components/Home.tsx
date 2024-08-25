import React, { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Note, User } from "../types";
import { useNavigate } from "react-router-dom";
import { FileText, User as UserIcon, Clock } from "lucide-react";

interface NoteWithUser extends Note {
  user: User | null;
}

const Home: React.FC = () => {
  const [publicNotes, setPublicNotes] = useState<NoteWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotes = async () => {
      let users: Record<string, User> = {};
      try {
        const userSnapshot = await getDocs(collection(db, "users"));
        users = userSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data() as User;
          return acc;
        }, {} as Record<string, User>);

        const q = query(
          collection(db, "notes"),
          where("isPublic", "==", true),
          orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, 
          (snapshot) => {
            const notes = snapshot.docs.map((doc) => {
              const noteData = doc.data() as Note;
              return {
                ...noteData,
                id: doc.id,
                user: users[noteData.userId] || null,
                createdAt: noteData.createdAt?.toDate() || new Date()
              };
            });
            setPublicNotes(notes);
            setLoading(false);
          },
          (err) => {
            console.error("Error fetching public notes:", err);
            setError("Failed to fetch public notes. Please try again.");
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to fetch user data. Please try again.");
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const formatDate = (date: Date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="text-white text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  return (
    <div className="home p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center text-white">Public Notes Feed</h1>
      <div className="space-y-4">
        {publicNotes.map((note) => (
          <div 
            key={note.id} 
            className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow relative"
            onClick={() => navigate(`/note/${note.id}`)}
          >
            <div className="flex items-center mb-2">
              <FileText className="text-gray-500 mr-2" size={20} />
              <h2 className="text-xl font-semibold">{note.title}</h2>
            </div>
            <p className="text-gray-600 mb-8">
              {note.content.length > 100
                ? `${note.content.substring(0, 100)}...`
                : note.content}
            </p>
            <div className="flex items-center text-sm text-gray-500 absolute bottom-2 right-2">
              <UserIcon size={14} className="mr-1" />
              <span className="mr-2">{note.user?.displayName || 'Unknown User'}</span>
              <Clock size={14} className="mr-1" />
              <span>{formatDate(note.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;