import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { add, remove, toggleCompleted, updateTask } from "./slice/taskSlice";
import {
    Plus,
    Trash2,
    ClipboardList,
    Pencil,
    Search,
    Calendar,
    Filter,
    CheckCircle,
    AlertCircle,
    ChevronDown,
    X
} from "lucide-react";
import Header from "@/components/ui/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const taskItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 20
        }
    },
    exit: { opacity: 0, x: -50 }
};

const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.3 }
    }
};

function Home() {
    // State variables
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [createTodo, setCreateTodo] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
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
    const searchInputRef = useRef(null);

    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);
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

    // Fetch todos when user changes
    useEffect(() => {
        if (user?._id) fetchTodos();
    }, [user]);

    // Data fetching
    const fetchTodos = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${BASE_API}/todos/${user._id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            if (!res.ok) throw new Error("Failed to fetch todos");
            const data = await res.json();
            setTasks(data);
        } catch (error) {
            console.error("Fetch error:", error.message);
            showToast("Error loading tasks", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // Task operations
    const handleAdd = async () => {
        if (!title.trim()) {
            showToast("Title is required", "warning");
            return;
        }

        setActiveAction({ type: "create", id: "new" });
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
            const newTask = await res.json();
            dispatch(add(newTask));
            setTitle("");
            setDescription("");
            setCreateTodo(false);
            showToast("Task added successfully", "success");
            await fetchTodos();
        } catch (err) {
            console.error("Add error:", err.message);
            showToast("Failed to add task", "error");
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

            const response = await res.json();
            dispatch(updateTask(response));
            setIsEditModalOpen(false);
            setEditingTaskId(null);
            setEditTitle("");
            setEditDescription("");
            showToast("Task updated successfully", "success");
            await fetchTodos();
        } catch (err) {
            console.error("Error updating task:", err);
            showToast("Failed to update task", "error");
        } finally {
            setActiveAction(null);
        }
    };

    const handleComplete = async (id, currentStatus) => {
        setActiveAction({ type: "toggle", id });
        try {
            const res = await fetch(`${BASE_API}/todos/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ completed: !currentStatus }),
            });

            if (!res.ok) throw new Error("Failed to update task");
            const updatedTask = await res.json();
            dispatch(toggleCompleted(updatedTask));
            showToast(
                currentStatus ? "Task marked as incomplete" : "Task completed",
                "success"
            );
            await fetchTodos();
        } catch (err) {
            console.error("Complete error:", err.message);
            showToast("Failed to update task status", "error");
        } finally {
            setActiveAction(null);
        }
    };

    const confirmDelete = (id) => {
        setDeleteTaskId(id);
        setIsDeleteModalOpen(true);
    };

    const deleteTask = async (id) => {
        setActiveAction({ type: "delete", id });
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
            await fetchTodos();
        } catch (err) {
            console.error("Delete error:", err.message);
            showToast("Failed to delete task", "error");
        } finally {
            setActiveAction(null);
        }
    };

    // Helper functions
    const handleKeyPress = (e) => {
        if (e.key === "Enter") handleAdd();
    };

    const handleEditKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) handleUpdate();
    };

    const isItemLoading = (id, actionType) => {
        return activeAction?.id === id && activeAction?.type === actionType;
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase());

        if (filterStatus === "all") return matchesSearch;
        if (filterStatus === "active") return matchesSearch && !task.completed;
        if (filterStatus === "completed") return matchesSearch && task.completed;

        return matchesSearch;
    });

    const showToast = (message, type) => {
        console.log(`${type.toUpperCase()}: ${message}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Header />

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    className="flex flex-col sm:flex-row items-center justify-between mb-8"
                >
                    <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4 sm:mb-0">
                        ✨ My Tasks
                    </h1>

                    <Button
                        onClick={() => setCreateTodo(true)}
                        className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 px-6 py-2 h-auto text-base font-medium shadow-md hover:shadow-lg transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Plus className="mr-2 h-5 w-5" /> Add Task
                    </Button>
                </motion.div>

                <motion.div
                    className="flex flex-col md:flex-row gap-3 mb-6"
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    transition={{ delay: 0.1 }}
                >
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            ref={searchInputRef}
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 py-2 rounded-xl border-2 border-blue-100 focus:border-indigo-400 transition-colors duration-200"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2 min-w-fit whitespace-nowrap border-2 border-blue-100 hover:border-indigo-400 rounded-xl transition-colors duration-200"
                            >
                                <Filter className="h-4 w-4" />
                                <span>
                                    {filterStatus === "all" ? "All tasks" :
                                        filterStatus === "active" ? "Active tasks" :
                                            "Completed tasks"}
                                </span>
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-40 shadow-lg rounded-lg border border-gray-100"
                        >
                            <DropdownMenuItem
                                onClick={() => setFilterStatus("all")}
                                className="cursor-pointer hover:bg-blue-50 rounded"
                            >
                                All tasks
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setFilterStatus("active")}
                                className="cursor-pointer hover:bg-blue-50 rounded"
                            >
                                Active tasks
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setFilterStatus("completed")}
                                className="cursor-pointer hover:bg-blue-50 rounded"
                            >
                                Completed
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </motion.div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton
                                key={i}
                                className="h-24 w-full rounded-xl bg-white/70"
                            />
                        ))}
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <motion.div
                        className="flex flex-col items-center bg-white rounded-xl shadow-sm p-12 text-center"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="bg-blue-50 p-4 rounded-full mb-4">
                            <ClipboardList className="h-12 w-12 text-blue-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">
                            {tasks.length === 0
                                ? "No tasks added yet"
                                : searchQuery
                                    ? "No matching tasks found"
                                    : filterStatus === "active"
                                        ? "No active tasks"
                                        : "No completed tasks"}
                        </h2>
                        <p className="text-gray-500 mb-6">
                            {tasks.length === 0
                                ? "Start by adding your first task"
                                : searchQuery
                                    ? "Try a different search term"
                                    : ""}
                        </p>
                        {tasks.length === 0 && (
                            <Button
                                onClick={() => setCreateTodo(true)}
                                className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-md hover:shadow-lg transition-all"
                            >
                                <Plus className="mr-2 h-5 w-5" /> Add Your First Task
                            </Button>
                        )}
                    </motion.div>
                ) : (
                    <>
                        <ul className="space-y-3">
                            <AnimatePresence>
                                {filteredTasks.map((task) => (
                                    <motion.li
                                        key={task._id}
                                        variants={taskItemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        layout
                                        className={`flex justify-between items-start p-5 bg-white border-l-4 rounded-xl shadow-sm hover:shadow-md transition-all ${task.completed ? "border-l-green-500" : "border-l-blue-500"}`}
                                    >
                                        <div className="flex items-start gap-4 flex-grow min-w-0">
                                            <div className="relative mt-1 flex-shrink-0">
                                                {isItemLoading(task._id, "toggle") ? (
                                                    <div className="absolute inset-0 rounded-full flex items-center justify-center">
                                                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></span>
                                                    </div>
                                                ) : (
                                                    <Checkbox
                                                        id={`task-${task._id}`}
                                                        checked={task.completed}
                                                        onCheckedChange={() => handleComplete(task._id, task.completed)}
                                                        disabled={activeAction !== null}
                                                        className={`h-5 w-5 ${task.completed ? "bg-green-500 border-green-500" : ""}`}
                                                    />
                                                )}
                                            </div>

                                            <div className="min-w-0 overflow-hidden">
                                                <h2
                                                    className={`text-lg font-semibold mb-1 ${task.completed
                                                        ? "line-through text-gray-400"
                                                        : "text-gray-800"
                                                        }`}
                                                >
                                                    {task.title}
                                                </h2>
                                                {task.description && (
                                                    <p
                                                        className={`text-sm mb-2 ${task.completed
                                                            ? "text-gray-300"
                                                            : "text-gray-500"
                                                            }`}
                                                    >
                                                        {task.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-2 text-xs">
                                                    <Badge
                                                        variant={task.completed ? "outline" : "secondary"}
                                                        className="text-xs font-normal"
                                                    >
                                                        {task.completed ? (
                                                            <><CheckCircle className="h-3 w-3 mr-1" /> Completed</>
                                                        ) : (
                                                            <><AlertCircle className="h-3 w-3 mr-1" /> Active</>
                                                        )}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-1 ml-4 flex-shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(task)}
                                                disabled={isItemLoading(task._id, "update") || activeAction !== null || task.completed}
                                                className={`text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg ${task.completed ? "opacity-50 cursor-not-allowed" : ""
                                                    }`}
                                                aria-label="Edit task"
                                            >
                                                {isItemLoading(task._id, "update") ? (
                                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></span>
                                                ) : (
                                                    <Pencil className="h-4 w-4" />
                                                )}
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => confirmDelete(task._id)}
                                                disabled={isItemLoading(task._id, "delete") || activeAction !== null}
                                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                                aria-label="Delete task"
                                            >
                                                {isItemLoading(task._id, "delete") ? (
                                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></span>
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </motion.li>
                                ))}
                            </AnimatePresence>
                        </ul>

                        <motion.div
                            className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-gray-500"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <p className="mb-2 sm:mb-0">
                                <span className="font-medium text-gray-700">{tasks.length}</span> total {tasks.length === 1 ? "task" : "tasks"}
                            </p>
                            <div className="flex gap-3">
                                <p><span className="font-medium text-gray-700">{tasks.filter(t => !t.completed).length}</span> active</p>
                                <p><span className="font-medium text-gray-700">{tasks.filter(t => t.completed).length}</span> completed</p>
                            </div>
                        </motion.div>
                    </>
                )}

                {/* Add Task Dialog */}
                <Dialog open={createTodo} onOpenChange={setCreateTodo}>
                    <DialogContent className="sm:max-w-md rounded-xl">
                        <DialogTitle className="text-xl font-semibold text-gray-800">
                            Add a New Task
                        </DialogTitle>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <label htmlFor="task-title" className="text-sm font-medium text-gray-700">
                                    Task Title <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="task-title"
                                    ref={titleInputRef}
                                    placeholder="Enter task title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    className="py-5 text-lg border-2 border-blue-100 focus:border-indigo-400 rounded-xl transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="task-description" className="text-sm font-medium text-gray-700">
                                    Description (Optional)
                                </label>
                                <Textarea
                                    id="task-description"
                                    placeholder="Enter task details"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="min-h-24 py-3 text-base border-2 border-blue-100 focus:border-indigo-400 rounded-xl transition-colors"
                                />
                            </div>
                        </div>

                        <DialogFooter className="sm:justify-between mt-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setTitle("");
                                    setDescription("");
                                    setCreateTodo(false);
                                }}
                                className="rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-colors"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAdd}
                                disabled={!title.trim() || isItemLoading("new", "create")}
                                className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 px-8 shadow-md hover:shadow-lg transition-all"
                            >
                                {isItemLoading("new", "create") ? (
                                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-5 w-5" /> Add Task
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Task Dialog */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="sm:max-w-md rounded-xl">
                        <DialogTitle className="text-xl font-semibold text-gray-800">
                            Edit Task
                        </DialogTitle>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <label htmlFor="edit-task-title" className="text-sm font-medium text-gray-700">
                                    Task Title <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="edit-task-title"
                                    ref={editTitleInputRef}
                                    placeholder="Enter task title"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onKeyDown={handleEditKeyPress}
                                    className="py-5 text-lg border-2 border-blue-100 focus:border-indigo-400 rounded-xl transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="edit-task-description" className="text-sm font-medium text-gray-700">
                                    Description (Optional)
                                </label>
                                <Textarea
                                    id="edit-task-description"
                                    placeholder="Enter task details"
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className="min-h-24 py-3 text-base border-2 border-blue-100 focus:border-indigo-400 rounded-xl transition-colors"
                                />
                            </div>
                        </div>

                        <DialogFooter className="sm:justify-between mt-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setEditTitle("");
                                    setEditDescription("");
                                }}
                                className="rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-colors"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpdate}
                                disabled={!editTitle.trim() || isItemLoading(editingTaskId, "update")}
                                className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 px-8 shadow-md hover:shadow-lg transition-all"
                            >
                                {isItemLoading(editingTaskId, "update") ? (
                                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                                ) : (
                                    <>
                                        <Pencil className="mr-2 h-5 w-5" /> Update Task
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent className="sm:max-w-md rounded-xl">
                        <DialogTitle className="text-xl font-semibold text-gray-800">
                            Confirm Deletion
                        </DialogTitle>
                        <DialogDescription className="text-gray-600">
                            Are you sure you want to delete this task? This action cannot be undone.
                        </DialogDescription>

                        <DialogFooter className="sm:justify-between mt-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-colors"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => deleteTask(deleteTaskId)}
                                disabled={isItemLoading(deleteTaskId, "delete")}
                                variant="destructive"
                                className="rounded-xl bg-red-500 hover:bg-red-600 px-8 shadow-md hover:shadow-lg transition-all"
                            >
                                {isItemLoading(deleteTaskId, "delete") ? (
                                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                                ) : (
                                    <>
                                        <Trash2 className="mr-2 h-5 w-5" /> Delete
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Floating Action Button (Mobile) */}
                <div className="sm:hidden fixed bottom-6 right-6">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Button
                            onClick={() => setCreateTodo(true)}
                            className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg"
                        >
                            <Plus className="h-6 w-6" />
                        </Button>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

export default Home;