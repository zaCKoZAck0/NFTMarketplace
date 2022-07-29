/* pages/_app.js */
import '../styles/globals.css'
import Link from 'next/link'
import { useRef, useState } from 'react'
import Image from 'next/image'

function MyApp({ Component, pageProps }) {

  return (
    <div>
      <nav className="border-b lg:p-6 p-2">
      <div className='flex items-center justify-center lg:justify-start'>
      <Image alt='logo' src='/ethereum.png' width={50} height={50} />
      <p className='lg:text-4xl text-2xl mt-2 font-bold text-blue-500 ml-2 lg:ml-4'>NFT</p>
        <p className="lg:text-4xl text-2xl mt-2 font-bold lg:mr-4">Marketplace</p>
        </div>
        
        <div className="flex items-center justify-center lg:justify-start mt-4">
          <Link href="/">
            <a className={
              `mr-4 lg:text-lg font-semibold ${((typeof window === "undefined") || window.location.pathname ==='/')?"text-white px-2 bg-blue-500 rounded":"text-blue-500"}`}>
              Home 
            </a>
          </Link>
          <Link href="/create-nft">
            <a className={
              `mr-4 lg:text-lg font-semibold ${((typeof window !== "undefined") && window.location.pathname==='/create-nft')?"text-white px-2 bg-blue-500 rounded":"text-blue-500"}`}>
              Sell NFT
            </a>
          </Link>
          <Link href="/my-nfts">
            <a className={
              `mr-4 lg:text-lg font-semibold ${((typeof window !== "undefined") && window.location.pathname==='/my-nfts')?"text-white px-2 bg-blue-500 rounded":"text-blue-500"}`}>
              My NFTs
            </a>
          </Link>
          <Link href="/dashboard">
            <a className={
              `mr-4 lg:text-lg font-semibold ${((typeof window !== "undefined") && window.location.pathname==='/dashboard')?"text-white px-2 bg-blue-500 rounded":"text-blue-500"}`}>
              Dashboard
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp