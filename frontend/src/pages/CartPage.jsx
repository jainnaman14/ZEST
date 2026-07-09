import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import CartItemCard from '../components/CartItemCard'
import { IoArrowBack } from 'react-icons/io5'
import { MdShoppingCartCheckout } from 'react-icons/md'
import { FiShoppingCart, FiInfo } from 'react-icons/fi'
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa'

function CartPage() {
    const navigate = useNavigate()
    const { cartItems, totalAmount } = useSelector(state => state.user)

    const [promo, setPromo] = useState("")
    const [discount, setDiscount] = useState(0)
    const [promoMsg, setPromoMsg] = useState("")

    const subtotal = totalAmount
    const deliveryFee = subtotal > 0 ? 2.99 : 0
    const taxes = subtotal > 0 ? 3.01 : 0
    
    const handleApplyPromo = () => {
        const code = promo.toUpperCase().trim()
        if (code === "FOODIE20" || code === "TANDOORI20" || code === "LUCKY50" || code === "SUSHI50") {
            const discAmt = subtotal * 0.20
            setDiscount(discAmt)
            setPromoMsg(`🎉 20% discount applied: -₹${discAmt.toFixed(0)}`)
        } else if (code === "FREEDEL") {
            setDiscount(0)
            setPromoMsg("🎉 Free delivery coupon applied!")
        } else {
            setDiscount(0)
            setPromoMsg("⚠️ Invalid coupon code.")
        }
    }

    const isFreeDel = promo.toUpperCase().trim() === "FREEDEL"
    const activeDeliveryFee = isFreeDel ? 0 : deliveryFee
    const grandTotal = subtotal + activeDeliveryFee + taxes - discount

    return (
        <div className='min-h-screen zest-bg text-slate-900 pb-24'>
            {/* Header */}
            <div className='sticky top-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-white/70 px-4 md:px-8 h-16 flex items-center gap-4 shadow-md'>
                <button onClick={() => navigate("/")} className='p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-700 transition cursor-pointer'>
                    <FaArrowLeft size={14} />
                </button>
                <h1 className='text-lg font-black text-slate-950 uppercase tracking-wider'>Fun Checkout</h1>
            </div>

            <div className='max-w-md mx-auto px-4 py-8 space-y-6'>
                {cartItems.length === 0 ? (
                    <div className='text-center py-20 bg-[#0b0c21] rounded-[32px] p-8 border border-orange-100 space-y-5 shadow-xl'>
                        <div className='w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto shadow-inner'>
                            <FiShoppingCart size={28} className='text-slate-400' />
                        </div>
                        <h2 className='text-lg font-black text-slate-200'>Your Cart is Empty</h2>
                        <p className='text-xs text-slate-400 font-medium max-w-xs mx-auto leading-relaxed'>Add hot and delicious foods from local kitchens to start ordering.</p>
                        <button
                            className='px-6 py-3 bg-[#ff5a36] text-white font-black rounded-2xl hover:bg-[#e04523] transition shadow-lg text-xs uppercase cursor-pointer'
                            onClick={() => navigate("/")}
                        >
                            Browse Restaurants
                        </button>
                    </div>
                ) : (
                    <div className='zest-card rounded-[32px] border border-white/70 p-6 shadow-2xl space-y-6'>
                        {/* Header info */}
                        <div className='flex justify-between items-center border-b border-orange-100 pb-4'>
                            <h2 className='font-black text-slate-950 text-lg uppercase tracking-wider'>Your Tasty Cart</h2>
                            <span className='text-xs font-bold text-slate-400'>{cartItems.length} Items</span>
                        </div>

                        {/* List Items */}
                        <div className='divide-y divide-orange-100'>
                            {cartItems.map((item, i) => (
                                <CartItemCard data={item} key={i} />
                            ))}
                        </div>

                        {/* Promo Code Strip inside the Box */}
                        <div className='pt-2 space-y-2.5'>
                            <div className='flex gap-2 bg-white/75 rounded-2xl p-1.5 border border-orange-100'>
                                <input
                                    type='text'
                                    placeholder='Add a coupon code'
                                    value={promo}
                                    onChange={(e) => setPromo(e.target.value)}
                                    className='flex-1 bg-transparent px-3 text-sm text-slate-900 placeholder-slate-400 font-extrabold focus:outline-none uppercase'
                                />
                                <button
                                    onClick={handleApplyPromo}
                                    className='px-5 py-2 zest-btn text-white font-black rounded-xl shadow transition text-xs uppercase cursor-pointer'
                                >
                                    Apply
                                </button>
                            </div>
                            {promoMsg && (
                                <p className='text-[11px] font-black text-[#10b981] px-1'>{promoMsg}</p>
                            )}
                        </div>

                        {/* Cost summary table */}
                        <div className='space-y-3 pt-2 text-xs font-black uppercase text-slate-400'>
                            <div className='flex justify-between'>
                                <span>Subtotal</span>
                                <span className='text-slate-950'>₹{subtotal}</span>
                            </div>
                            <div className='flex justify-between items-center'>
                                <span className='flex items-center gap-1'>
                                    Delivery Fee
                                    <FiInfo size={11} className='text-slate-500 cursor-pointer' onClick={() => alert("Standard delivery service charge")} />
                                </span>
                                <span className='text-slate-950'>
                                    {activeDeliveryFee === 0 ? "FREE" : `₹${activeDeliveryFee}`}
                                </span>
                            </div>
                            <div className='flex justify-between'>
                                <span>Taxes & Charges</span>
                                <span className='text-slate-950'>₹{taxes}</span>
                            </div>
                            {discount > 0 && (
                                <div className='flex justify-between text-[#10b981]'>
                                    <span>Discount Saved</span>
                                    <span>-₹{discount.toFixed(0)}</span>
                                </div>
                            )}
                            <hr className='border-orange-100' />
                            <div className='flex justify-between text-base font-black text-slate-950'>
                                <span>Total</span>
                                <span className='text-orange-600'>₹{grandTotal}</span>
                            </div>
                        </div>

                        {/* Proceed Button */}
                        <button
                          onClick={() => navigate("/checkout")}
                          className='w-full py-4 zest-btn text-white font-black text-sm rounded-2xl shadow-xl transition transform active:scale-98 flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer'
                        >
                          <span>Proceed to Fun Payment</span>
                          <FaArrowRight size={12} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CartPage
