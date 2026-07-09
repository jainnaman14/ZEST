import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { FaLeaf, FaDrumstickBite, FaStar, FaShoppingCart } from "react-icons/fa"
import { FaMinus, FaPlus } from "react-icons/fa6"
import { useDispatch, useSelector } from 'react-redux'
import { addToCart, removeCartItem, updateQuantity, clearCart } from '../redux/userSlice'

function FoodCard({ data }) {
  const dispatch = useDispatch()
  const { cartItems } = useSelector(state => state.user)

  const cartItem = cartItems.find(i => i.id === data._id)
  const inCart = !!cartItem

  const [localQty, setLocalQty] = useState(1)
  const [flash, setFlash] = useState(false)
  const [showReplaceModal, setShowReplaceModal] = useState(false)

  const handleAdd = () => {
    const itemShopId = typeof data.shop === 'object' ? data.shop._id : data.shop
    if (cartItems.length > 0 && cartItems[0].shop !== itemShopId) {
      setShowReplaceModal(true)
      return
    }
    confirmAdd()
  }

  const confirmAdd = () => {
    const itemShopId = typeof data.shop === 'object' ? data.shop._id : data.shop
    const itemShopName = typeof data.shop === 'object' ? data.shop.name : "another restaurant"
    dispatch(addToCart({
      id: data._id,
      name: data.name,
      price: data.price,
      image: data.image,
      shop: itemShopId,
      shopName: itemShopName,
      quantity: localQty,
      foodType: data.foodType
    }))
    setFlash(true)
    setTimeout(() => setFlash(false), 800)
    setShowReplaceModal(false)
  }

  const handleReplaceCart = () => {
    dispatch(clearCart())
    confirmAdd()
  }

  const handleIncrease = () => {
    dispatch(updateQuantity({ id: data._id, quantity: cartItem.quantity + 1 }))
  }

  const handleDecrease = () => {
    if (cartItem.quantity <= 1) {
      dispatch(removeCartItem(data._id))
    } else {
      dispatch(updateQuantity({ id: data._id, quantity: cartItem.quantity - 1 }))
    }
  }

  const rating = data.rating?.average || 0

  return (
    <div className='relative rounded-2xl bg-white border border-slate-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col'>
      {/* Food type badge */}
      <div className={`absolute top-2 left-2 z-10 w-5 h-5 rounded-sm border-2 flex items-center justify-center ${data.foodType === 'veg' ? 'border-green-600 bg-white' : 'border-red-600 bg-white'}`}>
        <div className={`w-2.5 h-2.5 rounded-full ${data.foodType === 'veg' ? 'bg-green-600' : 'bg-red-600'}`} />
      </div>

      {/* Flash overlay */}
      {flash && (
        <div className='absolute inset-0 bg-green-500/20 z-20 flex items-center justify-center rounded-2xl pointer-events-none'>
          <span className='bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full'>Added ✓</span>
        </div>
      )}

      {/* Image */}
      <div className='relative w-full h-[140px] bg-slate-50 overflow-hidden'>
        <img src={data.image} alt={data.name} className='w-full h-full object-cover' />
      </div>

      {/* Info */}
      <div className='p-3 flex flex-col flex-1 gap-1'>
        <h3 className='font-bold text-slate-900 text-sm leading-tight line-clamp-2'>{data.name}</h3>
        {typeof data.shop === 'object' && data.shop.name && (
          <p className='text-[10px] font-bold text-green-600/80 uppercase tracking-wider truncate mt-0.5'>
            {data.shop.name}
          </p>
        )}

        {rating > 0 && (
          <div className='flex items-center gap-1 text-xs text-slate-500'>
            <FaStar className='text-amber-400' size={11} />
            <span className='font-semibold text-slate-700'>{rating.toFixed(1)}</span>
            <span>({data.rating?.count || 0})</span>
          </div>
        )}

        <p className='text-base font-black text-slate-900 mt-auto'>₹{data.price}</p>
      </div>

      {/* Add / Counter */}
      <div className='px-3 pb-3'>
        {!inCart ? (
          <button
            onClick={handleAdd}
            className='w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-[#16a34a] text-[#16a34a] text-sm font-bold hover:bg-green-50 active:scale-95 transition-all'
          >
            <FaPlus size={11} /> ADD
          </button>
        ) : (
          <div className='flex items-center justify-between bg-[#16a34a] rounded-xl overflow-hidden'>
            <button onClick={handleDecrease} className='px-3 py-2 text-white hover:bg-green-700 transition active:scale-90'>
              <FaMinus size={11} />
            </button>
            <span className='text-white font-bold text-sm'>{cartItem.quantity}</span>
            <button onClick={handleIncrease} className='px-3 py-2 text-white hover:bg-green-700 transition active:scale-90'>
              <FaPlus size={11} />
            </button>
          </div>
        )}
      </div>
      
      {showReplaceModal && createPortal(
        <div className='fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-[99999] px-4 animate-fade-in'>
          <div className='bg-white rounded-3xl p-6 w-full max-w-sm border border-slate-100 shadow-2xl space-y-4 text-center animate-scale-in'>
            <div className='w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mx-auto'>
              <FaShoppingCart className='text-orange-500' size={20} />
            </div>
            <h3 className='font-black text-lg text-slate-900'>Replace Cart Items?</h3>
            <p className='text-xs text-slate-500 leading-relaxed'>
              Your cart contains items from another restaurant. Discard these items and add items from this restaurant instead?
            </p>
            <div className='grid grid-cols-2 gap-2 pt-2'>
              <button
                onClick={() => setShowReplaceModal(false)}
                className='py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer'
              >
                Cancel
              </button>
              <button
                onClick={handleReplaceCart}
                className='py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold rounded-xl transition cursor-pointer'
              >
                Yes, Replace
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default FoodCard