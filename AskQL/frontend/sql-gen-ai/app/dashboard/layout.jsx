import { UserButton, UserProfile } from '@clerk/nextjs'
import React from 'react'

function DashboardLayout({children}) {
  return (
    <div>
      <div className='absolute top-0 right-4 p-4 flex items-center space-x-2'>
        <UserButton/>
      </div>
        {children}
        </div>
  )
}

export default DashboardLayout