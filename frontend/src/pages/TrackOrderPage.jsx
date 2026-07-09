import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { serverUrl } from '../App'
import DeliveryBoyTracking from '../components/DeliveryBoyTracking'
import { useSelector } from 'react-redux'
import { IoArrowBack } from 'react-icons/io5'
import { FaCheckCircle, FaCircle, FaMotorcycle, FaStore, FaHome } from 'react-icons/fa'
import { MdOutlineDeliveryDining } from 'react-icons/md'

// Order status steps — keys match the DB enum exactly
const STATUS_STEPS = [
    { key: "pending", label: "Order Placed", icon: FaStore, desc: "Your order has been received" },
    { key: "preparing", label: "Preparing", icon: FaCheckCircle, desc: "Restaurant is preparing your food" },
    { key: "out of delivery", label: "Out for Delivery", icon: FaMotorcycle, desc: "Rider is on the way to you" },
    { key: "delivered", label: "Delivered", icon: FaHome, desc: "Order delivered — enjoy your meal! 🍽️" },
]

const stepIndex = (status) => {
    const map = { pending: 0, preparing: 1, "out of delivery": 2, delivered: 3 }
    return map[status] ?? 0
}

function TrackOrderPage() {
    const { orderId } = useParams()
    const [currentOrder, setCurrentOrder] = useState()
    const navigate = useNavigate()
    const { socket } = useSelector(state => state.user)
    const [liveLocations, setLiveLocations] = useState({})
    const [otpInputs, setOtpInputs] = useState({})
    const [verifyingOtp, setVerifyingOtp] = useState({})
    const [otpError, setOtpError] = useState({})
    const intervalRef = useRef()

    const handleVerifyOtp = async (shopOrderId) => {
        const otp = otpInputs[shopOrderId]
        if (!otp || otp.length !== 4) return
        setVerifyingOtp(prev => ({ ...prev, [shopOrderId]: true }))
        setOtpError(prev => ({ ...prev, [shopOrderId]: "" }))
        try {
            await axios.post(`${serverUrl}/api/order/verify-delivery-otp`, {
                orderId,
                shopOrderId,
                otp
            }, { withCredentials: true })
            fetchOrder()
        } catch (error) {
            setOtpError(prev => ({ ...prev, [shopOrderId]: error?.response?.data?.message || "Invalid OTP" }))
        } finally {
            setVerifyingOtp(prev => ({ ...prev, [shopOrderId]: false }))
        }
    }

    const fetchOrder = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/order/get-order-by-id/${orderId}`, { withCredentials: true })
            setCurrentOrder(result.data)
        } catch (error) {
            console.log(error)
        }
    }

    // Poll order status every 15 seconds
    useEffect(() => {
        fetchOrder()
        intervalRef.current = setInterval(fetchOrder, 15000)
        return () => clearInterval(intervalRef.current)
    }, [orderId])

    // Socket: join this order's room + listen for live delivery location
    useEffect(() => {
        if (!socket || !orderId) return

        // Join the order-specific room to receive targeted rider location updates
        socket.emit('joinOrderRoom', { orderId })

        const handler = ({ deliveryBoyId, latitude, longitude }) => {
            setLiveLocations(prev => ({ ...prev, [deliveryBoyId]: { lat: latitude, lon: longitude } }))
        }
        socket.on('updateDeliveryLocation', handler)
        return () => socket.off('updateDeliveryLocation', handler)
    }, [socket, orderId])

    const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ""

    return (
        <div className='min-h-screen bg-[#f5f6f0]'>
            {/* Header */}
            <div className='sticky top-0 z-40 bg-white border-b border-slate-100 px-4 md:px-8 h-14 flex items-center gap-3 shadow-sm'>
                <button onClick={() => navigate("/my-orders")} className='p-2 rounded-xl hover:bg-slate-100 transition'>
                    <IoArrowBack size={20} className='text-slate-700' />
                </button>
                <h1 className='text-lg font-black text-slate-900'>Track Order</h1>
                {currentOrder && (
                    <span className='ml-auto text-xs text-slate-500'>#{currentOrder._id.slice(-6)}</span>
                )}
            </div>

            <div className='max-w-2xl mx-auto px-4 py-6 space-y-4'>
                {!currentOrder ? (
                    <div className='text-center py-20 text-slate-400'>
                        <div className='animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4' />
                        <p className='font-semibold'>Loading order details…</p>
                    </div>
                ) : (
                    <>
                        {/* Delivery address */}
                        <div className='bg-white rounded-2xl border border-slate-100 p-4 flex items-start gap-3'>
                            <div className='w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0'>
                                <FaHome size={16} className='text-[#16a34a]' />
                            </div>
                            <div>
                                <p className='text-xs text-slate-500 font-semibold uppercase tracking-wide'>Delivering to</p>
                                <p className='text-sm font-bold text-slate-900 mt-0.5'>{currentOrder.deliveryAddress?.text}</p>
                            </div>
                        </div>

                        {/* Shop orders */}
                        {currentOrder.shopOrders?.map((shopOrder, index) => {
                            const currentStep = stepIndex(shopOrder.status)
                            const deliveryBoyLoc = shopOrder.assignedDeliveryBoy
                                ? (liveLocations[shopOrder.assignedDeliveryBoy._id] || {
                                    lat: shopOrder.assignedDeliveryBoy.location?.coordinates?.[1],
                                    lon: shopOrder.assignedDeliveryBoy.location?.coordinates?.[0]
                                })
                                : null

                            const customerLoc = {
                                lat: currentOrder.deliveryAddress?.latitude,
                                lon: currentOrder.deliveryAddress?.longitude
                            }

                            return (
                                <div className='bg-white rounded-2xl border border-slate-100 overflow-hidden' key={index}>
                                    {/* Shop header */}
                                    <div className='p-4 border-b border-slate-50 flex items-center gap-3'>
                                        <div className='w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center'>
                                            <FaStore size={16} className='text-orange-500' />
                                        </div>
                                        <div className='flex-1'>
                                            <p className='font-bold text-slate-900'>{shopOrder.shop?.name}</p>
                                            <p className='text-xs text-slate-500'>{shopOrder.shopOrderItems?.map(i => i.name).join(", ")}</p>
                                        </div>
                                        <span className='text-sm font-bold text-slate-700'>₹{shopOrder.subtotal}</span>
                                    </div>

                                    {/* Status timeline */}
                                    <div className='px-5 py-4'>
                                        <div className='relative'>
                                            {/* Connecting line */}
                                            <div className='absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-100' />
                                            <div
                                                className='absolute left-[15px] top-4 w-0.5 bg-[#16a34a] transition-all duration-700'
                                                style={{ height: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                                            />

                                            {STATUS_STEPS.map((step, si) => {
                                                const done = si <= currentStep
                                                const active = si === currentStep
                                                const StepIcon = step.icon
                                                return (
                                                    <div key={step.key} className={`relative flex items-center gap-4 py-3 ${si < STATUS_STEPS.length - 1 ? 'mb-1' : ''}`}>
                                                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${done ? 'bg-[#16a34a]' : 'bg-slate-100'} ${active ? 'ring-4 ring-green-100 scale-110' : ''}`}>
                                                            <StepIcon size={13} className={done ? 'text-white' : 'text-slate-400'} />
                                                        </div>
                                                        <div className='flex-1'>
                                                            <p className={`text-sm font-bold ${done ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</p>
                                                            {active && <p className='text-xs text-[#16a34a] font-semibold mt-0.5'>{step.desc}</p>}
                                                        </div>
                                                        {active && shopOrder.status !== 'delivered' && (
                                                            <span className='px-2 py-0.5 bg-green-100 text-[#16a34a] text-[10px] font-bold rounded-full animate-pulse'>Live</span>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Delivery boy info */}
                                    {shopOrder.assignedDeliveryBoy && shopOrder.status !== 'delivered' && (
                                        <div className='mx-4 mb-4 p-3 bg-slate-50 rounded-xl flex items-center gap-3'>
                                            <div className='w-10 h-10 rounded-full bg-slate-800 text-white text-sm font-bold flex items-center justify-center'>
                                                {shopOrder.assignedDeliveryBoy.fullName?.charAt(0)}
                                            </div>
                                            <div className='flex-1'>
                                                <p className='text-sm font-bold text-slate-900'>{shopOrder.assignedDeliveryBoy.fullName}</p>
                                                <p className='text-xs text-slate-500'>Your delivery partner</p>
                                            </div>
                                            <a
                                                href={`tel:${shopOrder.assignedDeliveryBoy.mobile}`}
                                                className='px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-[#16a34a] hover:bg-green-50 transition'
                                            >
                                                📞 Call
                                            </a>
                                        </div>
                                    )}

                                    {shopOrder.deliveryOtp && shopOrder.status !== 'delivered' && (
                                        <div className='mx-4 mb-4 p-4 border border-green-200 bg-green-50/50 rounded-2xl space-y-3 shadow-sm'>
                                            <p className='text-sm font-bold text-slate-800 flex items-center gap-1.5'>
                                                <span className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
                                                Rider has arrived!
                                            </p>
                                            <p className='text-xs text-slate-600'>
                                                Verify the order with the OTP code: <span className='font-bold text-[#16a34a] bg-white border border-green-100 px-2 py-0.5 rounded text-sm'>{shopOrder.deliveryOtp}</span>
                                            </p>
                                            <div className='flex gap-2 items-center'>
                                                <input
                                                    type="text"
                                                    maxLength={4}
                                                    placeholder="Enter OTP"
                                                    value={otpInputs[shopOrder._id] || ""}
                                                    onChange={e => setOtpInputs(prev => ({ ...prev, [shopOrder._id]: e.target.value }))}
                                                    className='border border-slate-200 rounded-xl px-3 py-2 text-sm text-center font-bold tracking-widest outline-none focus:ring-2 focus:ring-green-400 bg-white w-28 h-10'
                                                />
                                                <button
                                                    onClick={() => handleVerifyOtp(shopOrder._id)}
                                                    disabled={verifyingOtp[shopOrder._id] || (otpInputs[shopOrder._id]?.length !== 4)}
                                                    className='h-10 px-4 bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold rounded-xl disabled:opacity-50 transition active:scale-95'
                                                >
                                                    {verifyingOtp[shopOrder._id] ? "Verifying..." : "Confirm Delivery"}
                                                </button>
                                            </div>
                                            {otpError[shopOrder._id] && (
                                                <p className='text-xs text-red-500 font-semibold'>{otpError[shopOrder._id]}</p>
                                            )}
                                        </div>
                                    )}

                                    {shopOrder.status === 'delivered' && (
                                        <div className='mx-4 mb-4 p-4 bg-green-50 rounded-xl text-center'>
                                            <FaCheckCircle size={28} className='text-[#16a34a] mx-auto mb-2' />
                                            <p className='font-bold text-[#16a34a]'>Delivered! Enjoy your meal 🍽️</p>
                                        </div>
                                    )}

                                    {/* Live map */}
                                    {shopOrder.assignedDeliveryBoy && shopOrder.status !== 'delivered'
                                        && deliveryBoyLoc?.lat && customerLoc?.lat && (
                                            <div className='mx-4 mb-4 rounded-2xl overflow-hidden border border-slate-100 shadow-sm'>
                                                <div className='bg-slate-800 px-4 py-2 flex items-center gap-2'>
                                                    <MdOutlineDeliveryDining size={18} className='text-green-400' />
                                                    <span className='text-white text-xs font-semibold'>Live Tracking</span>
                                                    <span className='ml-auto text-[10px] text-green-400 animate-pulse font-semibold'>● LIVE</span>
                                                </div>
                                                <DeliveryBoyTracking data={{ deliveryBoyLocation: deliveryBoyLoc, customerLocation: customerLoc }} />
                                            </div>
                                        )
                                    }
                                </div>
                            )
                        })}

                        {/* Total */}
                        <div className='bg-white rounded-2xl border border-slate-100 p-4 flex justify-between items-center'>
                            <div>
                                <p className='text-xs text-slate-500'>Order total · {formatDate(currentOrder.createdAt)}</p>
                                <p className='text-xl font-black text-slate-900 mt-0.5'>₹{currentOrder.totalAmount}</p>
                            </div>
                            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${currentOrder.payment ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {currentOrder.paymentMethod?.toUpperCase()} · {currentOrder.payment ? "Paid" : "Pending"}
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default TrackOrderPage
