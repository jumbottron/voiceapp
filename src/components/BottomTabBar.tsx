import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home as HomeIcon, User, FolderPlus, PlusSquare } from "lucide-react";

const BottomTabBar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="bottom-nav bg-sky-700 text-white p-4 flex justify-around items-center">
      <Link
        to="/"
        className={`text-2xl ${location.pathname === "/" ? "text-sky-300" : ""}`}
      >
        <HomeIcon size={24} />
      </Link>
      <Link
        to="/folders"
        className={`text-2xl ${location.pathname === "/folders" ? "text-sky-300" : ""}`}
      >
        <FolderPlus size={24} />
      </Link>
      <Link
        to="/add-note"
        className={`text-2xl ${location.pathname === "/add-note" ? "text-sky-300" : ""}`}
      >
        <PlusSquare size={24} />
      </Link>
      <Link
        to="/profile"
        className={`text-2xl ${location.pathname === "/profile" ? "text-sky-300" : ""}`}
      >
        <User size={24} />
      </Link>
    </nav>
  );
};

export default BottomTabBar;