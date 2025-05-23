import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { add, remove, toggleCompleted, updateTask } from "../slice/taskSlice";
import { Plus, Search, X, CheckCircle2, Clock, ListChecks, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/ui/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TaskList } from "@/components/TaskList";
import { TaskForm } from "@/components/TaskForm";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster, toast } from "sonner";

const container = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            ease: "easeOut"
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" }
    }
};

export default function Home() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [createTodo, setCreateTodo] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Start with loading true
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [activeAction, setActiveAction] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTaskId, setDeleteTaskId] = useState(null);

    const titleInputRef = useRef(null);
    const editTitleInputRef = useRef(null);

    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);
    const darkMode = useSelector((state) => state.theme.darkMode);
    const BASE_API = import.meta.env.VITE_BASE_API;

    // Focus management
    useEffect(() => {
        if (createTodo && titleInputRef.current) {
            setTimeout(() => titleInputRef.current.focus(), 100);
        }
    }, [createTodo]);

    useEffect(() => {
        if (isEditModalOpen && editTitleInputRef.current) {
            setTimeout(() => editTitleInputRef.current.focus(), 100);
        }
    }, [isEditModalOpen]);

    // Fetch tasks with skeleton loading
    useEffect(() => {
        if (user?._id) {
            fetchTodos();
        }
    }, [user]);

    const fetchTodos = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${BASE_API}/todos/${user._id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            if (!res.ok) throw new Error("Failed to fetch todos");
            const data = await res.json();

            // Smooth transition for initial load
            setTimeout(() => {
                setTasks(data);
                setIsLoading(false);
            }, 500); // Minimum loading time for better UX
        } catch (error) {
            console.error("Fetch error:", error.message);
            showToast("Error loading tasks", "error");
            setIsLoading(false);
        }
    };

    // Optimistic updates for CRUD operations
    const handleAdd = async () => {
        if (!title.trim()) {
            showToast("Title is required", "warning");
            return;
        }

        setActiveAction({ type: "create", id: "new" });

        // Optimistic update
        const tempId = Date.now().toString();
        const newTask = {
            _id: tempId,
            title: title.trim(),
            description: description.trim(),
            completed: false,
            userId: user._id,
            isOptimistic: true // Flag for optimistic updates
        };

        setTasks(prev => [...prev, newTask]);
        setTitle("");
        setDescription("");
        setCreateTodo(false);

        try {
            const res = await fetch(`${BASE_API}/todos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    completed: false,
                    userId: user._id,
                }),
            });

            if (!res.ok) throw new Error("Failed to create task");
            const serverTask = await res.json();

            // Replace optimistic task with server response
            setTasks(prev => prev.map(task =>
                task._id === tempId ? serverTask : task
            ));

            dispatch(add(serverTask));
            showToast("Task added successfully", "success");
        } catch (err) {
            console.error("Add error:", err.message);
            showToast("Failed to add task", "error");
            // Rollback optimistic update
            setTasks(prev => prev.filter(task => task._id !== tempId));
        } finally {
            setActiveAction(null);
        }
    };

    const handleEdit = (task) => {
        setEditTitle(task.title);
        setEditDescription(task.description);
        setEditingTaskId(task._id);
        setIsEditModalOpen(true);
    };

    const handleUpdate = async () => {
        if (!editTitle.trim()) {
            showToast("Title is required", "warning");
            return;
        }

        setActiveAction({ type: "update", id: editingTaskId });

        // Optimistic update
        setTasks(prev => prev.map(task =>
            task._id === editingTaskId ? {
                ...task,
                title: editTitle,
                description: editDescription,
                isOptimistic: true
            } : task
        ));

        try {
            const res = await fetch(`${BASE_API}/todos/update/${editingTaskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    title: editTitle,
                    description: editDescription,
                }),
            });

            if (!res.ok) throw new Error("Failed to update task");
            const updatedTask = await res.json();

            // Final update with server response
            setTasks(prev => prev.map(task =>
                task._id === editingTaskId ? updatedTask : task
            ));

            dispatch(updateTask(updatedTask));
            setIsEditModalOpen(false);
            showToast("Task updated successfully", "success");
        } catch (err) {
            console.error("Update error:", err.message);
            showToast("Failed to update task", "error");
            // Re-fetch to ensure consistency
            await fetchTodos();
        } finally {
            setActiveAction(null);
        }
    };

    const handleComplete = async (id, currentStatus) => {
        setActiveAction({ type: "toggle", id });

        // Optimistic update
        setTasks(prev => prev.map(task =>
            task._id === id ? { ...task, completed: !currentStatus, isOptimistic: true } : task
        ));

        try {
            const res = await fetch(`${BASE_API}/todos/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ completed: !currentStatus }),
            });

            if (!res.ok) throw new Error("Failed to update task");
            const updatedTask = await res.json();

            // Final update with server response
            setTasks(prev => prev.map(task =>
                task._id === id ? updatedTask : task
            ));

            dispatch(toggleCompleted(updatedTask));
            showToast(
                currentStatus ? "Task marked as incomplete" : "Task completed",
                "success"
            );
        } catch (err) {
            console.error("Complete error:", err.message);
            showToast("Failed to update task status", "error");
            // Re-fetch to ensure consistency
            await fetchTodos();
        } finally {
            setActiveAction(null);
        }
    };

    const deleteTask = async (id) => {
        setActiveAction({ type: "delete", id });

        // Optimistic update
        const deletedTask = tasks.find(task => task._id === id);
        setTasks(prev => prev.filter(task => task._id !== id));

        try {
            const res = await fetch(`${BASE_API}/todos/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            if (!res.ok) throw new Error("Failed to delete task");

            dispatch(remove(id));
            showToast("Task deleted successfully", "success");
            setIsDeleteModalOpen(false);
        } catch (err) {
            console.error("Delete error:", err.message);
            showToast("Failed to delete task", "error");
            // Rollback optimistic update
            if (deletedTask) {
                setTasks(prev => [...prev, deletedTask]);
            }
        } finally {
            setActiveAction(null);
        }
    };

    // Other helper functions remain the same...
    const confirmDelete = (id) => {
        setDeleteTaskId(id);
        setIsDeleteModalOpen(true);
    };

    const handleKeyPress = (e) => e.key === "Enter" && handleAdd();
    const handleEditKeyPress = (e) => e.key === "Enter" && !e.shiftKey && handleUpdate();

    const isItemLoading = (id, actionType) =>
        activeAction?.id === id && activeAction?.type === actionType;

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchQuery.toLowerCase());

        if (filterStatus === "all") return matchesSearch;
        if (filterStatus === "active") return matchesSearch && !task.completed;
        if (filterStatus === "completed") return matchesSearch && task.completed;
        return matchesSearch;
    });

    const showToast = (message, type) => {
        const toastConfig = {
            position: "top-right",
            duration: 3000,
            style: {
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                border: "none"
            }
        };

        if (type === "success") {
            toast.success(message, {
                ...toastConfig,
                icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
            });
        } else if (type === "warning") {
            toast.warning(message, toastConfig);
        } else {
            toast.error(message, toastConfig);
        }
    };

    return (
        <div className={`min-h-screen ${darkMode
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100"
            : "bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 text-gray-900"
            }`}
        >
            <Header />

            <Toaster
                richColors
                closeButton
                theme={darkMode ? "dark" : "light"}
                toastOptions={{
                    className: "rounded-xl shadow-lg",
                    style: {
                        padding: "16px"
                    }
                }}
            />

            <main className="container mx-auto px-4 py-8 max-w-5xl">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                >
                    {/* Hero Section */}
                    <motion.div
                        variants={item}
                        className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6"
                    >
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 leading-tight">
                                Task Manager
                            </h1>
                            <p className={`mt-2 text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                Organize, prioritize, and accomplish your tasks efficiently
                            </p>
                        </div>

                        <Button
                            onClick={() => setCreateTodo(true)}
                            className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 px-6 py-6 h-auto text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group hidden lg:flex"
                        >
                            <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                            Create Task
                        </Button>
                    </motion.div>

                    {/* Filter Bar */}
                    <motion.div
                        variants={item}
                        className={`p-4 rounded-2xl shadow-lg transition-all duration-300 ${darkMode
                            ? "bg-gray-800/70 border border-gray-700"
                            : "bg-white/80 backdrop-blur-sm border border-blue-100"
                            }`}
                    >
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-grow">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <Search className="h-5 w-5" />
                                </div>
                                <Input
                                    placeholder="Search tasks..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`pl-12 py-6 rounded-xl text-base border-2 focus:ring-2 focus:ring-offset-0 transition-all ${darkMode
                                        ? "bg-gray-700 border-gray-600 focus:border-blue-500 focus:ring-blue-500/20"
                                        : "bg-white border-gray-100 focus:border-blue-500 focus:ring-blue-500/20"
                                        }`}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>

                            <Tabs
                                value={filterStatus}
                                onValueChange={setFilterStatus}
                                className="w-full md:w-auto"
                            >
                                <TabsList className={`w-full grid grid-cols-3 h-12 rounded-xl transition-colors ${darkMode
                                    ? "bg-gray-700"
                                    : "bg-gray-100"
                                    }`}>
                                    <TabsTrigger
                                        value="all"
                                        className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all"
                                    >
                                        <ListChecks className="h-4 w-4 mr-2" />
                                        All
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="active"
                                        className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-lg transition-all"
                                    >
                                        <Clock className="h-4 w-4 mr-2" />
                                        Active
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="completed"
                                        className="data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all"
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Done
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </motion.div>

                    {/* Task List */}
                    <motion.div
                        variants={item}
                        className={`rounded-2xl shadow-lg overflow-hidden transition-all ${darkMode
                            ? "bg-gray-800/70 border border-gray-700"
                            : "bg-white/80 backdrop-blur-sm border border-blue-100"
                            }`}
                    >
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <div className="flex items-center">
                                <Sparkles className={`h-5 w-5 mr-3 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`} />
                                <h2 className="text-xl font-bold">
                                    {filterStatus === "all"
                                        ? "All Tasks"
                                        : filterStatus === "active"
                                            ? "Active Tasks"
                                            : "Completed Tasks"}
                                </h2>
                                <Badge
                                    variant="outline"
                                    className={`ml-3 ${darkMode ? "border-gray-600" : "border-gray-300"}`}
                                >
                                    {filteredTasks.length}
                                </Badge>
                            </div>
                        </div>

                        <TaskList
                            darkMode={darkMode}
                            tasks={tasks}
                            filteredTasks={filteredTasks}
                            isLoading={isLoading}
                            searchQuery={searchQuery}
                            filterStatus={filterStatus}
                            activeAction={activeAction}
                            handleComplete={handleComplete}
                            handleEdit={handleEdit}
                            confirmDelete={confirmDelete}
                            setCreateTodo={setCreateTodo}
                            isItemLoading={isItemLoading}
                        />
                    </motion.div>
                </motion.div>

                {/* Mobile FAB */}
                <div className="sm:hidden fixed bottom-6 right-6 z-10">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Button
                            onClick={() => setCreateTodo(true)}
                            className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-xl flex items-center justify-center"
                        >
                            <Plus className="h-8 w-8" />
                        </Button>
                    </motion.div>
                </div>

                {/* Task forms */}
                <TaskForm
                    type="add"
                    isOpen={createTodo}
                    setIsOpen={setCreateTodo}
                    title={title}
                    setTitle={setTitle}
                    description={description}
                    setDescription={setDescription}
                    handleSubmit={handleAdd}
                    handleKeyPress={handleKeyPress}
                    isLoading={isItemLoading("new", "create")}
                    inputRef={titleInputRef}
                />

                <TaskForm
                    type="edit"
                    isOpen={isEditModalOpen}
                    setIsOpen={setIsEditModalOpen}
                    title={editTitle}
                    setTitle={setEditTitle}
                    description={editDescription}
                    setDescription={setEditDescription}
                    handleSubmit={handleUpdate}
                    handleKeyPress={handleEditKeyPress}
                    isLoading={isItemLoading(editingTaskId, "update")}
                    inputRef={editTitleInputRef}
                />

                <TaskForm
                    type="delete"
                    isOpen={isDeleteModalOpen}
                    setIsOpen={setIsDeleteModalOpen}
                    handleSubmit={() => deleteTask(deleteTaskId)}
                    isLoading={isItemLoading(deleteTaskId, "delete")}
                />
            </main>
        </div>
    );
}