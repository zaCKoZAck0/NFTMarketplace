import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import axios from 'axios'
import Web3Modal from 'web3modal'
import Image from 'next/image'



import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function ResellNFT() {
  const [formInput, updateFormInput] = useState({ price: '', image: '' })
  const [priceInInr, setPriceInInr] = useState(null)
  const [formError, setFormError] = useState({
    asset: "",
    id: "",
    price: "",
  })
  const router = useRouter()
  const { id, tokenURI } = router.query
  const { image, price } = formInput

  useEffect(() => {
    fetchNFT()
  }, [id])

  async function fetchNFT() {
    if (!tokenURI) return
    const meta = await axios.get(tokenURI)
    updateFormInput(state => ({ ...state, image: meta.data.image }))
  }

  async function listNFTForSale() {
    if (!price) return
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const priceFormatted = ethers.utils.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    let listingPrice = await contract.getListingPrice()

    listingPrice = listingPrice.toString()
    let transaction = await contract.resellToken(id, priceFormatted, { value: listingPrice })
    await transaction.wait()
   
    router.push('/')
  }

  return (
    <div className="flex justify-center mt-8">
    <div className=" flex flex-col pb-12 justify-items-end overflow-hidden">
    <div className="rounded border p-4 m-4 shadow-lg">
    {
        image && (
          <Image alt='' width={300} height={300} src={image} />
        )
      }</div>
        <input
          placeholder="Asset Price in Matic"
          className={`mt-2 border rounded p-4 mr-2 grow ${(formError.price!=='')?" border-red-500":""}`}
        onChange={e => {
          if(!(Number(e.target.value)>=0))
        setFormError({...formError, price:"Price should be numeric"})
        else if(Number(e.target.value)>99999999)
        setFormError({...formError, price:"Too Large Value"})
        else
        {
        setFormError({...formError, price:""})
        setPriceInInr(76.55*Number(e.target.value))
        updateFormInput({ ...formInput, price: e.target.value})  
      }}}
          />
          { 
            (formError.price!=='')?(<p className=' text-red-500 justify-center'>{formError.price}</p>):""
          }
          {
            (priceInInr>0)?(
              <>
              <p>apx. ₹{priceInInr}</p>
              <p className=' underline'><a href='https://coinmarketcap.com/currencies/polygon/matic/inr/'>Check Current exchange rates.</a></p></>
            ):""
          }
        <button className="mt-2 shadow-lg w-full shadow-blue-500/50 bg-blue-500 hover:scale-95 transition-all text-white font-bold py-2 px-12 rounded" onClick={listNFTForSale}>
        List NFT
        </button>
      </div>
       
    </div>
  )
}