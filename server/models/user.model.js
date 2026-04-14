import mongoose from 'mongoose'
// create database
const userSchema = new mongoose.Schema({    
        fullName:{
            type:'String',
            required:true,
        },
        username:{
            type:'String',
            required:true,
            unique: true,
        },
        password:{
            type:'String',
            required:true,
        },

        gender:{
            type:'String',
            required:true,
        },
        avatar:{
            type:'String',
            required:true,
        },
},
  {timeStamps:true}
);
// create collection
const User = mongoose.model("User",userSchema);
export default User;