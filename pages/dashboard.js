import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import Image from 'next/image'


import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    const data = await contract.fetchItemsListed()

    const items = await Promise.all(data.map(async i => {
      console.log(i)
      const tokenUri = await contract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
      }
      return item
    }))

    setNfts(items)
    setLoadingState('loaded') 
  }
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No NFTs listed</h1>)
  if (loadingState !== 'loaded')
  return (
    <>
    <div className='flex items-center justify-center'>
    <Image alt='loading..' src="/loading.gif" width={300} height={300}  ></Image>
    </div>
    <div className='flex items-center justify-center'>
    <p>Fetching Data From the Blockchain</p>
    
    </div>
    </>
    )
  return (
    <div>
      <div className="p-4">
        <h2 className="text-2xl py-2">Items Listed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => {
              
              
              return (
              <div key={i} className="border shadow-lg rounded-xl overflow-hidden">
                <Image alt={nft.name} src={nft.image} height={500} width={500}/>
                <div className="px-4">  
                </div>
                <div className="p-4 pt-2">
                <p className=' text-xs'>Price</p>
                <div className='flex'>
                  <Image title='Matic' alt='' src={'/ethereum.png'} width={30} height={30}/>
                  <p className="text-2xl font-bold pl-1">{nft.price}</p>
                  </div>
                  </div>
                  </div>
                )})
              }
        </div>
      </div>
    </div>
  )
}