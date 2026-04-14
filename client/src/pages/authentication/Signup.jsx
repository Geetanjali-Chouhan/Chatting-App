import React, { useState } from 'react'
import { RiMapPinUserFill } from "react-icons/ri";
import { MdOutlineLockPerson } from "react-icons/md";
import { MdOutlineCancel } from "react-icons/md";
import { Link } from "react-router-dom";
const Signup = () => {

  
    const [signupData,setSignupData]= useState({
      username:"",
      password:"",
      confirmPassword:"",
    })
    
   const handleInputChange =(e)=>{
   
    setSignupData({
      ...signupData,
      [e.target.name]:e.target.value
      }
    );
    console.log(signupData)
   }

  return (
    

<div className='flex justify-center p-6 items-center min-h-screen '>
 <div className='  max-w-100   w-full flex flex-col gap-3 bg-base-300 p-6 rounded-3xl'>
     <span className='text-white flex gap-35 '>
       <h2 className=' text-white/80  text-3xl ml-3 text-center font-bold'>Signup</h2> 
         <span className='text-2xl ml-20'>
          <Link to ='/'>{<MdOutlineCancel />}</Link>
         </span>
     </span>

  <div className='mt-3 '>
    {/* username input field */}
    <label className="input validator">
      <input type="text"required
      placeholder="Username"
      name='username'
      onChange={handleInputChange}
      pattern="[A-Za-z][A-Za-z0-9\-]*"
      minLength="3"
      maxLength="30"
      title="Only letters, numbers or dash"/>
      <RiMapPinUserFill />
    </label>
    <div className="validator-hint">
    </div>

    {/* password field */}
    <label className="input validator">
     <input
     type="password"
     required
     placeholder="Password"
     name='password'
     onChange={handleInputChange}
     minLength="8"
     pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
     title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"/>
     <MdOutlineLockPerson />
    </label>
     <p className="validator-hint hidden">
     Must be more than 8 characters, including
     <br />At least one number <br />At least one lowercase letter 
     <br />At least one uppercase letter
     </p>

    {/* confirm password field */}
    <label className="input validator mt-3">
     <input
     type="password"
     required
     placeholder="Confirm Password"
     name='confirmPassword'
     onChange={(e)=>handleInputChange(e)}
     minLength="8"
     pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
     title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"/>
     <MdOutlineLockPerson />
    </label>
     <p className="validator-hint hidden">
     Must be more than 8 characters, including
     <br />At least one number <br />At least one lowercase letter 
     <br />At least one uppercase letter
     </p>
  </div>


     <button className="text-grey text-lg mr-8 font-serifbold bg-[#2272a7] btn btn-active">Signup</button>

     <p className='text-gray-400'>Already have an account?
        <Link to ='/login'className='text-blue-400 underline'>  Login</Link>
     </p>

 </div>  
</div>
  
 )
}

export default Signup