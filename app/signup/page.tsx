import React, { Suspense } from 'react'
import SignupForm from '@/components/SignupForm/SignupForm'
const page = () => {
  return (
    <>
      <div className='h-screen px-2 sm:px-0 flex items-center'>
        <Suspense fallback={<div>Loading...</div>}>
          <SignupForm />
        </Suspense>
      </div>
    </>
  )
}

export default page