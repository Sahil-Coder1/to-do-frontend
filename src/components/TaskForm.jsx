import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, X, Calendar } from "lucide-react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

export function TaskForm({
    type,
    isOpen,
    setIsOpen,
    title,
    setTitle,
    description,
    setDescription,
    handleSubmit,
    handleKeyPress,
}) {
    const darkMode = useSelector((state) => state.theme.darkMode);
    const isEdit = type === "edit";
    const isDelete = type === "delete";

    const handleCancel = () => {
        setIsOpen(false);
        setTitle("");
        setDescription("");
    };

    const formVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } }
    };

    if (isDelete) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent
                    className={`sm:max-w-md rounded-2xl shadow-xl transition-all ${darkMode
                        ? "bg-gray-900 border-gray-700 text-white"
                        : "bg-white border-gray-200 text-gray-900"
                        }`}
                >
                    <div className="absolute right-4 top-4">

                    </div>

                    <div className="flex flex-col items-center text-center pt-6 pb-2">
                        <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mb-4">
                            <Trash2 className="w-8 h-8 text-red-500" />
                        </div>
                        <DialogTitle className="text-2xl font-bold mb-2">Delete Task</DialogTitle>
                        <DialogDescription className="text-base text-gray-500 dark:text-gray-400 max-w-sm">
                            Are you sure you want to delete this task? This action cannot be undone.
                        </DialogDescription>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6 sm:justify-center">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            className={`w-full sm:w-auto text-base font-medium py-2 px-6 rounded-xl ${darkMode
                                ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                }`}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                handleSubmit();
                                setIsOpen(false);
                            }}
                            variant="destructive"
                            className="w-full sm:w-auto text-base font-medium py-2 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white focus:ring-4 focus:ring-red-200"
                        >
                            Delete permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent
                className={`sm:max-w-lg rounded-2xl shadow-xl transition-all ${darkMode
                    ? "bg-gray-900 border-gray-700 text-white"
                    : "bg-white border-gray-200 text-gray-900"
                    }`}
            >
                <div className="absolute right-4 top-4">

                </div>

                <div className="pt-6 pb-2">
                    <div className={`inline-flex p-2 rounded-lg mb-3 ${isEdit
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        }`}>
                        {isEdit ? <Pencil size={22} /> : <Plus size={22} />}
                    </div>
                    <DialogTitle className={`text-2xl font-bold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {isEdit ? "Edit Task" : "Create New Task"}
                    </DialogTitle>
                    <p className={`mt-1.5 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {isEdit
                            ? "Update the details of your existing task."
                            : "Add a new task to your list and start tracking your progress."}
                    </p>
                </div>

                <div className="space-y-5 py-4">
                    <div>
                        <label
                            htmlFor="task-title"
                            className={`text-sm font-medium mb-1.5 block ${darkMode ? "text-gray-300" : "text-gray-700"
                                }`}
                        >
                            Task Title <span className="text-red-500">*</span>
                        </label>
                        <Input
                            id="task-title"
                            placeholder="Enter a descriptive title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className={`py-3 px-4 text-base rounded-xl w-full transition-all border-2 focus:ring-2 focus:ring-offset-0 ${darkMode
                                ? "bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                                : "bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                                }`}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="task-description"
                            className={`text-sm font-medium mb-1.5 block ${darkMode ? "text-gray-300" : "text-gray-700"
                                }`}
                        >
                            Description
                        </label>
                        <Textarea
                            id="task-description"
                            placeholder="Add any additional details or notes"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={`min-h-32 py-3 px-4 text-base rounded-xl w-full transition-all border-2 focus:ring-2 focus:ring-offset-0 ${darkMode
                                ? "bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                                : "bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                                }`}
                        />
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        className={`w-full sm:w-auto text-base font-medium py-2.5 px-6 rounded-xl ${darkMode
                            ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700"
                            }`}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            handleSubmit();
                            setIsOpen(false);
                        }}
                        disabled={!title.trim()}
                        className={`w-full sm:w-auto text-base font-medium py-2.5 px-6 rounded-xl transition-all ${isEdit
                            ? "bg-amber-500 hover:bg-amber-600 text-white"
                            : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                            } disabled:opacity-50 disabled:cursor-not-allowed focus:ring-4 ${isEdit ? "focus:ring-amber-200" : "focus:ring-blue-200"
                            }`}
                    >
                        {isEdit ? (
                            <span className="flex items-center justify-center">
                                <Pencil className="mr-2" size={18} /> Update Task
                            </span>
                        ) : (
                            <span className="flex items-center justify-center">
                                <Plus className="mr-2" size={18} /> Add Task
                            </span>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}