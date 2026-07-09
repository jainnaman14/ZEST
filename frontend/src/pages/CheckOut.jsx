import React, { useEffect, useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { IoLocationSharp } from "react-icons/io5";
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import "leaflet/dist/leaflet.css"
import { setAddress, setLocation } from '../redux/mapSlice';
import { MdDeliveryDining } from "react-icons/md";
import { FaCreditCard, FaRegCheckCircle } from "react-icons/fa";
import axios from 'axios';
import { FaMobileScreenButton, FaChevronRight } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { addMyOrder, clearCart, setTotalAmount } from '../redux/userSlice';

function RecenterMap({ location }) {
  if (location.lat && location.lon) {
    const map = useMap()
    map.setView([location.lat, location.lon], 16, { animate: true })
  }
  return null
}

function CheckOut() {
  const { location, address } = useSelector(state => state.map)
  const { cartItems, totalAmount, userData } = useSelector(state => state.user)
  const [addressInput, setAddressInput] = useState("")
  
  // Set default payment method to "online" to match recommended UPI focus of Screen 5
  const [paymentMethod, setPaymentMethod] = useState("online")
  const [activePaymentSubtype, setActivePaymentSubtype] = useState("upi") // 'upi', 'card', 'wallet', 'cod'

  const [orderError, setOrderError] = useState("")
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const apiKey = import.meta.env.VITE_GEOAPIKEY
  const deliveryFee = totalAmount > 500 ? 0 : 40
  const AmountWithDeliveryFee = totalAmount + deliveryFee

  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng
    dispatch(setLocation({ lat, lon: lng }))
    getAddressByLatLng(lat, lng)
  }

  const getCurrentLocation = () => {
    const latitude = userData.location.coordinates[1]
    const longitude = userData.location.coordinates[0]
    dispatch(setLocation({ lat: latitude, lon: longitude }))
    getAddressByLatLng(latitude, longitude)
  }

  const getAddressByLatLng = async (lat, lng) => {
    try {
      const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`)
      dispatch(setAddress(result?.data?.results[0].address_line2))
    } catch (error) {
      console.log(error)
    }
  }

  const getLatLngByAddress = async () => {
    try {
      const result = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apiKey}`)
      const { lat, lon } = result.data.features[0].properties
      dispatch(setLocation({ lat, lon }))
    } catch (error) {
      console.log(error)
    }
  }

  const handlePlaceOrder = async () => {
    setOrderError("")
    if (!addressInput || !addressInput.trim()) {
      setOrderError("Please enter a delivery address or use current location.")
      return
    }
    if (!location.lat || !location.lon) {
      setOrderError("Please select your delivery location on the map.")
      return
    }
    setIsPlacingOrder(true)
    try {
      const finalPaymentMethod = activePaymentSubtype === "cod" ? "cod" : "online"
      const result = await axios.post(`${serverUrl}/api/order/place-order`, {
        paymentMethod: finalPaymentMethod,
        deliveryAddress: {
          text: addressInput,
          latitude: location.lat,
          longitude: location.lon
        },
        totalAmount: AmountWithDeliveryFee,
        cartItems
      }, { withCredentials: true })

      if (finalPaymentMethod === "cod") {
        dispatch(addMyOrder(result.data))
        dispatch(clearCart())
        navigate("/order-placed")
      } else {
        const orderId = result.data.orderId
        const razorOrder = result.data.razorOrder
        openRazorpayWindow(orderId, razorOrder)
      }
    } catch (error) {
      console.log(error)
      setOrderError(error?.response?.data?.message || "Failed to place order. Please try again.")
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const openRazorpayWindow = (orderId, razorOrder) => {
    const options = {
      key: "rzp_test_T7n8z1sNLCzxsA",
      amount: razorOrder.amount,
      currency: 'INR',
      name: "ZEST",
      description: "Fun Food Delivery Payment",
      order_id: razorOrder.id,
      prefill: {
        name: userData?.fullName || undefined,
        email: userData?.email || undefined,
        contact: userData?.mobile || undefined
      },
      handler: async function (response) {
        try {
          const result = await axios.post(`${serverUrl}/api/order/verify-payment`, {
            razorpay_payment_id: response.razorpay_payment_id,
            orderId
          }, { withCredentials: true })
          dispatch(addMyOrder(result.data))
          dispatch(clearCart())
          navigate("/order-placed")
        } catch (error) {
          console.log(error)
          setOrderError(error?.response?.data?.message || "Payment verification failed. Please contact support.")
          setIsPlacingOrder(false)
        }
      },
      modal: {
        ondismiss: function () {
          setIsPlacingOrder(false)
          setOrderError("Payment cancelled. You can select another option.")
        }
      },
      theme: {
        color: "#ff5a1f"
      }
    }

    try {
      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response) {
        console.error("Razorpay payment failed:", response.error)
        setIsPlacingOrder(false)
        setOrderError(`Payment failed: ${response.error?.description || "Try again."}`)
      })
      rzp.open()
    } catch (err) {
      console.error("Razorpay initialization error:", err)
      setIsPlacingOrder(false)
      setOrderError(`Failed to initialize Razorpay: ${err.message}`)
    }
  }

  useEffect(() => {
    setAddressInput(address)
  }, [address])

  return (
    <div className='min-h-screen zest-bg text-slate-900 p-4 md:p-8 flex items-center justify-center font-sans antialiased'>
      {/* Back Icon */}
      <button 
        onClick={() => navigate("/cart")}
        className='absolute top-5 left-5 z-20 w-11 h-11 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center border border-white/10 shadow-lg cursor-pointer transition'
      >
        <IoIosArrowRoundBack size={26} className='text-white' />
      </button>

      <div className='w-full max-w-[850px] zest-dark-panel rounded-[36px] shadow-2xl border border-white/10 p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 relative overflow-hidden'>
        <div className='absolute -top-20 -right-20 w-48 h-48 bg-[#00aad2]/5 rounded-full blur-3xl pointer-events-none' />

        {/* Left Side: Address Map Section */}
        <div className='space-y-5 text-left'>
          <h2 className='text-xl font-black uppercase tracking-wider text-slate-100 flex items-center gap-2'>
            <IoLocationSharp className='text-rose-500' size={18} />
            Delivery Location
          </h2>

          <div className='flex gap-2 bg-white/5 rounded-2xl p-1.5 border border-white/10'>
            <input 
              type="text" 
              className='flex-1 bg-transparent px-3 text-sm text-white placeholder-slate-500 font-extrabold focus:outline-none' 
              placeholder='Enter Your Address...' 
              value={addressInput} 
              onChange={(e) => setAddressInput(e.target.value)} 
            />
            <button className='w-10 h-10 zest-btn rounded-xl flex items-center justify-center shrink-0 cursor-pointer shadow transition' onClick={getLatLngByAddress}><IoSearchOutline size={16} /></button>
            <button className='w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 hover:brightness-110 rounded-xl flex items-center justify-center shrink-0 cursor-pointer shadow transition' onClick={getCurrentLocation}><TbCurrentLocation size={16} /></button>
          </div>

          <div className='rounded-3xl border border-white/10 overflow-hidden shadow-inner h-64 bg-slate-900'>
            <MapContainer className={"w-full h-full"} center={[location?.lat, location?.lon]} zoom={16}>
              <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <RecenterMap location={location} />
              <Marker position={[location?.lat, location?.lon]} draggable eventHandlers={{ dragend: onDragEnd }} />
            </MapContainer>
          </div>

          {/* Cart summary box */}
          <div className='bg-white/5 rounded-3xl p-5 border border-white/5 space-y-2.5 text-xs font-black uppercase text-slate-400'>
            <p className='text-slate-100 text-sm font-black mb-1 border-b border-white/5 pb-2'>Order Summary</p>
            {cartItems.map((item, idx) => (
              <div key={idx} className='flex justify-between text-slate-300'>
                <span>{item.name} x {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className='flex justify-between text-slate-300 pt-1'>
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? "Free" : `$${deliveryFee}`}</span>
            </div>
            <hr className='border-white/5' />
            <div className='flex justify-between text-base font-black text-[#ffd166]'>
              <span>Total Price</span>
              <span>${AmountWithDeliveryFee.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Select Payment Method matching Screen 5 exactly */}
        <div className='space-y-6 text-left flex flex-col justify-between'>
          <div className='space-y-4'>
            <div className='space-y-1'>
              <h2 className='text-xl font-black uppercase tracking-wider text-slate-100'>Select Payment Method</h2>
              <p className='text-xs text-violet-100 font-semibold'>Pay securely, earn coins, and unlock more food rewards 🎉</p>
              <div className='inline-flex items-center gap-1 bg-[#e6fbf4] text-[#10b981] px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-inner'>
                🔒 100% Secure Payments
              </div>
            </div>

            {/* List options exactly matching Screen 5 layout */}
            <div className='space-y-3'>

              {/* Option 1: UPI */}
              <button 
                onClick={() => { setPaymentMethod("online"); setActivePaymentSubtype("upi") }}
                className={`w-full p-4 rounded-2xl flex items-center justify-between text-left border transition cursor-pointer ${activePaymentSubtype === "upi" ? "bg-white/10 border-[#00aad2] shadow-xl" : "bg-white/5 border-white/5 hover:border-white/10"}`}
              >
                <div className='flex items-center gap-3.5'>
                  <div className='w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0'>
                    <FaMobileScreenButton size={18} />
                  </div>
                  <div>
                    <span className='font-black text-sm text-slate-100 block'>UPI</span>
                    <span className='text-[10px] text-slate-400 font-bold uppercase'>Google Pay, PhonePe, Paytm</span>
                  </div>
                </div>
                <span className='bg-green-500/15 text-green-400 text-[10px] font-black px-2.5 py-1 rounded-full'>
                  Recommended
                </span>
              </button>

              {/* Option 2: Credit / Debit Card */}
              <button 
                onClick={() => { setPaymentMethod("online"); setActivePaymentSubtype("card") }}
                className={`w-full p-4 rounded-2xl flex items-center justify-between text-left border transition cursor-pointer ${activePaymentSubtype === "card" ? "bg-white/10 border-[#00aad2] shadow-xl" : "bg-white/5 border-white/5 hover:border-white/10"}`}
              >
                <div className='flex items-center gap-3.5'>
                  <div className='w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0'>
                    <FaCreditCard size={18} />
                  </div>
                  <div>
                    <span className='font-black text-sm text-slate-100 block'>Credit / Debit Card</span>
                    <span className='text-[10px] text-slate-400 font-bold uppercase'>Visa, MasterCard, RuPay</span>
                  </div>
                </div>
                <FaChevronRight size={11} className='text-slate-500' />
              </button>

              {/* Option 3: Wallets */}
              <button 
                onClick={() => { setPaymentMethod("online"); setActivePaymentSubtype("wallet") }}
                className={`w-full p-4 rounded-2xl flex items-center justify-between text-left border transition cursor-pointer ${activePaymentSubtype === "wallet" ? "bg-white/10 border-[#00aad2] shadow-xl" : "bg-white/5 border-white/5 hover:border-white/10"}`}
              >
                <div className='flex items-center gap-3.5'>
                  <div className='w-10 h-10 rounded-xl bg-[#00aad2]/10 text-[#00aad2] flex items-center justify-center shrink-0'>
                    <span className='text-base'>💳</span>
                  </div>
                  <div>
                    <span className='font-black text-sm text-slate-100 block'>Wallets</span>
                    <span className='text-[10px] text-slate-400 font-bold uppercase'>Paytm Wallet, Amazon Pay</span>
                  </div>
                </div>
                <FaChevronRight size={11} className='text-slate-500' />
              </button>

              {/* Option 4: Cash on Delivery */}
              <button 
                onClick={() => { setPaymentMethod("cod"); setActivePaymentSubtype("cod") }}
                className={`w-full p-4 rounded-2xl flex items-center justify-between text-left border transition cursor-pointer ${activePaymentSubtype === "cod" ? "bg-white/10 border-[#ff5a36] shadow-xl" : "bg-white/5 border-white/5 hover:border-white/10"}`}
              >
                <div className='flex items-center gap-3.5'>
                  <div className='w-10 h-10 rounded-xl bg-[#ff5a36]/10 text-[#ff5a36] flex items-center justify-center shrink-0'>
                    <MdDeliveryDining size={20} />
                  </div>
                  <div>
                    <span className='font-black text-sm text-slate-100 block'>Cash On Delivery</span>
                    <span className='text-[10px] text-slate-400 font-bold uppercase'>Pay when food arrives</span>
                  </div>
                </div>
                <FaChevronRight size={11} className='text-slate-500' />
              </button>

            </div>
          </div>

          <div className='space-y-4 pt-4'>
            {orderError && (
              <div className='w-full bg-red-500/10 border border-red-500/30 text-rose-400 rounded-2xl px-4 py-3 text-xs font-black'>
                ⚠️ {orderError}
              </div>
            )}

            {/* Action button */}
            <button 
              className='w-full bg-[#ff5a36] hover:bg-[#e04523] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed transition transform active:scale-98 shadow-xl cursor-pointer' 
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
            >
              {isPlacingOrder ? "Placing Order..." : (activePaymentSubtype === "cod" ? "Place Cash Order" : "Proceed to Payment")}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default CheckOut
