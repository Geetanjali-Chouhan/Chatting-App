import React from 'react'

const User = () => {
  return (
    <div className='flex gap-3 items-center'>
      <div className="avatar  avatar-online">
        <div  className="w-12 m-1  border-[#92a6c4] rounded-full">
          <img  src="https://img.daisyui.com/images/profile/demo/gordon@192.webp" />
        </div>
      </div>
      <div>
          <h2 className='line-clamp-1'>Full Name</h2>
          <p className='text-xs'>Username</p>
      </div>
     
    </div>
  )
}

export default User
