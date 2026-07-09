import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'
import { setMyShopData } from '../redux/ownerSlice'
import { ClipLoader } from 'react-spinners'
import { IoIosArrowRoundBack } from 'react-icons/io'
import {
  FaCamera, FaUtensils, FaCheckCircle, FaLeaf, FaDrumstickBite
} from 'react-icons/fa'
import { MdError } from 'react-icons/md'
import { HiSparkles } from 'react-icons/hi'

const CATEGORIES = [
  'Snacks', 'Main Course', 'Desserts', 'Pizza', 'Burgers',
  'Sandwiches', 'South Indian', 'North Indian', 'Chinese', 'Fast Food', 'Others'
]

function EditItem() {
  const navigate = useNavigate()
  const { myShopData } = useSelector(state => state.owner)
  const { itemId } = useParams()
  const dispatch = useDispatch()
  const fileRef = useRef()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [foodType, setFoodType] = useState('veg')
  const [frontendImage, setFrontendImage] = useState('')
  const [backendImage, setBackendImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchItem = async () => {
      setFetching(true)
      try {
        const result = await axios.get(`${serverUrl}/api/item/get-by-id/${itemId}`, { withCredentials: true })
        const item = result.data
        setName(item?.name || '')
        setDescription(item?.description || '')
        setPrice(item?.price || '')
        setCategory(item?.category || '')
        setFoodType(item?.foodType || 'veg')
        setFrontendImage(item?.image || '')
      } catch (err) {
        console.log(err)
      } finally {
        setFetching(false)
      }
    }
    fetchItem()
  }, [itemId])

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setBackendImage(file)
    setFrontendImage(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Food name is required.'); return }
    if (!price || Number(price) <= 0) { setError('Please enter a valid price.'); return }
    if (!category) { setError('Please select a category.'); return }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      formData.append('category', category)
      formData.append('foodType', foodType)
      formData.append('price', price)
      if (backendImage) formData.append('image', backendImage)

      const result = await axios.post(
        `${serverUrl}/api/item/edit-item/${itemId}`,
        formData,
        { withCredentials: true }
      )
      dispatch(setMyShopData(result.data))
      setSuccess(true)
      setTimeout(() => navigate('/'), 1200)
    } catch (err) {
      console.log(err)
      setError(err.response?.data?.message || 'Failed to save changes. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <ClipLoader size={40} color="#f97316" />
          <p className="text-slate-500 mt-3 text-sm font-semibold">Loading item…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-orange-500 via-red-500 to-rose-500 px-6 pt-14 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #fbbf24 0%, transparent 55%)' }} />
        <button
          type="button"
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 flex items-center gap-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full text-sm font-semibold backdrop-blur-sm transition cursor-pointer"
        >
          <IoIosArrowRoundBack size={20} />
          Back
        </button>
        <div className="relative text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
            <FaUtensils className="text-white" size={26} />
          </div>
          <h1 className="text-3xl font-black text-white drop-shadow">Edit Food Item</h1>
          <p className="text-white/70 mt-1 text-sm">Update your menu item</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-xl mx-auto px-4 -mt-10 pb-16">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Image Upload */}
          <div
            onClick={() => fileRef.current?.click()}
            className="relative w-full h-48 rounded-2xl overflow-hidden cursor-pointer border-2 border-dashed border-orange-300 hover:border-orange-500 transition-all group shadow-lg"
          >
            {frontendImage ? (
              <>
                <img src={frontendImage} alt="Food" className="w-full h-full object-cover" />
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
                <p className="text-sm font-bold text-orange-600">Upload Food Photo</p>
                <p className="text-xs text-orange-400">Tap to browse</p>
              </div>
            )}
            <input type="file" accept="image/*" ref={fileRef} onChange={handleImage} className="hidden" />
          </div>

          {/* Basic Details */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/80 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <HiSparkles className="text-orange-500" /> Item Details
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Food Name *</label>
              <input
                type="text"
                placeholder="e.g. Paneer Butter Masala"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Description</label>
              <textarea
                rows={2}
                placeholder="Describe the dish…"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Price (₹) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  placeholder="0"
                  min="1"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/80 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category *</h3>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    category === c
                      ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-orange-400 hover:text-orange-500'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Food Type */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/80 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Food Type *</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFoodType('veg')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm border transition-all cursor-pointer ${
                  foodType === 'veg'
                    ? 'bg-green-500 text-white border-green-500 shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-green-400'
                }`}
              >
                <FaLeaf size={14} />
                Vegetarian
              </button>
              <button
                type="button"
                onClick={() => setFoodType('non veg')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm border transition-all cursor-pointer ${
                  foodType === 'non veg'
                    ? 'bg-red-500 text-white border-red-500 shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-red-400'
                }`}
              >
                <FaDrumstickBite size={14} />
                Non-Veg
              </button>
            </div>
          </div>

          {/* Error */}
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
              Changes saved! Redirecting…
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
              '✏️ Save Changes'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EditItem
