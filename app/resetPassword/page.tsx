import React, { Suspense } from 'react'
import ResetPassword from '@/components/ResetPassword/ResetPassword'

const page = () => {
  return (
    <div className='flex justify-center items-center h-screen w-full'>
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPassword />
      </Suspense>
    </div>
  )
}

export default page