import React, { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'
import { setMyShopData } from '../redux/ownerSlice'
import { ClipLoader } from 'react-spinners'
import {
  IoIosArrowRoundBack, IoIosRestaurant
} from 'react-icons/io'
import {
  FaCamera, FaPhone, FaClock, FaTag, FaStore, FaCheckCircle
} from 'react-icons/fa'
import { MdDescription, MdLocationOn, MdError } from 'react-icons/md'
import { RxCross2 } from 'react-icons/rx'

const CUISINE_OPTIONS = [
  'North Indian', 'South Indian', 'Chinese', 'Italian', 'Mexican',
  'Fast Food', 'Biryani', 'Pizza', 'Burgers', 'Desserts',
  'Healthy', 'Street Food', 'Seafood', 'Vegan', 'Beverages'
]

function CuisineChip({ label, selected, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(label)}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
        selected
          ? 'bg-orange-500 text-white border-orange-500 shadow-md scale-105'
          : 'bg-white text-slate-600 border-slate-200 hover:border-orange-400 hover:text-orange-500'
      }`}
    >
      {label}
    </button>
  )
}

function FormSection({ icon, title, children }) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/80 shadow-sm space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-orange-500">{icon}</span>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function InputField({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{label}</label>}
      <input
        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
        {...props}
      />
    </div>
  )
}

function CreateEditShop() {
  const navigate = useNavigate()
  const { myShopData } = useSelector(state => state.owner)
  const { currentCity, currentState, currentAddress } = useSelector(state => state.user)
  const dispatch = useDispatch()

  const [name, setName] = useState(myShopData?.name || '')
  const [description, setDescription] = useState(myShopData?.description || '')
  const [phone, setPhone] = useState(myShopData?.phone || '')
  const [address, setAddress] = useState(myShopData?.address || currentAddress || '')
  const [city, setCity] = useState(myShopData?.city || currentCity || '')
  const [state, setState] = useState(myShopData?.state || currentState || '')
  const [openingTime, setOpeningTime] = useState(myShopData?.openingTime || '09:00')
  const [closingTime, setClosingTime] = useState(myShopData?.closingTime || '22:00')
  const [isOpen, setIsOpen] = useState(myShopData?.isOpen !== undefined ? myShopData.isOpen : true)
  const [cuisines, setCuisines] = useState(myShopData?.cuisines || [])
  const [frontendImage, setFrontendImage] = useState(myShopData?.image || null)
  const [backendImage, setBackendImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const fileRef = useRef()

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setBackendImage(file)
    setFrontendImage(URL.createObjectURL(file))
  }

  const toggleCuisine = (label) => {
    setCuisines(prev =>
      prev.includes(label) ? prev.filter(c => c !== label) : [...prev, label]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Shop name is required.'); return }
    if (!city.trim()) { setError('City is required.'); return }
    if (!state.trim()) { setError('State is required.'); return }
    if (!address.trim()) { setError('Address is required.'); return }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('city', city)
      formData.append('state', state)
      formData.append('address', address)
      formData.append('phone', phone)
      formData.append('description', description)
      formData.append('cuisines', JSON.stringify(cuisines))
      formData.append('openingTime', openingTime)
      formData.append('closingTime', closingTime)
      formData.append('isOpen', String(isOpen))
      if (backendImage) formData.append('image', backendImage)

      const result = await axios.post(
        `${serverUrl}/api/shop/create-edit`,
        formData,
        { withCredentials: true }
      )
      dispatch(setMyShopData(result.data))
      setSuccess(true)
      setTimeout(() => navigate('/'), 1200)
    } catch (err) {
      console.log(err)
      setError(
        err.response?.data?.message || 'Failed to save shop. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const isEditing = !!myShopData

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-orange-500 via-red-500 to-rose-500 px-6 pt-14 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #fbbf24 0%, transparent 60%)' }} />
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 z-10 flex items-center gap-1.5 text-white/80 hover:text-white transition bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full text-sm font-semibold backdrop-blur-sm"
        >
          <IoIosArrowRoundBack size={22} />
          Back
        </button>
        <div className="relative text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
            <FaStore className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-black text-white drop-shadow">
            {isEditing ? 'Edit Your Restaurant' : 'Open Your Restaurant'}
          </h1>
          <p className="text-white/70 mt-1 text-sm">
            {isEditing ? 'Update your shop details' : 'Join thousands of happy customers on ZEST'}
          </p>
        </div>
      </div>

      {/* Card form overlapping hero */}
      <div className="max-w-xl mx-auto px-4 -mt-10 pb-16">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Image Upload */}
          <div
            onClick={() => fileRef.current?.click()}
            className="relative w-full h-44 rounded-2xl overflow-hidden cursor-pointer border-2 border-dashed border-orange-300 hover:border-orange-500 transition-all group shadow-lg"
          >
            {frontendImage ? (
              <>
                <img src={frontendImage} alt="Shop" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <div className="text-white text-center">
                    <FaCamera size={24} className="mx-auto mb-1" />
                    <p className="text-sm font-semibold">Change Photo</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-100 flex flex-col items-center justify-center gap-2">
                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition">
                  <FaCamera className="text-white" size={22} />
                </div>
                <p className="text-sm font-bold text-orange-600">Upload Shop Photo</p>
                <p className="text-xs text-orange-400">Tap to browse (optional)</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileRef}
              onChange={handleImage}
            />
          </div>

          {/* Basic Info */}
          <FormSection icon={<FaStore size={16} />} title="Basic Info">
            <InputField
              label="Restaurant Name *"
              type="text"
              placeholder="e.g. Spice Garden Kitchen"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Description
              </label>
              <textarea
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all resize-none"
                rows={2}
                placeholder="Tell customers what makes your food special…"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <InputField
              label="Phone Number"
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </FormSection>

          {/* Location */}
          <FormSection icon={<MdLocationOn size={18} />} title="Location">
            <div className="grid grid-cols-2 gap-3">
              <InputField label="City *" type="text" placeholder="e.g. Mumbai" value={city} onChange={e => setCity(e.target.value)} />
              <InputField label="State *" type="text" placeholder="e.g. Maharashtra" value={state} onChange={e => setState(e.target.value)} />
            </div>
            <InputField label="Full Address *" type="text" placeholder="Street, Area, Landmark" value={address} onChange={e => setAddress(e.target.value)} />
          </FormSection>

          {/* Hours & Status */}
          <FormSection icon={<FaClock size={16} />} title="Hours & Status">
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Opening Time" type="time" value={openingTime} onChange={e => setOpeningTime(e.target.value)} />
              <InputField label="Closing Time" type="time" value={closingTime} onChange={e => setClosingTime(e.target.value)} />
            </div>
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">Restaurant Status</p>
                <p className="text-xs text-slate-400">{isOpen ? 'Currently accepting orders' : 'Currently closed'}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(p => !p)}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${isOpen ? 'bg-green-500' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${isOpen ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </FormSection>

          {/* Cuisines */}
          <FormSection icon={<FaTag size={15} />} title="Cuisine Tags">
            <p className="text-xs text-slate-500 -mt-2">Select all that apply</p>
            <div className="flex flex-wrap gap-2">
              {CUISINE_OPTIONS.map(c => (
                <CuisineChip
                  key={c}
                  label={c}
                  selected={cuisines.includes(c)}
                  onToggle={toggleCuisine}
                />
              ))}
            </div>
            {cuisines.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-orange-600 font-semibold mt-1">
                <FaCheckCircle />
                {cuisines.length} cuisine{cuisines.length > 1 ? 's' : ''} selected
              </div>
            )}
          </FormSection>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold animate-shake">
              <MdError size={18} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-semibold">
              <FaCheckCircle size={18} className="shrink-0" />
              Shop saved! Redirecting…
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-black text-white text-base shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-60
              bg-gradient-to-r from-orange-500 via-red-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <ClipLoader size={18} color="white" />
                Saving…
              </span>
            ) : (
              isEditing ? '✏️ Update Restaurant' : '🚀 Launch Restaurant'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateEditShop
