import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { auth } from "./firebase";
import Profile from "./components/Profile";
import Home from "./components/Home";
import AddNote from "./components/AddNote";
import SignIn from "./components/SignIn";
import { User as FirebaseUser } from "firebase/auth";
import WelcomeScreen from "./components/WelcomeScreen";
import BottomTabBar from "./components/BottomTabBar";
import Folders from "./components/Folders";
import FolderView from "./components/FolderView";
import NotePage from "./components/NotePage";

const App: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="app flex flex-col min-h-screen bg-gradient-to-b from-sky-300 to-sky-500">
        <main className="flex-grow">
          {user ? (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/add-note" element={<AddNote />} />
              <Route path="/folders" element={<Folders />} />
              <Route path="/folder/:folderId" element={<FolderView />} />
              <Route path="/note/:noteId" element={<NotePage />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<WelcomeScreen />} />
              <Route path="/signin" element={<SignIn />} />
            </Routes>
          )}
        </main>
        {user && <BottomTabBar />}
      </div>
    </Router>
  );
};

export default App;