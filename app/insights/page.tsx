export const dynamic = "force-dynamic"
import React from 'react'

import BreakingNews from '@/components/BreakingNews/BreakingNews'
import Navbar_V2 from '@/components/Navbar/Navbar_v2'
import MobileNavNew from '@/components/MobileNavbarNew/MobileNavNew'
import Footer from '@/components/Footer/Footer'
import InsightsListPage from './insights'


const page = () => {
  return (
    <>

      <BreakingNews />
      <Navbar_V2 />
      <MobileNavNew />
      <div className="main_content__position"><InsightsListPage/></div>
      <Footer />
    </>
  )
}

export default page