import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    todo: []
}


let todoSlice = createSlice({
    name: 'todo',
    initialState,
    reducers: {
        ADD_TODO: (state, action) => {
            // console.log(state , action)
        },

        DELETE_TODO: (state, action) => {
            // console.log(state , action)
        },
        UPDATE_TODO: (state, action) => {
            // console.log(state , action)
        }

    }
})

export default todoSlice.reducer
export const { ADD_TODO, DELETE_TODO, UPDATE_TODO } = todoSlice.actions

