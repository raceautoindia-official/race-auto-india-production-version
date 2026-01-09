export const dynamic = "force-dynamic"
import React from 'react'
import SubscriptionProfile from '../support/subscription'
import { cookies } from 'next/headers';

const page = async() => {
      const cookieStore = await cookies();
      const token: any = cookieStore.get("authToken");
  return (
    <SubscriptionProfile token={token.value}/>
  )
}

export default page