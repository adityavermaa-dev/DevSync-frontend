import { createSlice } from "@reduxjs/toolkit";

const projectSlice = createSlice({
    name: "projects",
    initialState: {
        list: [], 
        activeProject: null, 
        loading: false,
    },
    reducers: {
        setProjects: (state, action) => {
            state.list = action.payload;
        },
        addProject: (state, action) => {
            state.list.unshift(action.payload);
        },
        updateProjectInList: (state, action) => {
            const index = state.list.findIndex(p => p._id === action.payload._id);
            if (index !== -1) {
                state.list[index] = action.payload;
            }
        },
        removeProject: (state, action) => {
            state.list = state.list.filter(p => p._id !== action.payload);
            if (state.activeProject?._id === action.payload) {
                state.activeProject = null;
            }
        },
        setActiveProject: (state, action) => {
            state.activeProject = action.payload;
        },
        setLoadingProjects: (state, action) => {
            state.loading = action.payload;
        }
    }
});

export const {
    setProjects,
    addProject,
    updateProjectInList,
    removeProject,
    setActiveProject,
    setLoadingProjects
} = projectSlice.actions;

export default projectSlice.reducer;
