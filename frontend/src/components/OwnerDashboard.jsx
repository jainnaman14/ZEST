import React, { useState } from 'react'
import Nav from './Nav'
import { useDispatch, useSelector } from 'react-redux'
import { FaUtensils, FaStore, FaStar, FaPhone, FaClock, FaTag, FaPlus } from 'react-icons/fa'
import { MdLocationOn, MdEdit, MdToggleOn, MdToggleOff } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import OwnerItemCard from './OwnerItemCard'
import axios from 'axios'
import { serverUrl } from '../App'
import { setMyShopData } from '../redux/ownerSlice'
import { ClipLoader } from 'react-spinners'

function OwnerDashboard() {
  const { myShopData } = useSelector(state => state.owner)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [togglingOpen, setTogglingOpen] = useState(false)

  const handleToggleOpen = async () => {
    setTogglingOpen(true)
    try {
      const result = await axios.patch(`${serverUrl}/api/shop/toggle-open`, {}, { withCredentials: true })
      dispatch(setMyShopData(result.data))
    } catch (err) {
      console.log(err)
    } finally {
      setTogglingOpen(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Nav />

      {/* No shop yet */}
      {!myShopData && (
        <div className="flex justify-center items-center min-h-screen px-4 pt-16">
          <div className="w-full max-w-md text-center">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-rose-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-orange-500/30 animate-pulse-slow">
                <FaStore className="text-white" size={52} />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-slate-900 font-black text-sm animate-bounce">
                +
              </div>
            </div>
            <h2 className="text-3xl font-black text-white mb-3">Open Your Restaurant</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Join ZEST's platform and connect with thousands of hungry customers in your city every day.
            </p>
            <button
              onClick={() => navigate('/create-edit-shop')}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-black rounded-2xl shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all duration-200 text-base"
            >
              🚀 Get Started
            </button>
          </div>
        </div>
      )}

      {/* Shop exists */}
      {myShopData && (
        <div className="pt-16">
          {/* Cover image hero */}
          <div className="relative h-64 md:h-80 overflow-hidden">
            {myShopData.image ? (
              <img src={myShopData.image} alt={myShopData.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-600 via-red-500 to-rose-600 flex items-center justify-center">
                <FaStore className="text-white/30" size={80} />
              </div>
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

            {/* Edit button */}
            <button
              onClick={() => navigate('/create-edit-shop')}
              className="absolute top-4 right-4 flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full font-semibold text-sm border border-white/20 hover:bg-white/20 transition cursor-pointer"
            >
              <MdEdit size={16} /> Edit Shop
            </button>

            {/* Open/Closed badge */}
            <div className="absolute top-4 left-4">
              <button
                onClick={handleToggleOpen}
                disabled={togglingOpen}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm border transition-all cursor-pointer ${
                  myShopData.isOpen
                    ? 'bg-green-500/20 backdrop-blur-md border-green-400/50 text-green-300 hover:bg-green-500/30'
                    : 'bg-red-500/20 backdrop-blur-md border-red-400/50 text-red-300 hover:bg-red-500/30'
                }`}
              >
                {togglingOpen ? (
                  <ClipLoader size={12} color="white" />
                ) : myShopData.isOpen ? (
                  <MdToggleOn size={20} />
                ) : (
                  <MdToggleOff size={20} />
                )}
                {myShopData.isOpen ? 'Open' : 'Closed'}
              </button>
            </div>

            {/* Shop name overlaid */}
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">{myShopData.name}</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <MdLocationOn className="text-orange-400" size={14} />
                <p className="text-slate-300 text-sm">{myShopData.address}, {myShopData.city}</p>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-white">{myShopData.items?.length || 0}</p>
                <p className="text-xs text-slate-400 mt-0.5">Menu Items</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <p className="text-2xl font-black text-white">{myShopData.rating?.toFixed(1) || '4.2'}</p>
                  <FaStar className="text-amber-400" size={16} />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Rating</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
                <p className={`text-2xl font-black ${myShopData.isOpen ? 'text-green-400' : 'text-red-400'}`}>
                  {myShopData.isOpen ? 'Open' : 'Closed'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Status</p>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 space-y-3">
              {myShopData.description && (
                <p className="text-slate-300 text-sm leading-relaxed">{myShopData.description}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {myShopData.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <FaPhone className="text-orange-400" size={13} />
                    <span>{myShopData.phone}</span>
                  </div>
                )}
                {(myShopData.openingTime && myShopData.closingTime) && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <FaClock className="text-orange-400" size={13} />
                    <span>{myShopData.openingTime} – {myShopData.closingTime}</span>
                  </div>
                )}
              </div>
              {myShopData.cuisines?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {myShopData.cuisines.map(c => (
                    <span key={c} className="px-3 py-1 bg-orange-500/20 text-orange-300 text-xs font-semibold rounded-full border border-orange-500/30">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Menu Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <FaUtensils className="text-orange-400" />
                  Your Menu
                </h2>
                <button
                  onClick={() => navigate('/add-item')}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold rounded-xl text-sm shadow-lg hover:-translate-y-0.5 transition cursor-pointer"
                >
                  <FaPlus size={12} /> Add Item
                </button>
              </div>

              {myShopData.items?.length === 0 ? (
                <div className="text-center py-16 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                  <FaUtensils className="text-slate-600 mx-auto mb-4" size={40} />
                  <p className="text-slate-400 font-semibold text-lg mb-1">No menu items yet</p>
                  <p className="text-slate-500 text-sm mb-6">Add your first dish to start receiving orders</p>
                  <button
                    onClick={() => navigate('/add-item')}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition cursor-pointer"
                  >
                    Add First Item
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {myShopData.items.map((item, index) => (
                    <OwnerItemCard data={item} key={index} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OwnerDashboard
