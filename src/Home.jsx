import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { add, remove, toggleCompleted } from "./slice/taskSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "./components/ui/checkbox";
import { Check, Trash2, Plus, ClipboardList } from "lucide-react";
import Header from "./components/ui/Header";


function Home() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [createTodo, setcreateTodo] = useState(false);
    const dispatch = useDispatch();
    const tasks = useSelector((state) => state.taskManage.value);
    const BASE_API = import.meta.env.VITE_BASE_API;
    const SECRET = import.meta.env.VITE_SECRET;

    const handleAdd = () => {
        const res = fetch(`${BASE_API}/todos`, {
            method: "POST",
            headers: {
                "x-auth-token": SECRET,
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                title: title.trim(),
                description: description.trim(),
                completed: false
            })
        })
        if (title.trim() && description.trim()) {
            dispatch(add({ title: title.trim(), description: description.trim(), completed: false }));
            setTitle("");
            setDescription("");
            setcreateTodo(false);
        }
    };
    const handleCreate = () => {
        setcreateTodo(!createTodo);
    }

    const handleKeyPress = (e) => {
        if (e.key === "Enter") handleAdd();
    };

    return (
        <div>
            <Header />
            <div className=" justify-center items-start min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div className="flex w-full justify-center">
                    <h1 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-8">
                        ✨ My Tasks
                    </h1>
                    <div className="bg-red-400 h-10 ml-8 w-10 p-1 rounded-full text-center items-center">
                        <Plus className="mr-2 h-8 w-8 cursor-pointer text-white"
                            onClick={handleCreate}
                        />
                    </div>
                </div>

                {createTodo && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                        <Plus className="mr-2 h-8 w-8 absolute right-0 top-0 rotate-45 cursor-pointer hover:text-red-500"
                            onClick={handleCreate} />
                        <div className="space-y-4 bg-white w-96 p-6 rounded-2xl shadow-xl">
                            <Input
                                placeholder="Task Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onKeyDown={handleKeyPress}
                                className="py-5 text-lg border-2 border-blue-100 focus:border-indigo-400 focus-visible:ring-0 rounded-xl"
                            />
                            <Input
                                placeholder="Task Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                onKeyDown={handleKeyPress}
                                className="py-5 text-lg border-2 border-blue-100 focus:border-indigo-400 focus-visible:ring-0 rounded-xl"
                            />
                            <Button
                                onClick={handleAdd}
                                size="lg"
                                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                Add Task
                            </Button>
                        </div>
                    </div>
                )}


                {tasks.length === 0 ? (
                    <div className="flex flex-col items-center py-10 text-gray-500">
                        <ClipboardList className="h-10 w-10 mb-3 text-gray-400" />
                        <p className="text-lg font-medium">No tasks added yet</p>
                        <p className="text-sm">Add a task using the form above</p>
                    </div>
                ) : (

                    <ul className="space-y-4 w-full max-w-3xl mx-auto">
                        {tasks.map((task, index) => (
                            <li
                                key={index}
                                className="flex justify-between items-start p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition group"
                            >
                                <div className="flex items-start gap-3 flex-grow min-w-0">
                                    <Checkbox
                                        checked={task.completed}
                                        onCheckedChange={() => dispatch(toggleCompleted(index))}
                                        className="mt-1 flex-shrink-0"
                                    />

                                    <div className="min-w-0 overflow-hidden">
                                        <h2
                                            className={`text-lg font-semibold truncate ${task.completed ? "line-through text-gray-400" : "text-gray-800"
                                                }`}
                                        >
                                            {task.title}
                                        </h2>
                                        <p className={`text-sm overflow-ellipsis overflow-hidden ${task.completed ? "text-gray-300" : "text-gray-500"
                                            }`}>
                                            {task.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2 ml-4 flex-shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => dispatch(remove(index))}
                                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>

                )}

                {tasks.length > 0 && (
                    <p className="text-sm text-center mt-6 text-gray-500">
                        <span className="font-medium text-gray-700">{tasks.length}</span>{" "}
                        {tasks.length === 1 ? "task" : "tasks"} remaining
                    </p>
                )}
            </div>
        </div>
    );
}

export default Home;
