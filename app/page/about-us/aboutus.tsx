import React from 'react'
import HeroSection from './HeroSection'
import MiddleSection from './MiddleSection'
import ConnectForm from './connectForm'

const AboutUs = () => {
  return (
    <>
    <div className="container-fluid">
      <HeroSection />
    </div>
    <div className="container">
      <MiddleSection />
    </div>
    <ConnectForm/>
  </>
  )
}

export default AboutUs