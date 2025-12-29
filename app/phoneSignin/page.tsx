import React, { Suspense } from 'react'
import PhoneAuth from '@/components/PhoneAuth/PhoneAuth'

const page = () => {
  return (
    <>
      <div className='h-screen flex justify-center items-center px-2 sm:px-0'>
        <Suspense fallback={<div>Loading...</div>}>
          <PhoneAuth />
        </Suspense>
      </div>
    </>
  )
}

export default page