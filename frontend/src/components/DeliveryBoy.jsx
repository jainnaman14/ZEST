import React, { useEffect, useRef, useState } from 'react'
import Nav from './Nav'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import DeliveryBoyTracking from './DeliveryBoyTracking'
import { ClipLoader } from 'react-spinners'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { FaMapMarkerAlt, FaMotorcycle, FaCoins, FaLock, FaMap, FaHourglassHalf, FaStore } from 'react-icons/fa'
import { TbReceipt2 } from 'react-icons/tb'

function DeliveryBoy() {
  const { userData, socket } = useSelector(state => state.user)
  const [currentOrder, setCurrentOrder] = useState()
  const [showOtpBox, setShowOtpBox] = useState(false)
  const [availableAssignments, setAvailableAssignments] = useState(null)
  const [otp, setOtp] = useState("")
  const [todayDeliveries, setTodayDeliveries] = useState([])
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!socket || !userData || userData.role !== "deliveryBoy") return
    let watchId
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition((position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        setDeliveryBoyLocation({ lat: latitude, lon: longitude })
        socket.emit('updateLocation', {
          latitude,
          longitude,
          userId: userData._id,
          orderId: currentOrder?._id || null
        })
      },
      (error) => {
        console.log(error)
      },
      {
        enableHighAccuracy: true
      })
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId)
    }
  }, [socket, userData, currentOrder?._id])

  const ratePerDelivery = 50
  const totalEarning = todayDeliveries.reduce((sum, d) => sum + d.count * ratePerDelivery, 0)

  const getAssignments = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-assignments`, { withCredentials: true })
      setAvailableAssignments(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  const getCurrentOrder = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-current-order`, { withCredentials: true })
      setCurrentOrder(result.data)
      if (result.data?.shopOrder?.deliveryOtp) {
        setShowOtpBox(true)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const acceptOrder = async (assignmentId) => {
    try {
      await axios.get(`${serverUrl}/api/order/accept-order/${assignmentId}`, { withCredentials: true })
      await getCurrentOrder()
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (!socket) return
    socket.on('newAssignment', (data) => {
      setAvailableAssignments(prev => ([...(prev || []), data]))
    })
    return () => {
      socket.off('newAssignment')
    }
  }, [socket])

  const sendOtp = async () => {
    setLoading(true)
    try {
      await axios.post(`${serverUrl}/api/order/send-delivery-otp`, {
        orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder._id
      }, { withCredentials: true })
      setLoading(false)
      setShowOtpBox(true)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    setMessage("")
    try {
      const result = await axios.post(`${serverUrl}/api/order/verify-delivery-otp`, {
        orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder._id, otp
      }, { withCredentials: true })
      setMessage(result.data.message)
      setTimeout(() => {
        setCurrentOrder(undefined)
        setShowOtpBox(false)
        setOtp("")
        setMessage("")
        getAssignments()
        handleTodayDeliveries()
      }, 1500)
    } catch (error) {
      console.log(error)
      setMessage(error?.response?.data?.message || "Invalid OTP verification")
    }
  }

  const handleTodayDeliveries = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-today-deliveries`, { withCredentials: true })
      setTodayDeliveries(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (!userData) return
    getAssignments()
    getCurrentOrder()
    handleTodayDeliveries()
  }, [userData])

  if (!userData) {
    return (
      <div className='w-screen min-h-screen flex flex-col gap-6 items-center justify-center zest-bg font-outfit'>
        <ClipLoader size={30} color='#ff5a1f' />
        <p className='text-slate-600 font-bold'>Loading Rider Session...</p>
      </div>
    )
  }

  return (
    <div className='w-screen min-h-screen flex flex-col gap-6 items-center zest-bg pb-24 overflow-y-auto font-outfit'>
      <Nav />
      <div className='w-full max-w-[800px] flex flex-col gap-6 px-4 md:px-8 py-4'>
        
        {/* Welcome & Live GPS Status Panel */}
        <div className='zest-card rounded-[32px] p-6 border border-orange-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl relative overflow-hidden'>
          <div className='absolute -top-12 -right-12 w-32 h-32 bg-[#ff5a1f]/10 rounded-full blur-2xl' />
          <div className='flex items-center gap-4 text-left'>
            <div className='w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600 text-white font-black text-xl grid place-items-center shadow-lg'>
              {userData?.fullName?.slice(0, 1)?.toUpperCase() || "R"}
            </div>
            <div className='space-y-1 font-outfit'>
              <h1 className='text-2xl font-black text-slate-900 leading-tight'>Welcome, {userData?.fullName || "Rider"}</h1>
              <p className='text-xs font-semibold text-slate-500 flex items-center gap-1.5'>
                <span className='w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping' />
                Rider Duty Mode: Active
              </p>
            </div>
          </div>
          <div className='bg-slate-900/5 hover:bg-slate-900/10 transition px-4 py-2.5 rounded-2xl border border-slate-200/50 text-right font-montserrat text-[11px] font-bold text-slate-700 flex flex-col items-end gap-0.5 shadow-inner'>
            <span className='text-orange-600 font-extrabold uppercase tracking-wide flex items-center gap-1'><FaMapMarkerAlt size={10} /> Live GPS status</span>
            <span>Lat: {deliveryBoyLocation?.lat?.toFixed(5) || "Searching..."}</span>
            <span>Lon: {deliveryBoyLocation?.lon?.toFixed(5) || "Searching..."}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Earnings Card */}
          <div className='zest-card rounded-[28px] p-5 flex flex-col justify-between border border-emerald-500/10 shadow-lg relative overflow-hidden h-36 font-outfit'>
            <div className='absolute -top-6 -right-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl' />
            <div className='flex items-center justify-between'>
              <span className='text-xs font-black uppercase tracking-wider text-slate-400'>Today's Earnings</span>
              <span className='p-2 bg-emerald-100 rounded-xl text-emerald-600'><FaCoins size={16} /></span>
            </div>
            <div className='space-y-1 text-left'>
              <h3 className='text-3xl font-black text-emerald-600'>₹{totalEarning}</h3>
              <p className='text-[10px] font-bold text-slate-500'>Rate: ₹{ratePerDelivery} / delivery assignment</p>
            </div>
          </div>

          {/* Deliveries Count Card */}
          <div className='zest-card rounded-[28px] p-5 flex flex-col justify-between border border-orange-500/10 shadow-lg relative overflow-hidden h-36 font-outfit'>
            <div className='absolute -top-6 -right-6 w-20 h-20 bg-orange-500/10 rounded-full blur-xl' />
            <div className='flex items-center justify-between'>
              <span className='text-xs font-black uppercase tracking-wider text-slate-400'>Completed Trips</span>
              <span className='p-2 bg-orange-100 rounded-xl text-orange-600'><FaMotorcycle size={16} /></span>
            </div>
            <div className='space-y-1 text-left'>
              <h3 className='text-3xl font-black text-slate-900'>{todayDeliveries ? todayDeliveries.reduce((sum, d) => sum + d.count, 0) : 0} Trips</h3>
              <p className='text-[10px] font-bold text-slate-500'>Trips completed today</p>
            </div>
          </div>

          {/* Active Job Card */}
          <div className='zest-card rounded-[28px] p-5 flex flex-col justify-between border border-violet-500/10 shadow-lg relative overflow-hidden h-36 font-outfit'>
            <div className='absolute -top-6 -right-6 w-20 h-20 bg-violet-500/10 rounded-full blur-xl' />
            <div className='flex items-center justify-between'>
              <span className='text-xs font-black uppercase tracking-wider text-slate-400'>Current Status</span>
              <span className='p-2 bg-violet-100 rounded-xl text-violet-600'><TbReceipt2 size={16} /></span>
            </div>
            <div className='space-y-1 text-left'>
              <h3 className='text-xl font-black text-slate-900 truncate'>{currentOrder ? "On Active Trip" : "Idle (Waiting)"}</h3>
              <p className='text-[10px] font-bold text-slate-500'>{currentOrder ? "Arrived verification pending" : "Ready for next order assignment"}</p>
            </div>
          </div>
        </div>

        {/* Deliveries Bar Chart Card */}
        <div className='zest-card rounded-[32px] p-6 border border-orange-500/10 shadow-xl space-y-4 font-outfit text-left'>
          <h2 className='text-lg font-black text-slate-900 font-montserrat tracking-tight flex items-center gap-2'>
            📈 Hourly Delivery Breakdown
          </h2>
          <div className='w-full'>
            {todayDeliveries && todayDeliveries.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={todayDeliveries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} stroke="#94a3b8" tick={{ fontSize: 10, fontWeight: 700 }} />
                  <YAxis allowDecimals={false} stroke="#94a3b8" tick={{ fontSize: 10, fontWeight: 700 }} />
                  <Tooltip 
                    contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }} 
                    formatter={(value) => [value, "orders"]} 
                    labelFormatter={label => `${label}:00`}
                  />
                  <Bar dataKey="count" fill='url(#barGradient)' radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff5a1f" />
                      <stop offset="100%" stopColor="#ff2f6d" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className='text-slate-400 text-sm py-10 text-center font-bold'>No deliveries logged yet today.</p>
            )}
          </div>
        </div>

        {/* Available Assignments list */}
        {!currentOrder && (
          <div className='zest-card rounded-[32px] p-6 border border-orange-500/10 shadow-xl space-y-5 text-left font-outfit'>
            <h2 className='text-lg font-black text-slate-900 font-montserrat tracking-tight flex items-center gap-2'>
              🛵 Available Assignments
            </h2>
            <div className='space-y-4'>
              {availableAssignments && availableAssignments.length > 0 ? (
                availableAssignments.map((a, index) => (
                  <div key={index} className='border border-slate-100 hover:border-orange-200 bg-white/50 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:scale-101 hover:shadow-md transition-all duration-300'>
                    <div className='space-y-1.5 flex-1'>
                      <div className='flex items-center gap-2'>
                        <span className='px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-wider'>Shop Order</span>
                        <p className='text-sm font-black text-slate-950'>{a?.shopName}</p>
                      </div>
                      <p className='text-xs text-slate-600 leading-normal flex items-start gap-1'>
                        <FaMapMarkerAlt className='text-rose-500 mt-0.5 shrink-0' size={12} />
                        <span><span className='font-bold text-slate-900'>Deliver to:</span> {a?.deliveryAddress?.text || "Standard Address"}</span>
                      </p>
                      <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wide'>{a.items?.length || 0} items • ₹{a.subtotal}</p>
                    </div>
                    <button 
                      onClick={() => acceptOrder(a.assignmentId)}
                      className='w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-orange-500 to-pink-600 hover:brightness-110 text-white text-xs font-black uppercase rounded-xl shadow-md active:scale-95 transition-all duration-200 cursor-pointer text-center'
                    >
                      Accept Job
                    </button>
                  </div>
                ))
              ) : (
                <div className='text-center py-10 bg-slate-900/5 rounded-2xl border border-dashed border-slate-300/60'>
                  <p className='text-slate-400 text-sm font-bold'>No Active Order Assignments Available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active assignment details */}
        {currentOrder && (
          <div className='zest-card rounded-[32px] p-6 border border-orange-500/10 shadow-xl space-y-6 text-left font-outfit'>
            <div className='flex justify-between items-center border-b border-orange-100 pb-3'>
              <h2 className='text-lg font-black text-slate-900 font-montserrat tracking-tight flex items-center gap-2'>
                📦 Active Delivery Job
              </h2>
              <span className='px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold animate-pulse'>In Progress</span>
            </div>

            <div className='bg-slate-50/50 p-4 border border-slate-100 rounded-2xl space-y-2'>
              <p className='text-sm font-black text-slate-950 flex items-center gap-1.5'>
                <FaStore className='text-orange-500' size={14} />
                {currentOrder?.shopOrder?.shop?.name || "Shop"}
              </p>
              <p className='text-xs text-slate-600 leading-normal flex items-start gap-1'>
                <FaMapMarkerAlt className='text-rose-500 mt-0.5 shrink-0' size={12} />
                <span><span className='font-bold text-slate-900'>Customer Address:</span> {currentOrder?.deliveryAddress?.text || "Standard Address"}</span>
              </p>
              <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wide'>
                {currentOrder?.shopOrder?.shopOrderItems?.length || 0} items • Subtotal: ₹{currentOrder?.shopOrder?.subtotal || 0}
              </p>
            </div>

            {/* Tracking map */}
            <div className='rounded-2xl border border-slate-100 overflow-hidden shadow-inner bg-slate-950'>
              <div className='bg-slate-800 px-4 py-2 flex items-center gap-2'>
                <FaMap size={14} className='text-orange-500 animate-pulse' />
                <span className='text-white text-xs font-semibold'>Job Routing Map</span>
              </div>
              <DeliveryBoyTracking data={{ 
                deliveryBoyLocation: deliveryBoyLocation || {
                  lat: userData?.location?.coordinates?.[1] || 0,
                  lon: userData?.location?.coordinates?.[0] || 0
                },
                customerLocation: {
                  lat: currentOrder?.deliveryAddress?.latitude || 0,
                  lon: currentOrder?.deliveryAddress?.longitude || 0
                }
              }} />
            </div>

            {/* OTP Status Actions */}
            {!showOtpBox ? (
              <button 
                onClick={sendOtp} 
                disabled={loading}
                className='w-full py-4 bg-gradient-to-r from-[#ff5a1f] to-[#ff2f6d] hover:brightness-105 text-white font-black text-sm rounded-2xl shadow-xl transition-all duration-300 transform active:scale-98 flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer'
              >
                {loading ? <ClipLoader size={18} color='white'/> : (
                  <>
                    <span>📍 Notify Arrival & Request OTP</span>
                  </>
                )}
              </button>
            ) : (
              <div className='p-5 border border-orange-100 bg-[#fffaf7] rounded-2xl space-y-4 animate-scale-in text-center'>
                <div className='w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto shadow-sm'>
                  <FaLock size={20} className='animate-pulse' />
                </div>
                <div className='space-y-1'>
                  <h3 className='text-sm font-black text-slate-950'>Delivery OTP Verification</h3>
                  <p className='text-xs text-slate-500 font-semibold max-w-xs mx-auto leading-relaxed'>
                    An OTP was sent to <span className='text-orange-600 font-bold'>{currentOrder?.user?.fullName || "Customer"}</span>. Please ask the customer for the code.
                  </p>
                </div>

                <div className='max-w-xs mx-auto space-y-3.5'>
                  <input 
                    type="text" 
                    maxLength={4}
                    placeholder='Enter 4-Digit OTP' 
                    value={otp}
                    onChange={(e)=>setOtp(e.target.value)}
                    className='w-full border border-orange-200 px-4 py-3 rounded-2xl text-center text-lg font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white placeholder-slate-300 shadow-inner' 
                  />
                  {message && (
                    <p className='text-center text-emerald-600 text-sm font-black animate-pulse'>{message}</p>
                  )}
                  <button 
                    onClick={verifyOtp}
                    disabled={otp.length !== 4}
                    className="w-full bg-slate-950 hover:bg-slate-900 disabled:opacity-50 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-md active:scale-98 cursor-pointer"
                  >
                    Verify OTP & Mark Delivered
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default DeliveryBoy;
