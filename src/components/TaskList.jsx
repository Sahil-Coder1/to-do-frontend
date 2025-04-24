import { motion, AnimatePresence } from "framer-motion";
import {
    ClipboardList,
    CheckCircle,
    AlertCircle,
    Pencil,
    Trash2,
    Plus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

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

export function TaskList({
    tasks,
    filteredTasks,
    isLoading,
    searchQuery,
    filterStatus,
    activeAction,
    handleComplete,
    handleEdit,
    confirmDelete,
    setCreateTodo,
    isItemLoading,
    darkMode
}) {
    return (
        <>
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton
                            key={i}
                            className={`h-24 w-full rounded-xl ${darkMode ? "bg-gray-700" : "bg-white/70"}`}
                        />
                    ))}
                </div>
            ) : filteredTasks.length === 0 ? (
                <motion.div
                    className={`flex flex-col items-center rounded-xl shadow-sm p-12 text-center ${darkMode ? "bg-gray-800" : "bg-white"}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className={`p-4 rounded-full mb-4 ${darkMode ? "bg-gray-700" : "bg-blue-50"}`}>
                        <ClipboardList className={`h-12 w-12 ${darkMode ? "text-gray-300" : "text-blue-500"}`} />
                    </div>
                    <h2 className={`text-xl font-semibold mb-2 ${darkMode ? "text-gray-100" : "text-gray-700"}`}>
                        {tasks.length === 0
                            ? "No tasks added yet"
                            : searchQuery
                                ? "No matching tasks found"
                                : filterStatus === "active"
                                    ? "No active tasks"
                                    : "No completed tasks"}
                    </h2>
                    <p className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
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
                            <Plus className="mr-2 h-5 w-5 text-white" /> Add Your First Task
                        </Button>
                    )}
                </motion.div>
            ) : (
                <>
                    <ul className="space-y-3 p-6">
                        <AnimatePresence>
                            {filteredTasks.map((task) => (
                                <motion.li
                                    key={task._id}
                                    variants={taskItemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    layout
                                    className={`flex justify-between items-start p-5 border-l-4 rounded-xl shadow-sm transition-all ${darkMode
                                        ? "bg-gray-700 border-l-gray-600 hover:shadow-gray-700"
                                        : "bg-white border-l-blue-500 hover:shadow-md"
                                        }`}
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
                                                    onCheckedChange={() =>
                                                        handleComplete(task._id, task.completed)
                                                    }
                                                    disabled={activeAction !== null}
                                                    className={`h-5 w-5 ${task.completed ? "bg-green-500 border-green-500" : ""}`}
                                                />
                                            )}
                                        </div>

                                        <div className="min-w-0 overflow-hidden">
                                            <h2
                                                className={`text-lg font-semibold mb-1 ${task.completed
                                                    ? "line-through text-gray-400"
                                                    : darkMode
                                                        ? "text-gray-100"
                                                        : "text-gray-800"
                                                    }`}
                                            >
                                                {task.title}
                                            </h2>
                                            {task.description && (
                                                <p
                                                    className={`text-sm mb-2 ${task.completed
                                                        ? "text-gray-300"
                                                        : darkMode
                                                            ? "text-gray-400"
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
                                                        <>
                                                            <CheckCircle className="h-3 w-3 mr-1" /> Completed
                                                        </>
                                                    ) : (
                                                        <>
                                                            <AlertCircle className="h-3 w-3 mr-1" /> Active
                                                        </>
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
                                            disabled={
                                                isItemLoading(task._id, "update") ||
                                                activeAction !== null ||
                                                task.completed
                                            }
                                            className={`rounded-lg ${task.completed
                                                ? "opacity-50 cursor-not-allowed"
                                                : "text-gray-400 hover:text-blue-500 hover:bg-blue-50"
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
                                            disabled={
                                                isItemLoading(task._id, "delete") ||
                                                activeAction !== null
                                            }
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
                        className={`flex flex-col p-6 sm:flex-row justify-between items-center mt-6 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <p className="mb-2 sm:mb-0">
                            <span
                                className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-700"
                                    }`}
                            >
                                {tasks.length}
                            </span>{" "}
                            total {tasks.length === 1 ? "task" : "tasks"}
                        </p>
                        <div className="flex gap-3">
                            <p>
                                <span
                                    className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-700"
                                        }`}
                                >
                                    {tasks.filter((t) => !t.completed).length}
                                </span>{" "}
                                active
                            </p>
                            <p>
                                <span
                                    className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-700"
                                        }`}
                                >
                                    {tasks.filter((t) => t.completed).length}
                                </span>{" "}
                                completed
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </>
    );
}
