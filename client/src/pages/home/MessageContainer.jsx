import React from 'react'
import User from './Users';
import Message from './Message';
import { IoIosSend } from "react-icons/io";
import { MdAdd } from "react-icons/md";
const MessageContainer = () => {
  return (
    <div className=' w-full h-screen  flex flex-col bg-[#0e1e2470] '>
      {/* user */}
      <div className=' p-3 border-b border-b-white/10'>
         <User/>
      </div>
      
      {/* message */}
      <div className='h-full overflow-y-auto p-3'>
        <Message/>
        <Message/>
        <Message/>
        <Message/>
        <Message/>
        <Message/>
        <Message/>
      </div>

       {/*sending chatting field  */}
      <div className='w-full  p-3 flex gap-2 '>
       
        <input type="text"  placeholder="Type here  . . ." className=" input rounded-4xl input-bordered input-primary w-full "/>
             
         <button className="btn text-xl text-blue-50/60 btn-circle btn-soft  btn-primary ml-1 ">
         <IoIosSend />
        </button>
         
      </div>
      
    </div>
  )
}

export default MessageContainer
