import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import Image from 'next/image'
const BigNumber = require('bignumber.js');


const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ price: '', name: '',id:'', description: '' })
  const [uploading, setUploading] = useState(false)
  const [priceInInr, setPriceInInr] = useState(null)
  const [formError, setFormError] = useState({
    asset: "",
    id: "",
    price: "",
  })
  const router = useRouter()

  async function onChange(e) {
    setUploading(true)
    const file = e.target.files[0]
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
    setUploading(false)  
  }
  async function uploadToIPFS() {
    let { name, description, price, id } = formInput
    if (!name || !description || !price || !fileUrl) return
    /* first, upload to IPFS */
    if(id!=='')
    name = name+'#'+id
    const data = JSON.stringify({
      name, description, image: fileUrl
    })
    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      /* after file is uploaded to IPFS, return the URL to use it in the transaction */
      return url
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }

  async function listNFTForSale() {
    const url = await uploadToIPFS()
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    /* next, create the item */
    const price = ethers.utils.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()
    let transaction = await contract.createToken(url, price, { value: listingPrice })
    await transaction.wait()
   
    router.push('/')
  }

  return (
    <div className="flex lg:justify-center justify-start mx-2">
      <div className="w-1/2 flex flex-col pb-12 transition-all">
      <div className='lg:flex lg:justify-evenly'>
        <input 
          placeholder="Asset Name"
          className={`mt-8 border rounded p-4 mr-2 grow ${(formError.asset!=='')?" border-red-500":""}`}
          onChange={e => {
        const specialChars = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        if(specialChars.test(e.target.value))
          setFormError({...formError, asset:"Asset Name should not include special characters !,@,#,$,%..."})
          else{
          setFormError({...formError, asset:""})
          updateFormInput({ ...formInput, name: e.target.value })
        }
        }}
        />
        <input
        className={`lg:mt-8 mt-2 border rounded p-4 mr-2 grow ${(formError.id!=='')?" border-red-500":""}`}
        placeholder='#ID Default 1'
        onChange={e => {updateFormInput({ ...formInput, id: e.target.value })
      console.log(Number(e.target.value))
        if(!(Number(e.target.value)>=0))
      setFormError({...formError, id:"ID should be numeric"})
      else
      {
      setFormError({...formError, id:""})
      updateFormInput({ ...formInput, id: e.target.value })  
    }  
    }}
        />
        </div>
        { 
          (formError.asset!=='')?(<p className=' text-red-500 justify-center'>{formError.asset}</p>):""
        }
        {
          (formError.id!=='')?(<p className=' justify-end text-red-500 '>{formError.id}</p>):""
        }
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />
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
      updateFormInput({ ...formInput, price: e.target.value })  
    }  
    }}
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
        <input
          type="file"
          accept="image/*"
          name="Asset"
          className="my-4"
          onChange={onChange}
        />
        {
          (fileUrl)?(<p>File Uploaded!</p>):(uploading)?(<><div className='flex items-center justify-center'>
          <Image alt='loading..' src="/loading.gif" width={300} height={300}  ></Image>
          </div>
          <div className='flex items-center justify-center'>
          <p>Uploading Your File to IPFS please wait.</p>
          
          </div></>):""
          }
        <button onClick={listNFTForSale} className="mt-2 shadow-lg w-full shadow-blue-500/50 bg-blue-500 transition-all text-white font-bold py-2 px-12 rounded">
          Create NFT
        </button>
      </div>
    </div>
  )
}