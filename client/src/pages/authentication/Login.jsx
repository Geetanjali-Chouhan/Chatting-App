import React, { useState } from 'react'
import { RiMapPinUserFill } from "react-icons/ri";
import { MdOutlineLockPerson } from "react-icons/md";
import { MdOutlineCancel } from "react-icons/md";
import { Link } from "react-router-dom";
const Login = () => {

  const [loginData,setLoginData]= useState({
    username:"",
    password:"",
  })

  // same code ..functional update
  //  const handleInputChange =(e)=>{
    // console.log(e.target.name)
    // console.log(e.target.value)
    // setLoginData((prev)=> ({
    //   ...prev,
    //   [e.target.name]:e.target.value
    //   }));
    // };
   

   const handleInputChange =(e)=>{
    // console.log(e.target.name)
    setLoginData({
      ...loginData,
      [e.target.name]:e.target.value
      }
    );
    console.log(loginData)
   }
return (
<div className='flex justify-center p-6 items-center min-h-screen '>
 <div className='  max-w-100  w-full flex flex-col gap-3 bg-base-300 p-6 rounded-3xl'>
     <span className='text-white align-item justify-end flex gap-35 '>
       <h2 className=' text-white/80 text-3xl  text-center font-bold'>Please Login</h2> 
         <span className='text-2xl '>
          <Link to ='/'>{<MdOutlineCancel />}</Link>
         </span>
     </span>

  <div className='mt-3'>
    {/* username input field */}
    <label className="input validator">
      <input type="text"required
      placeholder="Username"
      name='username'
      onChange={handleInputChange }
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
     name='password'
     placeholder="Password"
     onChange={handleInputChange }
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


     <button className="text-grey text-lg mr-8 font-serifbold bg-[#3375c1] btn btn-active">Login</button>

     <p className='text-gray-400'>Don't have an account?&nbsp;
     <Link to ='/signup'className='text-blue-400 underline'> Sign Up</Link>
    
     </p>

 </div>  
</div>
  
 )
}

export default Login
