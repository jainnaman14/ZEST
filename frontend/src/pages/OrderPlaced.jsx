import React from 'react'
import { useNavigate } from 'react-router-dom'
import scooterImg from '../assets/scooter.png'
import { FaArrowRight, FaCoins } from 'react-icons/fa'

function OrderPlaced() {
  const navigate = useNavigate()
  
  // Generate a nice random order ID for visual excellence
  const mockOrderId = "FT" + Math.floor(10000000 + Math.random() * 90000000)

  return (
    <div className='min-h-screen bg-[#070814] text-white flex flex-col justify-center items-center px-4 text-center font-sans antialiased relative overflow-hidden'>
      {/* Radial lighting background glow */}
      <div className='absolute top-[30%] left-[35%] w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none' />

      {/* Main Success Container matching Screen 6 exactly */}
      <div className='w-full max-w-sm bg-[#0b0c21] rounded-[36px] border border-white/5 p-8 shadow-2xl relative space-y-6 animate-scale-in'>
        
        {/* Success header */}
        <div className='space-y-1.5'>
          <h1 className='text-2xl font-black text-amber-300 tracking-tight leading-none'>
            Yay! Payment Successful! 🎉
          </h1>
          <p className='text-xs text-slate-400 font-semibold'>
            Your order has been placed.
          </p>
        </div>

        {/* Scooter Illustration Container */}
        <div className='relative w-44 h-44 mx-auto flex items-center justify-center bg-slate-900/40 rounded-full border border-white/5 shadow-inner overflow-hidden group'>
          <img 
            src={scooterImg} 
            alt="Delivery boy riding scooter" 
            className='w-36 h-36 object-contain group-hover:scale-105 transition-transform duration-500 animate-pulse-slow' 
          />
        </div>

        {/* Order tracking metadata grid */}
        <div className='bg-white/5 rounded-3xl p-5 border border-white/5 space-y-3.5 text-left text-xs font-black uppercase text-slate-400'>
          <div className='flex justify-between items-center'>
            <span>Order ID</span>
            <span className='text-slate-100 font-black tracking-wider'>#{mockOrderId}</span>
          </div>
          <div className='flex justify-between items-center'>
            <span>Estimated Delivery</span>
            <span className='text-slate-100 font-black'>30-40 min</span>
          </div>
          <div className='flex justify-between items-center'>
            <span>Deliver to</span>
            <span className='text-slate-100 font-black'>Home</span>
          </div>
        </div>

        {/* Live track order link button */}
        <button 
          onClick={() => navigate("/my-orders")}
          className='w-full py-4 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer'
        >
          <span>Track Order Live</span>
          <FaArrowRight size={10} />
        </button>

        {/* Coin earnings reward tag at bottom */}
        <div className='inline-flex items-center gap-2 bg-amber-500/10 text-amber-300 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase border border-amber-500/20 shadow-inner w-full justify-center'>
          <FaCoins size={12} className='animate-bounce text-[#fcd34d]' />
          <span>You earned 20 coins on this order!</span>
        </div>

      </div>
    </div>
  )
}

export default OrderPlaced
