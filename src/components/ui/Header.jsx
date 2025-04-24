import React from "react";
import { Menu, Sun, Moon } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "@/slice/userSlice";
import { toggleDarkMode } from "@/slice/themeSlice";

const Header = () => {
    const user = useSelector((state) => state.user.user);
    const darkMode = useSelector((state) => state.theme.darkMode);
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(clearUser());
        localStorage.removeItem("token");
    };

    const handleToggleDarkMode = () => {
        dispatch(toggleDarkMode());
    };

    return (
        <header className={`w-full ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} shadow-sm sticky top-0 z-50 transition-colors duration-200`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                <div className={`text-xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'} tracking-wide`}>
                    TaskTracker
                </div>

                <nav className="flex items-center gap-4">


                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} font-medium`}>
                                {user.username || user.email}
                            </span>
                            <button
                                onClick={handleLogout}
                                className={`p-2 rounded-md ${darkMode ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-red-100 text-red-600'} transition`}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <button className={`p-2 rounded-md ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-100'} transition`}>
                                Login
                            </button>
                        </div>
                    )}

                    <button
                        onClick={handleToggleDarkMode}
                        className={`p-2 rounded-md ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-100'} transition`}
                        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {darkMode ? (
                            <Sun className="h-5 w-5 text-yellow-300" />
                        ) : (
                            <Moon className="h-5 w-5 text-gray-700" />
                        )}
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default Header;