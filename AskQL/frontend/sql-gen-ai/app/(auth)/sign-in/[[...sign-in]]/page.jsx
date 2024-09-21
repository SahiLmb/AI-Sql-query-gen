import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return(
     // to center the login page
     <div className='flex items-center justify-center h-screen'>
  <SignIn />
  </div>
  )
}