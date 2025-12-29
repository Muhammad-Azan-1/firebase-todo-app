import React, { Suspense } from 'react'
import SigninForm from '@/components/SigninForm/SigninForm'
const page = () => {
  return (
    <>
      <div className='h-screen flex justify-center items-center px-2 sm:px-0'>
        <Suspense fallback={<div>Loading...</div>}>
          <SigninForm />
        </Suspense>
      </div>
    </>
  )
}

export default page