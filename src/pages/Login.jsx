import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/slice/userSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        username: ""
    });
    const [isLoading, setIsLoading] = useState(false);

    const SECRET = import.meta.env.VITE_SECRET;
    const BASE_API = import.meta.env.VITE_BASE_API;

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const darkMode = useSelector((state) => state.theme.darkMode);

    const toggleAuthMode = () => setIsLogin(!isLogin);
    const togglePassword = () => setShowPassword((prev) => !prev);
    const toggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (isLogin) {
            try {
                const res = await fetch(`${BASE_API}/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify(formData)
                });
                const response = await res.json();

                if (response.msg) {
                    toast.error(response.msg);
                } else {
                    dispatch(setUser(response.user));
                    if (response.token) {
                        document.cookie = `token=${response.token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
                    }
                    toast.success(`Welcome Back ${response.user.username}`);
                    navigate('/');
                }
            } catch (error) {
                toast.error("Login Failed");
            } finally {
                setIsLoading(false);
            }
        } else {
            if (formData.password !== formData.confirmPassword) {
                toast.error("Passwords don't match!");
                setIsLoading(false);
                return;
            }
            try {
                const res = await fetch(`${BASE_API}/auth/register`, {
                    method: "POST",
                    headers: {
                        "x-auth-token": SECRET,
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify(formData)
                });
                const response = await res.json();
                if (response.msg) {
                    toast.error(response.msg);
                } else {
                    toast.success("Registration Successful");
                    setIsLogin(true); // Switch to login after successful registration
                }
            } catch (error) {
                toast.error("Registration Failed");
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${darkMode ? "bg-gray-900" : "bg-gradient-to-r from-blue-100 to-indigo-100"}`}>
            <div className={`rounded-2xl shadow-lg p-8 sm:p-10 w-full max-w-sm animate-in fade-in zoom-in-90 transition-colors duration-300 ${darkMode ? "bg-gray-800 text-white" : "bg-white"}`}>
                <h2 className={`text-2xl font-bold text-center mb-6 ${darkMode ? "text-white" : "text-blue-600"}`}>
                    {isLogin ? "Welcome Back 👋" : "Create an Account 🚀"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <Input
                            name="username"
                            type="text"
                            placeholder="Full Name"
                            value={formData.username}
                            onChange={handleChange}
                            className="py-5 text-base border-blue-200 focus:border-blue-400"
                            required
                        />
                    )}

                    <Input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="py-5 text-base border-blue-200 focus:border-blue-400"
                        required
                    />

                    <div className="relative">
                        <Input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="py-5 text-base pr-10 border-blue-200 focus:border-blue-400"
                            required
                            minLength={6}
                        />
                        <button
                            type="button"
                            onClick={togglePassword}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {!isLogin && (
                        <div className="relative">
                            <Input
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="py-5 text-base pr-10 border-blue-200 focus:border-blue-400"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={toggleConfirmPassword}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full py-6 text-base bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 flex items-center justify-center gap-2"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                {isLogin ? "Logging in..." : "Registering..."}
                            </>
                        ) : (
                            isLogin ? "Login" : "Register"
                        )}
                    </Button>
                </form>

                <p className={`text-sm text-center mt-6 ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                        onClick={toggleAuthMode}
                        className={`hover:underline focus:outline-none ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                        disabled={isLoading}
                    >
                        {isLogin ? "Register" : "Login"}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;