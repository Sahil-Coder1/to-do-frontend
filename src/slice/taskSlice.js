import { createSlice } from "@reduxjs/toolkit";

const taskSlice = createSlice({
  name: "task",
  initialState: { value: [] },
  reducers: {
    add: (state, actions) => {
      state.value.push(actions.payload);
    },
    remove: (state, actions) => {
      state.value.splice(actions.payload, 1);
    },
    toggleCompleted: (state, action) => {
      const task = state.value.find((t) => t._id === action.payload);
      if (task) {
        task.completed = !task.completed;
      }
    },
    updateTask: (state, action) => {
      const { _id, title, description, completed } = action.payload;

      const taskIndex = state.tasks.findIndex((task) => task._id === _id);

      if (taskIndex !== -1) {
        if (title !== undefined) state.tasks[taskIndex].title = title;
        if (description !== undefined)
          state.tasks[taskIndex].description = description;
        if (completed !== undefined)
          state.tasks[taskIndex].completed = completed;
      }
    },
  },
});

export const { add, remove, toggleCompleted, updateTask } = taskSlice.actions;
export default taskSlice.reducer;
