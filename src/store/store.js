import { configureStore, combineReducers } from "@reduxjs/toolkit";
import taskReducer from "../slice/taskSlice";
import userReducer from "../slice/userSlice";
import themeReducer from "../slice/themeSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const rootReducer = combineReducers({
  taskManage: taskReducer,
  user: userReducer,
  theme: themeReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
});

const persistor = persistStore(store);

export { store, persistor };
