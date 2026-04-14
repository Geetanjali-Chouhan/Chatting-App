import React from 'react'
import { FaSearch } from "react-icons/fa";
import User from './Users';
const UserSidebar = () => {
  return (
    <div className='max-w-[20em] w-full h-screen  flex flex-col'>
      {/* Main logo and headong */}

      <h1 className='bg-black/0 mx-1 rounded-lg  mt-3 px-2 py-1 text-[#5183CF] text-xl font-extrabold'> <span className='text-3xl shadow-accent/0 bg-[#5183CF] pr-2 pl-0.5 mr-1 rounded-3xl 65'>🗯</span><span className='text-2xl font-serif text-white'>G<span className='text-xl font-serif'>upshupApp</span></span></h1>
      
     
      {/* search bar */}
      <div className='p-3 bg-black/1'>
        <label className="input">
          <input  type="search" required placeholder="Search" />
          <FaSearch />
        </label>
      </div>

     {/*multiple user */}
      <div className='h-full px-3 overflow-y-auto'> 
         <User/>
         <User/>
         <User/>
         <User/>
         <User/>
         <User/>
         <User/>
         <User/>
         <User/>
         <User/>
         <User/>
         <User/>
         <User/>
         <User/>
         <User/>
         <User/>
         <User/>
      </div>

      {/* logout and profile */}
      <div className='flex items-center    justify-between p-2'>
          <div className="avatar">
            <div className="w-12 border-2 border-[#6685b9] rounded-full">
              <img src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp" />
            </div>
          </div>
          <button className=" bg-[#2d5a9d] btn-md  btn  btn-primary">Logout</button>
          
{/* <button className="btn btn-primary">Primary</button> */}
      </div>
    </div>
  )
}

export default UserSidebar
