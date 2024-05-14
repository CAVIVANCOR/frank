import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "./features/task/login";
import inicioReducer from "./features/task/inicio";
import datosGlobalesReducer from "./features/task/datosGlobales";

export const store = configureStore({
    reducer: {
        login: loginReducer,
        inicio: inicioReducer,
        datosGlobales: datosGlobalesReducer
    },
});

