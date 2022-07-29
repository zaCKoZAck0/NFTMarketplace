import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import Image from 'next/image'

import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    /* create a generic provider and query for unsold market items */
    const projecttID = "783d8145ba424c7aaac9c928c1785a44";
    const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mumbai.infura.io/v3/${projecttID}`)
    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, provider)
    const data = await contract.fetchMarketItems()

    /*
    *  map over items returned from smart contract and format 
    *  them as well as fetch their token metadata
    */
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await contract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded') 
  }
  async function buyNft(nft) {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)

    /* user will be prompted to pay the asking proces to complete the transaction */
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')   
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price
    })
    await transaction.wait()
    loadNFTs()
  }
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>)
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
    <div className="flex justify-start">
      <div className="px-4" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => {
              let name = nft.name.trim()
              let tag = '1'
              if(name.split("#")[0]!==name){
                tag = name.split("#")[(name.split().length)-1]
              }
              return (
              <div key={i} className="border shadow-lg rounded-xl overflow-hidden">
                <Image alt={nft.name} src={nft.image} height={500} width={500}/>
                <div className="px-4">  
                <div className='flex'>
                  <p style={{}} className=" pr-1 text-2xl font-semibold">{nft.name}</p>
                  <p>#{tag}</p>
                  </div>  
                  <p className="text-gray-400">{nft.description}</p>
                </div>
                <div className="p-4 pt-2">
                <p className=' text-xs'>Price</p>
                <div className='flex'>
                  <Image title='Matic' alt='' src={'/ethereum.png'} width={30} height={30}/>
                  <p className="text-2xl font-bold pl-1">{nft.price}</p>
                </div>
                  <button className="mt-2 shadow-lg w-full shadow-blue-500/50 bg-blue-500 hover:scale-95 transition-all text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button>
                </div>
              </div>
            )})
          }
        </div>
      </div>
    </div>
  )
}