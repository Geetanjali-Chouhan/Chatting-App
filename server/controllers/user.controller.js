import User from "../models/user.model.js";
import { asyncHandler } from "../utilities/asyncHandler.utilities.js";
import { errorHandler } from "../utilities/errorHandler.utility.js";

// named export function create hote h
export const register = asyncHandler((req,res,next) =>{
const {fullName ,username,password,gender} = req.body;
    if(fullName || !username || !password || !gender) {
    return next(new errorHandler("all fields are required",400))
    }
    res.send("hello register")
   
}); 
export const login =(req, res,next) =>{
   res.send("hello I am login route");
}; 
 