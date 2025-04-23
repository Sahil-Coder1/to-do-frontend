import React from "react";
import { Menu } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "@/slice/userSlice";

const Header = () => {
    const user = useSelector((state) => state.user.user);
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(clearUser());
        localStorage.removeItem("token");
    };

    return (
        <header className="w-full bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                <div className="text-xl font-bold text-blue-600 tracking-wide">
                    TaskTracker
                </div>

                <nav className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-blue-600 font-medium">{user.username || user.email}</span> {/* Display user name or email */}
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-md hover:bg-red-100 transition"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <button className="p-2 rounded-md hover:bg-blue-100 transition">
                                Login
                            </button>
                        </div>
                    )}

                    <button className="p-2 rounded-md hover:bg-blue-100 transition md:hidden">
                        <Menu className="h-6 w-6 text-blue-600" />
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default Header;
