// components/WelcomeScreen.tsx
import React from 'react';
import SignIn from "./SignIn";

const WelcomeScreen: React.FC = () => (
  <div className="welcome-screen p-8 max-w-2xl mx-auto text-white">
    <h1 className="text-4xl font-bold mb-4">Welcome to SkyNotes</h1>
    <p className="mb-4">
      SkyNotes is a cloud-inspired note-taking app that allows you to organize your thoughts, ideas, and tasks in a beautiful, sky-themed interface.
    </p>
    <div className="mb-4">
      <img
        src="/public/skynotes-logo.png"
        alt="SkyNotes Logo"
        className="rounded-lg shadow-md w-32 h-32 mx-auto"
      />
    </div>
    <h2 className="text-2xl font-semibold mb-2">Features:</h2>
    <ul className="list-disc list-inside mb-4">
      <li>Create and organize notes in customizable folders</li>
      <li>Default folders: Ideas, Tasks, and Journal</li>
      <li>Add descriptions to folders for better organization</li>
      <li>Choose to make notes public or keep them private</li>
      <li>View a public feed of shared notes from all users</li>
    </ul>
    <SignIn />
  </div>
);

export default WelcomeScreen;