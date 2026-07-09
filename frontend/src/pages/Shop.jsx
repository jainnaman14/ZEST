import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { serverUrl } from '../App'
import { useNavigate, useParams } from 'react-router-dom'
import { FaStore, FaPhone, FaStar, FaFire, FaClock, FaTag, FaHeart, FaChevronLeft, FaArrowLeft, FaRegHeart, FaUtensils } from 'react-icons/fa'
import { FaLocationDot } from 'react-icons/fa6'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart, removeCartItem, updateQuantity, clearCart } from '../redux/userSlice'
import Nav from '../components/Nav'
import { MdOutlineStorefront } from 'react-icons/md'

const ListItemSkeleton = () => (
  <div className='flex items-center justify-between p-4 bg-[#0b0c21] border border-white/5 rounded-3xl animate-pulse gap-4'>
    <div className='flex-1 space-y-2'>
      <div className='h-4 bg-white/10 rounded w-1/3' />
      <div className='h-3 bg-white/5 rounded w-2/3' />
      <div className='h-3.5 bg-white/10 rounded w-1/5' />
    </div>
    <div className='w-24 h-24 bg-white/5 rounded-2xl shrink-0' />
  </div>
)

function Shop() {
  const { shopId } = useParams()
  const [items, setItems] = useState([])
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [menuFilter, setMenuFilter] = useState('recommended')
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Filter items dynamically based on tab selection
  const getFilteredMenu = () => {
    if (menuFilter === 'recommended') return items
    if (menuFilter === 'bestsellers') {
      return items.filter(item => 
        item.name.toLowerCase().includes('biryani') || 
        item.name.toLowerCase().includes('butter') || 
        item.name.toLowerCase().includes('paneer') || 
        item.name.toLowerCase().includes('tikka') ||
        (item.rating?.average && item.rating.average >= 4.0)
      )
    }
    if (menuFilter === 'kebabs') {
      return items.filter(item => 
        item.name.toLowerCase().includes('kebab') || 
        item.name.toLowerCase().includes('tikka') || 
        item.name.toLowerCase().includes('galouti')
      )
    }
    if (menuFilter === 'biryani') {
      return items.filter(item => 
        item.name.toLowerCase().includes('biryani') || 
        item.name.toLowerCase().includes('rice')
      )
    }
    if (menuFilter === 'meals') {
      return items.filter(item => 
        item.name.toLowerCase().includes('meal') || 
        item.name.toLowerCase().includes('thali') || 
        item.name.toLowerCase().includes('combo')
      )
    }
    return items
  }

  const filteredMenu = getFilteredMenu()

  const { cartItems } = useSelector(state => state.user)

  // Calculate total amount in cart
  const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleShop = async () => {
    setLoading(true)
    try {
      const result = await axios.get(`${serverUrl}/api/item/get-by-shop/${shopId}`, { withCredentials: true })
      setShop(result.data.shop)
      setItems(result.data.items)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleShop()
  }, [shopId])

  const rating = shop?.rating > 0 ? shop.rating.toFixed(1) : (4.0 + Math.random() * 0.9).toFixed(1)
  const deliveryMin = Math.floor(20 + Math.random() * 20)

  // Add / Quantity Stepper handlers
  const handleAddToCartItem = (item) => {
    const itemShopId = typeof item.shop === 'object' ? item.shop._id : item.shop
    const itemShopName = typeof item.shop === 'object' ? item.shop.name : (shop?.name || "this restaurant")

    if (cartItems.length > 0 && cartItems[0].shop !== itemShopId) {
      if (window.confirm("Items from another restaurant are already in your cart. Discard those items and add this item?")) {
        dispatch(clearCart())
      } else {
        return
      }
    }

    dispatch(addToCart({
      id: item._id,
      name: item.name,
      price: item.price,
      image: item.image,
      shop: itemShopId,
      shopName: itemShopName,
      quantity: 1,
      foodType: item.foodType || 'veg'
    }))
  }

  const handleIncreaseQty = (itemId, currentQty) => {
    dispatch(updateQuantity({ id: itemId, quantity: currentQty + 1 }))
  }

  const handleDecreaseQty = (itemId, currentQty) => {
    if (currentQty <= 1) {
      dispatch(removeCartItem(itemId))
    } else {
      dispatch(updateQuantity({ id: itemId, quantity: currentQty - 1 }))
    }
  }

  return (
    <div className='min-h-screen bg-[#070814] pb-24 text-white font-sans antialiased relative'>
      <Nav />

      {/* Main content wrapper */}
      <div className='pt-16 max-w-2xl mx-auto px-4 relative'>
        
        {/* Cover Photo */}
        <div className='relative w-full h-[220px] rounded-b-[40px] overflow-hidden shadow-md bg-slate-900'>
          {shop?.image ? (
            <img src={shop.image} alt={shop.name} className='w-full h-full object-cover opacity-85' />
          ) : (
            <div className='w-full h-full bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center'>
              <span className='text-white/25 font-black text-3xl tracking-widest'>ZEST PREMIUM</span>
            </div>
          )}
          {/* Cover gradient overlay */}
          <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />

          {/* Back button */}
          <button
            onClick={() => navigate('/')}
            className='absolute top-4 left-4 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center shadow-lg transition transform active:scale-90 cursor-pointer text-white'
          >
            <FaArrowLeft size={14} />
          </button>

          {/* Save/Favorite button */}
          <button
            onClick={() => alert("Added to favorites!")}
            className='absolute top-4 right-4 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center shadow-lg transition transform active:scale-90 cursor-pointer text-white'
          >
            <FaRegHeart size={14} className='text-rose-400' />
          </button>
        </div>

        {/* Restaurant Profile details box overlay */}
        {shop && (
          <div className='bg-[#0b0c21] border border-white/5 rounded-[32px] p-6 shadow-xl -mt-16 mx-4 relative z-10 space-y-4 text-center md:text-left text-white'>
            
            {/* Logo Avatar */}
            <div className='w-16 h-16 rounded-full bg-gradient-to-br from-[#005c6e] to-[#00aad2] text-white font-black text-xl flex items-center justify-center mx-auto md:mx-0 shadow-lg border-4 border-[#0b0c21] -mt-14'>
              {shop.name.slice(0, 1).toUpperCase()}
            </div>

            {/* Name & Rating header */}
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-2.5 pt-2'>
              <div className='space-y-0.5 text-center md:text-left'>
                <h1 className='text-2xl font-black text-slate-100 tracking-tight leading-none'>{shop.name}</h1>
                <p className='text-xs font-semibold text-slate-400'>{shop.cuisines?.join(', ') || "North Indian, Fast Food"}</p>
              </div>
              <div className='inline-flex items-center gap-1 bg-green-500/10 text-green-400 border border-green-800/20 px-3.5 py-1.5 rounded-full text-xs font-black shadow-inner self-center md:self-auto'>
                <FaStar size={11} className='text-green-400 animate-pulse' />
                <span>{rating} <span className='text-slate-500 font-bold'>(2.3k+ reviews)</span></span>
              </div>
            </div>

            {/* Sub description */}
            <p className='text-xs text-slate-400 font-semibold leading-relaxed'>
              {shop.description || "Experience the richness of Indian cuisine with our authentic flavors and aromatic spices."}
            </p>

            <hr className='border-white/5' />

            {/* Meta Row: clock, free delivery, cost */}
            <div className='grid grid-cols-3 gap-2 text-center text-slate-400 font-extrabold text-[11px] uppercase tracking-wider py-1'>
              <div className='space-y-1 border-r border-white/5'>
                <p className='text-slate-500 text-[10px] font-bold'>DELIVERY TIME</p>
                <p className='text-slate-100'>{deliveryMin}-{deliveryMin+10} mins</p>
              </div>
              <div className='space-y-1 border-r border-white/5'>
                <p className='text-slate-500 text-[10px] font-bold'>DELIVERY COST</p>
                <p className='text-green-400'>Free Delivery</p>
              </div>
              <div className='space-y-1'>
                <p className='text-slate-500 text-[10px] font-bold'>COST FOR TWO</p>
                <p className='text-slate-100'>₹250 for two</p>
              </div>
            </div>

          </div>
        )}

        {/* Flat 20% OFF coupon banner directly matching image */}
        <div className='bg-amber-950/20 border border-amber-500/10 rounded-3xl p-4 mt-6 mx-4 flex justify-between items-center text-amber-200 shadow-xs'>
          <div className='space-y-0.5'>
            <p className='text-xs font-black text-amber-300 uppercase tracking-wider leading-none'>Flat 20% OFF</p>
            <p className='text-[10px] text-slate-400 font-semibold'>on all menu orders above ₹500</p>
          </div>
          <div className='border-2 border-dashed border-amber-500/20 px-3 py-1 text-xs font-black rounded-xl bg-white/5 text-amber-300 tracking-wider'>
            Use Code: TANDOORI20
          </div>
        </div>

        {/* Horizontal filter tabs exactly matching Screen 2 */}
        <div className='flex gap-4 border-b border-white/5 py-3 mt-6 overflow-x-auto scrollbar-hide text-xs font-black uppercase text-slate-400 select-none'>
          <button 
            onClick={() => setMenuFilter('recommended')}
            className={`pb-2.5 transition whitespace-nowrap cursor-pointer ${menuFilter === 'recommended' ? 'text-white border-b-2 border-orange-500 font-black' : 'hover:text-slate-200'}`}
          >
            Recommended
          </button>
          <button 
            onClick={() => setMenuFilter('bestsellers')}
            className={`pb-2.5 transition whitespace-nowrap cursor-pointer ${menuFilter === 'bestsellers' ? 'text-white border-b-2 border-orange-500 font-black' : 'hover:text-slate-200'}`}
          >
            Bestsellers
          </button>
          <button 
            onClick={() => setMenuFilter('kebabs')}
            className={`pb-2.5 transition whitespace-nowrap cursor-pointer ${menuFilter === 'kebabs' ? 'text-white border-b-2 border-orange-500 font-black' : 'hover:text-slate-200'}`}
          >
            Kebabs
          </button>
          <button 
            onClick={() => setMenuFilter('biryani')}
            className={`pb-2.5 transition whitespace-nowrap cursor-pointer ${menuFilter === 'biryani' ? 'text-white border-b-2 border-orange-500 font-black' : 'hover:text-slate-200'}`}
          >
            Biryani
          </button>
          <button 
            onClick={() => setMenuFilter('meals')}
            className={`pb-2.5 transition whitespace-nowrap cursor-pointer ${menuFilter === 'meals' ? 'text-white border-b-2 border-orange-500 font-black' : 'hover:text-slate-200'}`}
          >
            Meals
          </button>
          <button 
            onClick={() => setMenuFilter('recommended')}
            className={`pb-2.5 transition whitespace-nowrap cursor-pointer hover:text-slate-200`}
          >
            More
          </button>
        </div>

        {/* Menu list header */}
        <div className='flex items-center justify-between py-5'>
          <h2 className='text-lg font-black text-slate-100 tracking-tight capitalize'>
            {menuFilter === 'recommended' ? 'Recommended for you' : `${menuFilter} for you`}
          </h2>
          <span className='text-xs text-slate-400 font-bold'>{filteredMenu.length} items</span>
        </div>

        {/* Menu items list block exactly matching design list */}
        <div className='space-y-4'>
          {loading ? (
            Array(4).fill(0).map((_, i) => <ListItemSkeleton key={i} />)
          ) : filteredMenu.length > 0 ? (
            filteredMenu.map((item) => {
              const inCartItem = cartItems.find(c => c.id === item._id)
              const hasQty = inCartItem?.quantity || 0

              return (
                <div 
                  key={item._id}
                  className='bg-[#0b0c21] border border-white/5 rounded-3xl p-5 shadow-xs flex items-center justify-between gap-5 hover:border-white/10 transition-all duration-300'
                >
                  {/* Left content description */}
                  <div className='flex-1 space-y-2 text-left'>
                    <div className='flex items-center gap-2'>
                      {/* Veg indicator badge box */}
                      <div className={`w-4.5 h-4.5 rounded-sm border-2 flex items-center justify-center ${item.foodType === 'non-veg' ? 'border-red-600 bg-white' : 'border-green-600 bg-white'}`}>
                        <div className={`w-2 h-2 rounded-full ${item.foodType === 'non-veg' ? 'bg-red-600' : 'bg-green-600'}`} />
                      </div>
                      <span className='font-black text-slate-100 text-base leading-snug'>{item.name}</span>
                    </div>

                    <p className='text-xs text-slate-400 leading-normal font-semibold max-w-sm line-clamp-2'>
                      {item.description || "Aromatic basmati rice cooked with premium ingredients and spices."}
                    </p>

                    <p className='font-black text-slate-100 text-sm'>
                      ₹{item.price}
                    </p>
                  </div>

                  {/* Right side Image & Add button overlay */}
                  <div className='flex flex-col items-center gap-3 shrink-0 relative'>
                    <div className='w-24 h-24 rounded-2xl overflow-hidden border border-white/5 shadow-sm bg-white/5'>
                      {item.image ? (
                        <img src={item.image} alt={item.name} className='w-full h-full object-cover' />
                      ) : (
                        <div className='w-full h-full bg-[#00aad2]/10 flex items-center justify-center'>
                          <span className='text-[#005c6e] font-black text-xs'>FOOD</span>
                        </div>
                      )}
                    </div>

                    {/* Add button overlay styled precisely */}
                    <div className='absolute -bottom-2.5 z-10'>
                      {hasQty > 0 ? (
                        <div className='flex items-center gap-3 bg-[#ff5a36] text-white px-3.5 py-1.5 rounded-xl shadow-lg border border-[#ff5a36] font-black text-xs select-none animate-scale-in'>
                          <button onClick={() => handleDecreaseQty(item._id, hasQty)} className='p-1 hover:text-orange-200 transition cursor-pointer'><span className='text-sm font-black'>-</span></button>
                          <span>{hasQty}</span>
                          <button onClick={() => handleIncreaseQty(item._id, hasQty)} className='p-1 hover:text-orange-200 transition cursor-pointer'><span className='text-sm font-black'>+</span></button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCartItem(item)}
                          className='px-6 py-2 bg-[#0b0c21] text-[#ff5a36] hover:bg-white/5 border border-white/10 hover:border-orange-200 font-black text-xs rounded-xl shadow-lg transition transform active:scale-95 cursor-pointer uppercase tracking-wider'
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              )
            })
          ) : (
            <div className='text-center py-20 bg-[#0b0c21] rounded-3xl border border-white/5'>
              <FaUtensils size={40} className='text-slate-500 mx-auto mb-3' />
              <p className='font-bold text-slate-300'>No items listed in menu yet.</p>
            </div>
          )}
        </div>

      </div>

      {/* ── Bottom Floating Bar exactly matching Screen 2 ──────────────────── */}
      {totalQty > 0 && (
        <div className='fixed bottom-4 left-4 right-4 z-50 bg-[#ff5a36] text-white rounded-3xl py-4 px-6 shadow-2xl flex justify-between items-center max-w-md mx-auto animate-slide-up select-none'>
          <div className='space-y-0.5 text-left'>
            <p className='text-xs text-white/80 font-bold uppercase tracking-wider leading-none'>{totalQty} Item{totalQty !== 1 ? 's' : ''} Selected</p>
            <p className='text-lg font-black'>₹{totalPrice}</p>
          </div>
          <button 
            onClick={() => navigate('/cart')} 
            className='bg-white text-[#ff5a36] hover:bg-orange-50 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg transition transform active:scale-95 cursor-pointer'
          >
            View Cart
          </button>
        </div>
      )}

    </div>
  )
}

export default Shop
