import React from 'react'
import UserSidebar from './UserSidebar'
import MessageContainer from './MessageContainer'
const home = () => {
  return (
    
    <div className='flex h-screen w-screen'>
       <UserSidebar/>
      <MessageContainer/>
    </div>
   
    
  )
}

export default home
