export const dynamic = "force-dynamic"
import React from 'react'
import SuccessPage from './PaymentSuccess'
// import dynamic from 'next/dynamic';
// const SuccessPage = dynamic(() => import("./PaymentSuccess"), { ssr: false });

const page = () => {
  return (
    <SuccessPage/>
  )
}

export default page