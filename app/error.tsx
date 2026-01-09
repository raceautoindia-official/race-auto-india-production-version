/* eslint-disable @next/next/no-img-element */
'use client'
import Link from 'next/link'
import React from 'react'

const NotFound = () => {
  return (
    <>
    <div className='text-center text-primary mt-5'>
    <h3>ERROR</h3>
    <img src='/images/not found image.png' alt="not found" className='img-fluid mt-3'/>
    <h5 className='mt-4'>Sorry, the page not found</h5>
    <Link href='/'><button className='btn btn-secondary mt-4'>Go Home</button></Link>
    </div>
    </>
  )
}

export default NotFound
