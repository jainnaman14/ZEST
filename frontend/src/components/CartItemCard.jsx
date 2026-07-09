import React from 'react'
import { FaMinus, FaPlus } from "react-icons/fa6"
import { RiDeleteBin6Line } from "react-icons/ri"
import { useDispatch } from 'react-redux'
import { removeCartItem, updateQuantity } from '../redux/userSlice'

function CartItemCard({ data }) {
    const dispatch = useDispatch()

    const increase = () => dispatch(updateQuantity({ id: data.id, quantity: data.quantity + 1 }))
    const decrease = () => {
        if (data.quantity <= 1) dispatch(removeCartItem(data.id))
        else dispatch(updateQuantity({ id: data.id, quantity: data.quantity - 1 }))
    }

    return (
        <div className='flex items-center gap-4 py-4 px-3.5 border-b border-white/5 last:border-b-0 text-white'>
            <img src={data.image} alt={data.name} className='w-14 h-14 rounded-2xl object-cover shrink-0 border border-white/10' />
            <div className='flex-1 min-w-0 text-left'>
                <p className='font-black text-slate-100 text-sm truncate'>{data.name}</p>
                <p className='text-xs font-bold text-slate-400 mt-0.5'>${data.price?.toFixed(2)} each</p>
            </div>
            
            <div className='flex items-center gap-3 shrink-0'>
                {/* Stepper with thin outline border like image Screen 3 */}
                <div className='flex items-center border border-white/20 rounded-xl overflow-hidden bg-white/5'>
                    <button onClick={decrease} className='px-2.5 py-1.5 text-white/60 hover:text-white transition cursor-pointer'>
                        <FaMinus size={8} />
                    </button>
                    <span className='px-1.5 text-white font-black text-xs min-w-[1.25rem] text-center'>{data.quantity}</span>
                    <button onClick={increase} className='px-2.5 py-1.5 text-white/60 hover:text-white transition cursor-pointer'>
                        <FaPlus size={8} />
                    </button>
                </div>
                
                <button 
                    onClick={() => dispatch(removeCartItem(data.id))} 
                    className='p-2 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-xl transition cursor-pointer'
                >
                  <RiDeleteBin6Line size={14} />
                </button>
            </div>
        </div>
    )
}

export default CartItemCard
