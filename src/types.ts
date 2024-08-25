import { Timestamp } from "firebase/firestore";

export interface Note {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
  userId: string;
  createdAt: Timestamp;
  folderId: string;
}

export interface Folder {
  id: string;
  name: string;
  description: string;
  userId: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}