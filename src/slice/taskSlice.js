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
      const index = action.payload;
      if (state.value[index]) {
        state.value[index].completed = !state.value[index].completed;
      }
    },
  },
});

export const { add, remove, toggleCompleted } = taskSlice.actions;
export default taskSlice.reducer;
