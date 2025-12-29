import React, { Suspense } from 'react'
import ConfirmResetPassword from '@/components/_ConfirmResetPassword/confirmResetPassword'

const page = () => {
  return (
    <div className='w-full h-screen flex justify-center items-center'>
      <Suspense fallback={<div>Loading...</div>}>
        <ConfirmResetPassword />
      </Suspense>
    </div>
  )
}

export default page