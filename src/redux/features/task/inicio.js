import { createSlice } from "@reduxjs/toolkit";

const inicioSlice = createSlice({
    name: 'inicio',
    initialState: {
        inputSearch: "",
        results: [],
        currentPage: 1,
        itemsPerpage: 8,
        totalPages:1,
    },
    reducers: {
        setInputSearch: (state, action) => {
            state.inputSearch = action.payload
        },
        setResults: (state, action) => {
            state.results = action.payload
            state.currentPage = 1
            state.totalPages = Math.ceil(action.payload.length / state.itemsPerpage)
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload
        },
        setItemsPerpage: (state, action) => {
            state.itemsPerpage = action.payload
        },
        setTotalPages: (state, action) => {
            state.totalPages = action.payload
        },
        inicializarInicio: (state) => {
            state.inputSearch = "";
            state.results = [];
            state.currentPage = 1;
            state.itemsPerpage = 8;
            state.totalPages = 1;
        },
        
    },
});

export const { setInputSearch, setResults, setCurrentPage, setItemsPerpage, setTotalPages, inicializarInicio } = inicioSlice.actions;

export default inicioSlice.reducer;