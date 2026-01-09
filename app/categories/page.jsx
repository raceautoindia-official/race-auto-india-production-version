export const dynamic = "force-dynamic"
import React from 'react'
import CategoriesPage from './CategoriesPage'
import Footer from '@/components/Footer/Footer'
import BreakingNews from '@/components/BreakingNews/BreakingNews'
import Navbar from '@/components/Navbar/Navbar'
import MobileNavNew from '@/components/MobileNavbarNew/MobileNavNew'
import Navbar_V2 from '@/components/Navbar/Navbar_v2'

const page = () => {
  return (
    <>
      <BreakingNews />
      <Navbar_V2 />
      <MobileNavNew />
      <div className="main_content__position"> <CategoriesPage /></div>
      <Footer />
    </>

  )
}

export default page