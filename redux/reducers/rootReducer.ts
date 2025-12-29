import { combineReducers } from "redux";
import todoReducer from './todoReducer'
import authReducer from './authReducer'

let rootReducer = combineReducers({
    todoState : todoReducer,
    authState : authReducer
})

export default rootReducer