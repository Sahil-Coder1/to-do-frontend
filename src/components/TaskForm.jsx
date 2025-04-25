import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, X, Calendar, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

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
    isLoading,
    inputRef,
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
        hidden: { opacity: 0, y: 20, scale: 0.98 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 500
            }
        }
    };

    if (isDelete) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-2xl">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={formVariants}
                        className={`${darkMode ? "bg-gray-900" : "bg-white"}`}
                    >
                        <div className="relative">

                            <div className="flex flex-col items-center text-center px-8 pt-12 pb-6">
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-red-500/10 blur-xl rounded-full" />
                                    <div className="relative bg-red-500/10 p-4 rounded-full">
                                        <Trash2 className="w-8 h-8 text-red-500" />
                                    </div>
                                </div>
                                <DialogTitle className="text-2xl font-bold tracking-tight mb-2">
                                    Delete Task
                                </DialogTitle>
                                <DialogDescription className="text-muted-foreground max-w-sm">
                                    This will permanently delete this task and cannot be undone.
                                </DialogDescription>
                            </div>

                            <DialogFooter className="flex flex-col sm:flex-row gap-4 justify-center px-8 pb-8">
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    className="w-20 h-11 rounded-xl font-medium"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        handleSubmit();
                                        setIsOpen(false);
                                    }}
                                    disabled={isLoading}
                                    className="w-fit bg-gray-900 h-11 rounded-xl font-medium gap-2"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                    Delete Permanently
                                </Button>
                            </DialogFooter>
                        </div>
                    </motion.div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-2xl">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={formVariants}
                    className={`${darkMode ? "bg-gray-900" : "bg-white"}`}
                >
                    <div className="relative">

                        <DialogHeader className="px-8 pt-8 pb-2">
                            <div className="flex items-start gap-4">
                                <div className="relative mt-1">
                                    <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-lg" />
                                    <div
                                        className={`relative p-3 rounded-lg ${isEdit
                                            ? "bg-amber-500/10 text-amber-500"
                                            : "bg-blue-500/10 text-blue-500"
                                            }`}
                                    >
                                        {isEdit ? (
                                            <Pencil className="w-5 h-5" />
                                        ) : (
                                            <Plus className="w-5 h-5" />
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-bold tracking-tight">
                                        {isEdit ? "Edit Task" : "Create New Task"}
                                    </DialogTitle>
                                    <DialogDescription className="text-muted-foreground">
                                        {isEdit
                                            ? "Update your task details below"
                                            : "Fill in the details to create a new task"}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="px-8 py-6 space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="task-title" className="text-sm font-medium">
                                        Task Title
                                    </Label>
                                    <Badge
                                        variant="outline"
                                        className="text-xs font-normal px-2 py-0.5"
                                    >
                                        Required
                                    </Badge>
                                </div>
                                <Input
                                    id="task-title"
                                    placeholder="Enter task title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    ref={inputRef}
                                    className="h-12 text-base rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="task-description" className="text-sm font-medium">
                                    Description
                                </Label>
                                <Textarea
                                    id="task-description"
                                    placeholder="Add detailed description (optional)"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="min-h-32 text-base rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Due Date</Label>
                                <Button
                                    variant="outline"
                                    className="w-full h-12 justify-start text-left font-normal rounded-xl gap-2"
                                >
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                        Set due date (coming soon)
                                    </span>
                                </Button>
                            </div>
                        </div>

                        <DialogFooter className="px-8 pb-8">
                            <div className="flex w-full gap-3">
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    className="flex-1 h-11 rounded-xl font-medium"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        handleSubmit();
                                        setIsOpen(false);
                                    }}
                                    disabled={!title.trim() || isLoading}
                                    className={`flex-1 h-11 rounded-xl font-medium gap-2 ${isEdit
                                        ? "bg-amber-600 hover:bg-amber-600/90"
                                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-600/90 hover:to-indigo-600/90"
                                        }`}
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : isEdit ? (
                                        <>
                                            <Pencil className="h-4 w-4" />
                                            Update Task
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4" />
                                            Create Task
                                        </>
                                    )}
                                </Button>
                            </div>
                        </DialogFooter>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}