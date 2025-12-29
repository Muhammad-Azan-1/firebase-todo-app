import React, { Suspense } from 'react'
import EmailVerificationSent from '@/components/EmailVerification/EmailVerifcation'
const page = () => {
  return (
    <div className='w-full h-screen flex justify-center items-center'>
      <Suspense fallback={<div>Loading...</div>}>
        <EmailVerificationSent />
      </Suspense>
    </div>
  )
}

export default page