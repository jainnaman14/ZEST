import React, { useEffect, useRef, useState } from 'react'
import Nav from './Nav'
import { categories } from '../category'
import { useDispatch, useSelector } from 'react-redux'
import FoodCard from './FoodCard'
import UserOrderCard from './UserOrderCard'
import { useNavigate } from 'react-router-dom'
import { setCurrentCity, setUserData, clearCart } from '../redux/userSlice'
import { 
  FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaStar, FaFire,
  FaHome, FaTag, FaGamepad, FaUser, FaCheckCircle, FaSpinner,
  FaRegCopy, FaVolumeMute, FaVolumeUp, FaTrophy, FaArrowLeft,
  FaCoins, FaShippingFast, FaGift, FaBell, FaInfoCircle, FaSearch,
  FaLock, FaCheck, FaMobileAlt
} from 'react-icons/fa'
import { TbReceipt2 } from "react-icons/tb"
import { MdOutlineStorefront } from 'react-icons/md'
import { IoFastFood } from 'react-icons/io5'
import { HiSparkles } from 'react-icons/hi'
import axios from 'axios'
import { serverUrl } from '../App'

// ── Skeleton loaders ─────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className='w-[240px] shrink-0 rounded-[32px] bg-[#0b0c21] overflow-hidden border border-white/5 shadow-sm animate-pulse'>
    <div className='w-full h-[160px] bg-white/5' />
    <div className='p-5 space-y-3'>
      <div className='h-5 bg-white/10 rounded-lg w-3/4' />
      <div className='h-3 bg-white/5 rounded-lg w-1/2' />
    </div>
  </div>
)

const ItemSkeleton = () => (
  <div className='rounded-[32px] bg-[#0b0c21] border border-white/5 p-4 overflow-hidden animate-pulse'>
    <div className='w-full h-[180px] bg-white/5 rounded-2xl' />
    <div className='p-4 space-y-3'>
      <div className='h-5 bg-white/10 rounded-lg w-2/3' />
      <div className='h-4 bg-white/5 rounded-lg w-1/3' />
      <div className='h-10 bg-white/10 rounded-xl mt-2' />
    </div>
  </div>
)

// ── Horizontal scroll ─────────────────────────────────────────────────────────
function HScroll({ children, loading, skeleton }) {
  const ref = useRef()
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(false)

  const update = () => {
    const el = ref.current
    if (!el) return
    setShowLeft(el.scrollLeft > 0)
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    update()
    el.addEventListener('scroll', update)
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', update); ro.disconnect() }
  }, [children])

  const scroll = dir => ref.current?.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' })

  return (
    <div className='relative'>
      {showLeft && (
        <button onClick={() => scroll('left')} className='absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/10 border border-white/10 rounded-full shadow-lg flex items-center justify-center hover:bg-white/20 transition active:scale-90 cursor-pointer text-white'>
          <FaChevronLeft size={14} />
        </button>
      )}
      <div ref={ref} className='flex gap-5 overflow-x-auto scroll-smooth pb-3 scrollbar-hide'>
        {loading ? Array(5).fill(0).map((_, i) => <React.Fragment key={i}>{skeleton}</React.Fragment>) : children}
      </div>
      {showRight && (
        <button onClick={() => scroll('right')} className='absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/10 border border-white/10 rounded-full shadow-lg flex items-center justify-center hover:bg-white/20 transition active:scale-90 cursor-pointer text-white'>
          <FaChevronRight size={14} />
        </button>
      )}
    </div>
  )
}

// ── Category chip ─────────────────────────────────────────────────────────────
function CateChip({ name, image, active, onClick }) {
  return (
    <button onClick={onClick} className='flex flex-col items-center gap-2.5 shrink-0 px-2 transition-all cursor-pointer group'>
      <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 transition-all duration-300 ${active ? 'border-[#00aad2] scale-110 shadow-lg shadow-[#00aad2]/30' : 'border-white/5 group-hover:border-white/20 shadow-sm'}`}>
        <img src={image} alt={name} className='w-full h-full object-cover' />
      </div>
      <span className={`text-xs font-black tracking-tight ${active ? 'text-[#00aad2]' : 'text-slate-400'}`}>{name}</span>
    </button>
  )
}

// ── Shop card ─────────────────────────────────────────────────────────────────
function ShopCard({ shop, onClick, isNew }) {
  const rating = shop.rating > 0 ? shop.rating.toFixed(1) : (4.0 + Math.random() * 0.9).toFixed(1)
  const deliveryMin = Math.floor(20 + Math.random() * 20)

  return (
    <button
      onClick={onClick}
      className='w-[260px] shrink-0 rounded-[28px] bg-[#0b0c21] overflow-hidden hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 text-left border border-white/5 group cursor-pointer'
    >
      {/* Image */}
      <div className='relative w-full h-[150px] bg-white/5 overflow-hidden'>
        {shop.image ? (
          <img src={shop.image} alt={shop.name} className='w-full h-full object-cover group-hover:scale-103 transition-transform duration-500' />
        ) : (
          <div className='w-full h-full bg-gradient-to-br from-orange-500 via-pink-500 to-violet-600 flex items-center justify-center'>
            <span className='text-white/60 font-black text-xl'>ZEST</span>
          </div>
        )}
        {/* Overlay badges */}
        <div className='absolute top-3 left-3 flex gap-1.5'>
          {isNew && (
            <span className='flex items-center gap-1 bg-[#00aad2] text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md'>
              <HiSparkles size={11} /> NEW
            </span>
          )}
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shadow-md ${shop.isOpen !== false ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {shop.isOpen !== false ? 'Open' : 'Closed'}
          </span>
        </div>
        <div className='absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-md'>
          <FaStar className='text-amber-400' size={10} />
          {rating}
        </div>
      </div>

      {/* Info */}
      <div className='p-4 space-y-1'>
        <p className='font-black text-slate-100 text-base truncate group-hover:text-[#00aad2] transition-colors leading-snug'>{shop.name}</p>
        {shop.cuisines?.length > 0 && (
          <p className='text-xs text-slate-400 truncate font-semibold'>{shop.cuisines.slice(0, 3).join(', ')}</p>
        )}
        <div className='flex items-center justify-between mt-3 pt-3 border-t border-white/5'>
          <p className='text-xs text-slate-400 font-bold flex items-center gap-1.5'>
            <FaMapMarkerAlt size={11} className='text-[#00aad2]' />
            {shop.address ? shop.address.split(',')[0] : shop.city}
          </p>
          <p className='text-[11px] font-black text-slate-300 bg-white/5 px-2 py-0.5 rounded-md'>{deliveryMin} min • Free delivery</p>
        </div>
      </div>
    </button>
  )
}

// ── Location prompt ───────────────────────────────────────────────────────────
function LocationPrompt({ onSetCity }) {
  const [input, setInput] = useState('')
  return (
    <div className='w-full max-w-md mx-auto bg-[#0b0c21] border border-white/5 rounded-[32px] p-8 shadow-2xl text-center mt-6 relative overflow-hidden text-white'>
      <div className='absolute -top-10 -right-10 w-32 h-32 bg-[#00aad2]/10 rounded-full blur-2xl' />
      <div className='w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 via-pink-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#00aad2]/20 animate-bounce'>
        <FaMapMarkerAlt size={24} className='text-white' />
      </div>
      <h2 className='text-xl font-black text-slate-100 mb-1 tracking-tight'>Set delivery address</h2>
      <p className='text-xs text-slate-400 mb-5 font-medium'>Please enter your city to see restaurants nearby.</p>
      <div className='flex gap-2 max-w-sm mx-auto'>
        <input
          type='text'
          placeholder='Enter city name…'
          className='flex-1 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#00aad2] bg-white/5 text-white font-bold'
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && input.trim() && onSetCity(input.trim())}
        />
        <button
          className='px-5 py-2.5 bg-[#005c6e] hover:bg-[#00aad2] text-white text-xs font-black rounded-xl shadow-md transition'
          disabled={!input.trim()}
          onClick={() => onSetCity(input.trim())}
        >
          Explore
        </button>
      </div>
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
function UserDashboard() {
  const {
    currentCity, shopInMyCity, itemsInMyCity, searchItems,
    locationError, loadingItems, loadingShops, myOrders, userData
  } = useSelector(state => state.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  // Navigation Tabs: 'Home', 'Offers', 'Games', 'Orders', 'Profile'
  const [currentTab, setCurrentTab] = useState('Home')
  const [showLocationChange, setShowLocationChange] = useState(false)
  
  const [activeCategory, setActiveCategory] = useState('All')
  const [filteredItems, setFilteredItems] = useState([])
  const [filteredShops, setFilteredShops] = useState([])
  const [newShopIds, setNewShopIds] = useState(new Set())
  const prevShopCount = useRef(null)

  // Offers/Coupon state
  const [promoCode, setPromoCode] = useState("")
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponMessage, setCouponMessage] = useState("")
  const [copiedCode, setCopiedCode] = useState("")

  // Game hub state
  const [activeGame, setActiveGame] = useState(null) // 'spin', 'ttt', 'match', 'trivia'
  const [gameCoins, setGameCoins] = useState(() => parseInt(localStorage.getItem('zest_game_coins') || '120'))
  const [spinHighScore, setSpinHighScore] = useState(() => parseInt(localStorage.getItem('zest_spin_highscore') || '0'))
  const [tttWins, setTttWins] = useState(() => parseInt(localStorage.getItem('zest_ttt_wins') || '0'))

  const restaurantSectionRef = useRef(null)

  // Filter food items and restaurants based on active category
  useEffect(() => {
    if (!itemsInMyCity) return
    if (activeCategory === 'All') {
      setFilteredItems(itemsInMyCity)
      setFilteredShops(shopInMyCity || [])
    } else {
      // Filter items
      const newItems = itemsInMyCity.filter(i => i.category === activeCategory)
      setFilteredItems(newItems)
      
      // Filter shops that have items in this category
      if (shopInMyCity) {
        const matchingShopIds = new Set(newItems.map(i => typeof i.shop === 'object' ? i.shop._id : i.shop))
        setFilteredShops(shopInMyCity.filter(s => matchingShopIds.has(s._id)))
      }
    }
  }, [itemsInMyCity, shopInMyCity, activeCategory])

  // Detect newly added shops
  useEffect(() => {
    if (!shopInMyCity) return
    if (prevShopCount.current !== null && shopInMyCity.length > prevShopCount.current) {
      setNewShopIds(prev => new Set([...prev, shopInMyCity[0]._id]))
      const id = shopInMyCity[0]._id
      setTimeout(() => setNewShopIds(prev => { const n = new Set(prev); n.delete(id); return n }), 30000)
    }
    prevShopCount.current = shopInMyCity.length
  }, [shopInMyCity?.length])

  const handleApplyPromo = () => {
    const code = promoCode.toUpperCase().trim()
    if (code === "FOODIE20" || code === "FREEDEL" || code === "HOTDEAL" || code === "LUCKY50") {
      setCouponApplied(true)
      setCouponMessage(`🎉 Coupon "${code}" successfully applied!`)
    } else {
      setCouponApplied(false)
      setCouponMessage("⚠️ Invalid promo code. Try again.")
    }
  }

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setPromoCode(code)
    setTimeout(() => setCopiedCode(""), 2000)
  }

  const handleRedeemCoins = () => {
    if (gameCoins < 100) {
      alert("You need at least 100 coins to redeem a discount reward!")
      return
    }
    const newBal = gameCoins - 100
    setGameCoins(newBal)
    localStorage.setItem('zest_game_coins', newBal.toString())
    setPromoCode("LUCKY50")
    alert("🎉 Success! 100 coins redeemed. Coupon code 'LUCKY50' (50% Off) has been applied to your promo box!")
  }

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
      dispatch(setUserData(null))
      navigate("/signin")
    } catch (error) {
      console.log(error)
    }
  }

  const scrollToRestaurants = () => {
    restaurantSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const showLocationPrompt = (locationError && !currentCity) || showLocationChange

  return (
    <div className='w-full min-h-screen zest-bg pb-24 text-slate-900 font-sans antialiased relative'>
      {/* Radial lighting background glow */}
      <div className='absolute top-36 left-[-10%] w-[500px] h-[500px] bg-[#00aad2]/5 rounded-full blur-3xl pointer-events-none' />
      <div className='absolute bottom-48 right-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none' />

      {/* Header bar matching image reference */}
      <nav className='w-full h-[64px] flex items-center justify-between px-4 md:px-8 fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-white/70 shadow-lg text-slate-900'>
        {/* Logo */}
        <button className='flex items-center gap-2.5 shrink-0' onClick={() => { setCurrentTab('Home'); setActiveGame(null) }}>
          <span className='w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 via-pink-500 to-violet-600 text-white grid place-items-center font-black text-sm shadow'>Z</span>
          <span className='text-lg font-black tracking-tight text-slate-950 hidden sm:block'>ZEST</span>
        </button>

        {/* Location selector exactly matching the middle of header in image */}
        <button 
          onClick={() => setShowLocationChange(prev => !prev)}
          className='flex items-center gap-2 cursor-pointer bg-gradient-to-r from-orange-500/10 to-pink-500/10 hover:from-orange-500/15 hover:to-pink-500/15 transition-all duration-300 px-5 py-2.5 rounded-full border border-orange-200 hover:border-orange-400 hover:scale-105 active:scale-95 shadow-md font-outfit text-sm'
        >
          <FaMapMarkerAlt size={16} className='text-orange-500 animate-bounce' />
          <span className='text-slate-700 font-bold text-xs md:text-sm whitespace-nowrap'>
            Deliver to: <span className='font-black text-slate-900 font-montserrat underline decoration-2 decoration-orange-500 underline-offset-4'>{currentCity || "Jaipur"}</span>
          </span>
        </button>

        {/* Bell notification & Profile avatar exactly matching right side of header */}
        <div className='flex items-center gap-3'>
          <button className='p-2.5 text-slate-500 hover:text-orange-600 rounded-xl hover:bg-orange-50 transition relative' onClick={() => alert("No new notifications")}>
            <FaBell size={18} />
            <span className='absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500' />
          </button>

          {/* User Initial Avatar button */}
          <button 
            onClick={() => setCurrentTab('Profile')}
            className='w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 text-white font-black text-sm grid place-items-center shadow hover:scale-103 transition'
          >
            {userData?.fullName?.slice(0, 1)?.toUpperCase()}
          </button>
        </div>
      </nav>

      {/* Render tabs content */}
      <div className='pt-16'>

        {/* ── HOME TAB ──────────────────────────────────────────────────────── */}
        {currentTab === 'Home' && (
          <div>
            {/* Header Tabs navigation menu directly matching Screen 1 image layout */}
            <div className='w-full border-b border-orange-100/60 bg-white/80 backdrop-blur-3xl py-4 px-4 md:px-8 overflow-x-auto scrollbar-hide flex gap-8 text-sm font-black uppercase tracking-wider text-slate-600 select-none items-center justify-start md:justify-center font-montserrat shadow-xs'>
              <button 
                onClick={() => setCurrentTab('Home')} 
                className='text-orange-600 border-b-3 border-orange-500 pb-2 transition-all duration-300 hover:scale-105 hover:text-orange-500 active:scale-95 cursor-pointer whitespace-nowrap font-black tracking-widest text-xs md:text-sm'
              >
                Home
              </button>
              <button 
                onClick={scrollToRestaurants} 
                className='text-slate-600 hover:text-orange-600 pb-2 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap font-black tracking-widest text-xs md:text-sm border-b-3 border-transparent hover:border-orange-300'
              >
                Restaurants
              </button>
              <button 
                onClick={() => setCurrentTab('Offers')} 
                className='text-slate-600 hover:text-orange-600 pb-2 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap font-black tracking-widest text-xs md:text-sm border-b-3 border-transparent hover:border-orange-300'
              >
                Offers
              </button>
              <button 
                onClick={() => setCurrentTab('Games')} 
                className='text-slate-600 hover:text-orange-600 pb-2 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap font-black tracking-widest text-xs md:text-sm border-b-3 border-transparent hover:border-orange-300 flex items-center gap-1.5'
              >
                Game Zone 
                <span className='bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full scale-95 shadow-sm animate-pulse'>NEW</span>
              </button>
              <button 
                onClick={() => setCurrentTab('Orders')} 
                className='text-slate-600 hover:text-orange-600 pb-2 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap font-black tracking-widest text-xs md:text-sm border-b-3 border-transparent hover:border-orange-300'
              >
                Track Order
              </button>
            </div>

            <div className='max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-10'>
              {/* Location selection prompt */}
              {showLocationPrompt && (
                <LocationPrompt onSetCity={city => {
                  dispatch(setCurrentCity(city))
                  setShowLocationChange(false)
                }} />
              )}

              {/* Craving / Hero Section banner matching exact image layout */}
              <div className='zest-card rounded-[36px] p-6 md:p-10 border border-orange-500/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs relative overflow-hidden'>
                <div className='absolute -top-12 -right-12 w-48 h-48 bg-orange-300/10 rounded-full blur-2xl' />
                <div className='space-y-4 max-w-lg text-center md:text-left'>
                  <h1 className='text-3xl md:text-5xl font-black text-slate-950 tracking-tight leading-none'>
                    Craving?<br />We've got <span className='text-orange-500'>you.</span>
                  </h1>
                  <p className='text-slate-600 text-sm font-semibold leading-relaxed'>
                    Delicious meals from your favorite restaurants, delivered fast & fresh.
                  </p>
                  <div className='flex flex-wrap gap-3 justify-center md:justify-start pt-2'>
                    <button onClick={scrollToRestaurants} className='px-6 py-3 bg-[#ff5a36] text-white hover:bg-[#e04523] font-black rounded-2xl shadow-lg transition duration-300 transform active:scale-95 cursor-pointer text-xs uppercase'>
                      Order Now
                    </button>
                    <div className='inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-2 rounded-2xl text-xs font-black shadow-inner'>
                      🔥 50% OFF on your first order
                    </div>
                  </div>
                </div>

                {/* Hero Pizza Image matching layout exactly */}
                <div className='w-48 h-48 md:w-64 md:h-64 shrink-0 rounded-full overflow-hidden shadow-2xl relative border-4 border-white'>
                  <img src="/hero_pizza.png" alt="Delicious Pizza" className='w-full h-full object-cover animate-spin-slow' />
                </div>
              </div>

              {/* Badges bar row directly matching image list layout */}
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div className='flex items-center gap-3 zest-card p-4 rounded-2xl border border-white/70 shadow-xs cursor-pointer hover:bg-white/5 transition' onClick={() => alert("Delivery standard is 30 mins or less.")}>
                  <span className='text-2xl'>🛵</span>
                  <div className='space-y-0.5'>
                    <p className='text-xs font-black text-slate-950 leading-none'>Fast Delivery</p>
                    <p className='text-[10px] text-slate-500 font-semibold'>30 mins or less</p>
                  </div>
                </div>
                <div className='flex items-center gap-3 zest-card p-4 rounded-2xl border border-white/70 shadow-xs cursor-pointer hover:bg-white/5 transition' onClick={() => setCurrentTab('Orders')}>
                  <span className='text-2xl'>📍</span>
                  <div className='space-y-0.5'>
                    <p className='text-xs font-black text-slate-950 leading-none'>Live Tracking</p>
                    <p className='text-[10px] text-slate-500 font-semibold'>Track in real time</p>
                  </div>
                </div>
                <div className='flex items-center gap-3 zest-card p-4 rounded-2xl border border-white/70 shadow-xs cursor-pointer hover:bg-white/5 transition' onClick={() => setCurrentTab('Offers')}>
                  <span className='text-2xl'>🏷️</span>
                  <div className='space-y-0.5'>
                    <p className='text-xs font-black text-slate-950 leading-none'>Best Offers</p>
                    <p className='text-[10px] text-slate-500 font-semibold'>Exclusive deals</p>
                  </div>
                </div>
                <div className='flex items-center gap-3 zest-card p-4 rounded-2xl border border-white/70 shadow-xs cursor-pointer hover:bg-white/5 transition' onClick={() => alert("Payments are 100% encrypted & secure.")}>
                  <span className='text-2xl'>🛡️</span>
                  <div className='space-y-0.5'>
                    <p className='text-xs font-black text-slate-950 leading-none'>Safe Payments</p>
                    <p className='text-[10px] text-slate-500 font-semibold'>100% secure</p>
                  </div>
                </div>
              </div>

              {/* What's on your mind categories matching image row exactly */}
              <section>
                <div className='flex justify-between items-center mb-5'>
                  <h2 className='text-lg font-black text-slate-950 tracking-tight'>What's on your mind?</h2>
                  <button onClick={() => setActiveCategory('All')} className='text-xs text-[#00aad2] font-bold hover:text-cyan-400 transition'>View all</button>
                </div>
                <HScroll>
                  {categories.map((c, i) => (
                    <CateChip
                      key={i}
                      name={c.category}
                      image={c.image}
                      active={activeCategory === c.category}
                      onClick={() => setActiveCategory(c.category)}
                    />
                  ))}
                </HScroll>
              </section>

              {/* Game Zone Banner matching image layout exactly */}
              <div className='bg-gradient-to-br from-[#1b1c3d] via-[#12132d] to-[#0f0e24] text-white rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden border border-white/5'>
                <div className='space-y-3.5 max-w-sm text-center md:text-left z-10'>
                  <div className='flex items-center gap-2 justify-center md:justify-start'>
                    <span className='p-1.5 bg-[#7c3aed]/20 rounded-lg'><FaGamepad className='text-[#8b5cf6]' size={16} /></span>
                    <span className='text-[10px] font-black tracking-widest text-[#a78bfa] uppercase'>GAME ZONE</span>
                  </div>
                  <h3 className='text-2xl font-black leading-tight tracking-tight'>Play games while you wait & win exciting rewards!</h3>
                  <div className='inline-block bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-extrabold text-[#fcd34d]'>
                    Win up to 20% OFF coupon 🎫
                  </div>
                  <button onClick={() => setCurrentTab('Games')} className='block w-full sm:w-auto px-6 py-2.5 bg-[#7c3aed] text-white hover:bg-[#6d28d9] font-black rounded-xl shadow-lg transition-all duration-300 transform active:scale-95 cursor-pointer text-xs uppercase tracking-wider text-center'>
                    Play Now
                  </button>
                </div>

                {/* Generated Game Zone character graphic illustration */}
                <div className='w-40 h-40 md:w-56 md:h-56 shrink-0 relative z-10'>
                  <img src="/game_zone_banner.png" alt="Play Zest Games" className='w-full h-full object-contain' />
                </div>
              </div>

              {/* Popular Restaurants matching image grid exactly */}
              {currentCity && (
                <section ref={restaurantSectionRef}>
                  <div className='flex justify-between items-center mb-6'>
                    <h2 className='text-lg font-black text-slate-950 tracking-tight'>Popular Restaurants</h2>
                    <button onClick={() => setActiveCategory('All')} className='text-xs text-[#00aad2] font-bold hover:text-cyan-400 transition'>View all</button>
                  </div>
                  <HScroll loading={loadingShops} skeleton={<CardSkeleton />}>
                    {filteredShops?.length > 0
                      ? filteredShops.map((shop, i) => (
                        <ShopCard
                          key={shop._id || i}
                          shop={shop}
                          isNew={newShopIds.has(shop._id)}
                          onClick={() => navigate(`/shop/${shop._id}`)}
                        />
                      ))
                      : !loadingShops && (
                        <div className='w-full py-12 text-center bg-[#0b0c21] rounded-3xl border border-white/5 px-8'>
                          <MdOutlineStorefront size={40} className='text-slate-500 mx-auto mb-3' />
                          <p className='font-bold text-slate-300 mb-1'>No matching restaurants found</p>
                          <p className='text-xs text-slate-500 font-semibold'>Try choosing another craving filter above.</p>
                        </div>
                      )
                    }
                  </HScroll>
                </section>
              )}

              {/* Offers for you list matching first image bottom row exactly */}
              <section className='space-y-4'>
                <h2 className='text-lg font-black text-slate-950 tracking-tight'>Offers for you</h2>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  {/* Card 1: 20% Off */}
                  <div className='relative bg-red-950/20 border border-red-500/10 rounded-3xl p-5 shadow-xs flex justify-between items-center group overflow-hidden'>
                    <div className='space-y-2.5 z-10'>
                      <p className='text-xs text-[#ffa3b8] font-black uppercase tracking-wider'>FLAT 20% OFF</p>
                      <h4 className='text-base font-black text-slate-200 leading-tight'>On orders above ₹500</h4>
                      <button onClick={() => handleCopyCode("FOODIE20")} className='text-[10px] bg-red-600 text-white font-black px-3 py-1 rounded-xl shadow hover:bg-red-700 transition cursor-pointer'>
                        {copiedCode === "FOODIE20" ? "COPIED" : "Use: FOODIE20"}
                      </button>
                    </div>
                    {/* Food graphic */}
                    <div className='w-16 h-16 shrink-0 z-10'>
                      <img src="/hero_pizza.png" alt="" className='w-full h-full object-contain' />
                    </div>
                  </div>

                  {/* Card 2: Free Delivery */}
                  <div className='relative bg-blue-950/20 border border-blue-500/10 rounded-3xl p-5 shadow-xs flex justify-between items-center group overflow-hidden'>
                    <div className='space-y-2.5 z-10'>
                      <p className='text-xs text-blue-300 font-black uppercase tracking-wider'>FREE DELIVERY</p>
                      <h4 className='text-base font-black text-slate-200 leading-tight'>On orders above ₹300</h4>
                      <button onClick={() => handleCopyCode("FREEDEL")} className='text-[10px] bg-blue-600 text-white font-black px-3 py-1 rounded-xl shadow hover:bg-blue-700 transition cursor-pointer'>
                        {copiedCode === "FREEDEL" ? "COPIED" : "Use: FREEDEL"}
                      </button>
                    </div>
                    {/* Delivery Scooter graphic */}
                    <div className='w-16 h-16 shrink-0 z-10'>
                      <span className='text-4xl'>🛵</span>
                    </div>
                  </div>

                  {/* Card 3: 50% Off */}
                  <div className='relative bg-amber-950/20 border border-amber-500/10 rounded-3xl p-5 shadow-xs flex justify-between items-center group overflow-hidden'>
                    <div className='space-y-2.5 z-10'>
                      <p className='text-xs text-amber-300 font-black uppercase tracking-wider'>50% OFF</p>
                      <h4 className='text-base font-black text-slate-200 leading-tight'>Up to ₹100 savings</h4>
                      <button onClick={() => handleCopyCode("HOTDEAL")} className='text-[10px] bg-amber-600 text-slate-900 font-black px-3 py-1 rounded-xl shadow hover:bg-amber-500 transition cursor-pointer'>
                        {copiedCode === "HOTDEAL" ? "COPIED" : "Use: HOTDEAL"}
                      </button>
                    </div>
                    {/* Burger icon */}
                    <div className='w-16 h-16 shrink-0 z-10 flex items-center justify-center'>
                      <span className='text-4xl'>🍔</span>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        )}

        {/* ── OFFERS TAB ────────────────────────────────────────────────────── */}
        {currentTab === 'Offers' && (
          <div className='max-w-2xl mx-auto px-4 py-8 space-y-6 animate-fade-in'>
            <div className='text-center space-y-1.5'>
              <h1 className='text-3xl font-black text-slate-950 tracking-tight'>Festive Offers!</h1>
              <p className='text-sm text-slate-500 font-semibold'>Exclusive deals tailored for you.</p>
            </div>
            {/* Promo Code Input Box */}
            <div className='bg-[#0b0c21] rounded-3xl p-6 shadow-sm border border-white/5 space-y-4 text-slate-100'>
              <label className='block text-xs font-black uppercase tracking-wider text-slate-400'>HAVE A PROMO CODE?</label>
              <div className='flex gap-2.5'>
                <input
                  type='text'
                  placeholder='Enter code here...'
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className='flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 font-extrabold focus:outline-none focus:ring-2 focus:ring-[#00aad2] transition-all uppercase'
                />
                <button
                  onClick={handleApplyPromo}
                  className='px-6 bg-gradient-to-br from-orange-500 to-pink-600 text-white font-black rounded-2xl shadow-md hover:bg-[#00aad2] transition-all transform active:scale-95 cursor-pointer text-sm uppercase'
                >
                  Apply
                </button>
              </div>
              {couponMessage && (
                <p className={`text-xs font-black leading-normal ${couponApplied ? 'text-green-400' : 'text-rose-400'}`}>
                  {couponMessage}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── GAME ZONE TAB ─────────────────────────────────────────────────── */}
        {currentTab === 'Games' && (
          <div className='max-w-3xl mx-auto px-4 py-8 space-y-8 animate-fade-in'>
            {/* Play & Earn Discounts Header Banner matching Screen 4 layout */}
            <div className='zest-game-card text-white rounded-[32px] p-6 text-center border border-white/5 relative overflow-hidden space-y-3.5 shadow-xl'>
              <div className='absolute -top-12 -right-12 w-48 h-48 bg-[#8b5cf6]/10 rounded-full blur-2xl' />
              <div className='absolute -bottom-12 -left-12 w-48 h-48 bg-[#00aad2]/10 rounded-full blur-2xl' />

              <h1 className='text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2'>
                Play & Earn Discounts! 🌟
              </h1>
              <p className='text-slate-300 text-sm max-w-md mx-auto font-semibold leading-relaxed'>
                Play fun games, earn coins and unlock exciting discounts on your current order.
              </p>
            </div>

            {/* Back button when inside a game */}
            {activeGame && (
              <button 
                onClick={() => setActiveGame(null)} 
                className='flex items-center gap-2 text-sm text-[#005c6e] font-black hover:text-[#00aad2] transition cursor-pointer pb-2'
              >
                <FaArrowLeft /> Exit Game to Play Zone
              </button>
            )}

            {/* Render Game components */}
            {activeGame === 'spin' && <GameSpin onSaveScore={(winCode) => {
              setSpinHighScore(s => s + 1)
              const newCoins = gameCoins + 20
              setGameCoins(newCoins)
              localStorage.setItem('zest_game_coins', newCoins.toString())
            }} />}
            
            {activeGame === 'ttt' && <GameTicTacToe wins={tttWins} onWin={() => {
              setTttWins(w => w + 1)
              const newCoins = gameCoins + 40
              setGameCoins(newCoins)
              localStorage.setItem('zest_game_coins', newCoins.toString())
            }} />}

            {activeGame === 'match' && <GameMatch onWin={() => {
              const newCoins = gameCoins + 30
              setGameCoins(newCoins)
              localStorage.setItem('zest_game_coins', newCoins.toString())
            }} />}

            {activeGame === 'trivia' && <GameTrivia onWin={() => {
              const newCoins = gameCoins + 50
              setGameCoins(newCoins)
              localStorage.setItem('zest_game_coins', newCoins.toString())
            }} />}

            {/* Game Zone selection cards directly matching Screen 4 icons */}
            {!activeGame && (
              <div className='space-y-8'>
                {/* 4 Games Grid matching the icon illustrations exactly */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  
                  {/* Game 1: Spin & Win */}
                  <button 
                    onClick={() => setActiveGame('spin')}
                    className='zest-card border border-white/70 hover:border-orange-200 text-slate-900 rounded-3xl p-5 flex flex-col items-center text-center space-y-3 shadow-md hover:scale-103 transition cursor-pointer group'
                  >
                    <div className='w-16 h-16 rounded-full bg-gradient-to-br from-[#00aad2] to-cyan-600 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/10 group-hover:rotate-45 transition duration-500'>
                      🎡
                    </div>
                    <span className='font-black text-xs group-hover:text-[#00aad2] transition-colors'>Spin & Win</span>
                  </button>

                  {/* Game 2: Food Match (Real Playable Game) */}
                  <button 
                    onClick={() => setActiveGame('match')}
                    className='zest-card border border-white/70 hover:border-orange-200 text-slate-900 rounded-3xl p-5 flex flex-col items-center text-center space-y-3 shadow-md hover:scale-103 transition cursor-pointer group'
                  >
                    <div className='w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/10'>
                      🧩
                    </div>
                    <span className='font-black text-xs group-hover:text-emerald-400 transition-colors'>Food Match</span>
                  </button>

                  {/* Game 3: Food Trivia (Real Playable Game) */}
                  <button 
                    onClick={() => setActiveGame('trivia')}
                    className='zest-card border border-white/70 hover:border-orange-200 text-slate-900 rounded-3xl p-5 flex flex-col items-center text-center space-y-3 shadow-md hover:scale-103 transition cursor-pointer group'
                  >
                    <div className='w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/10'>
                      ❓
                    </div>
                    <span className='font-black text-xs group-hover:text-amber-400 transition-colors'>Trivia Challenge</span>
                  </button>

                  {/* Game 4: Tic-Tac-Toe */}
                  <button 
                    onClick={() => setActiveGame('ttt')}
                    className='zest-card border border-white/70 hover:border-orange-200 text-slate-900 rounded-3xl p-5 flex flex-col items-center text-center space-y-3 shadow-md hover:scale-103 transition cursor-pointer group'
                  >
                    <div className='w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-3xl shadow-lg shadow-rose-500/10 animate-pulse-slow'>
                      🎮
                    </div>
                    <span className='font-black text-xs group-hover:text-rose-400 transition-colors'>ZestBot TTT</span>
                  </button>

                </div>

                {/* Score stats bar directly matching Screen 4 footer */}
                <div className='zest-card border border-white/70 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-white shadow-md'>
                  <div className='flex items-center gap-3.5'>
                    <span className='text-3xl animate-bounce'>🪙</span>
                    <div className='space-y-0.5 text-center sm:text-left'>
                      <p className='text-xs text-slate-400 font-bold uppercase tracking-wider leading-none'>Your Coins</p>
                      <p className='text-2xl font-black text-[#fcd34d]'>{gameCoins} 🪙</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleRedeemCoins}
                    className='w-full sm:w-auto px-6 py-3 bg-[#7c3aed] text-white font-black rounded-2xl shadow-lg transition transform active:scale-95 cursor-pointer text-xs uppercase'
                  >
                    Redeem Rewards
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE TAB ────────────────────────────────────────────────────── */}
        {currentTab === 'Profile' && (
          <div className='max-w-2xl mx-auto px-4 py-8 space-y-6 animate-fade-in'>
            {/* Header card */}
            <div className='zest-card border border-white/70 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center space-y-4 text-white'>
              <div className='w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 via-pink-500 to-violet-600 text-white font-black text-3xl grid place-items-center shadow-lg border-4 border-white'>
                {userData?.fullName?.slice(0, 1)?.toUpperCase()}
              </div>
              <div className='space-y-1'>
                <h2 className='text-2xl font-black text-slate-950 tracking-tight'>{userData?.fullName}</h2>
                <div className='inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-inner'>
                  👑 Member Gold
                </div>
                <p className='text-xs text-slate-500 font-semibold mt-1'>{userData?.email} • {userData?.mobile || "+91 234 567 890"}</p>
              </div>
            </div>

            {/* Logout button */}
            <button 
              onClick={handleLogOut}
              className='w-full py-4 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 font-extrabold rounded-3xl text-sm transition transform active:scale-98 shadow-inner text-center cursor-pointer font-black'
            >
              🚪 Logout
            </button>
          </div>
        )}

        {/* ── ORDERS TAB ────────────────────────────────────────────────────── */}
        {currentTab === 'Orders' && (
          <div className='max-w-2xl mx-auto px-4 py-8 space-y-6 animate-fade-in'>
            <h1 className='text-3xl font-black text-slate-950 tracking-tight mb-6'>My Orders</h1>
            <div className='space-y-6'>
              {myOrders && myOrders.length > 0 ? (
                myOrders.map((order, index) => (
                  <UserOrderCard data={order} key={index} />
                ))
              ) : (
                <div className='text-center py-20 zest-card border border-white/70 rounded-3xl px-6'>
                  <TbReceipt2 size={48} className='text-slate-500 mx-auto mb-3' />
                  <p className='font-black text-slate-300 text-lg mb-1'>No orders placed yet</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ── BOTTOM STICKY NAVIGATION BAR ── */}
      <div className='fixed bottom-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-2xl border-t border-white/70 shadow-2xl flex justify-around items-center py-2 px-4 select-none max-w-lg mx-auto sm:rounded-t-3xl h-20'>
        {[
          { tab: 'Home', label: 'Home', icon: FaHome },
          { tab: 'Explore', label: 'Explore', icon: FaSearch },
          { tab: 'Games', label: 'Game Zone', icon: FaGamepad },
          { tab: 'Orders', label: 'My Orders', icon: TbReceipt2 },
          { tab: 'Profile', label: 'Account', icon: FaUser }
        ].map((item) => {
          const isActive = currentTab === item.tab
          const Icon = item.icon
          return (
            <button
              key={item.tab}
              onClick={() => { setCurrentTab(item.tab); setActiveGame(null) }}
              className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer ${isActive ? 'text-orange-600 font-black' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {isActive ? (
                <div className='w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 shadow-lg shadow-orange-500/30 flex items-center justify-center -translate-y-3 transition-all duration-300 scale-110'>
                  <Icon size={20} className='text-white' />
                </div>
              ) : (
                <div className='p-1 transition-all duration-300'>
                  <Icon size={20} className='text-slate-500' />
                </div>
              )}
              <span className={`text-[10px] font-bold ${isActive ? '-translate-y-2' : ''}`}>{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── SUB-COMPONENT: Game 1 - Lucky Spin Wheel ───────────────────────────────
function GameSpin({ onSaveScore }) {
  const [spinning, setSpinning] = useState(false)
  const [prizeIndex, setPrizeIndex] = useState(null)
  const [rotation, setRotation] = useState(0)
  const [wonPrize, setWonPrize] = useState(null)

  const prizes = [
    { label: "Free Delivery", code: "LUCKYDEL", desc: "No delivery charges!" },
    { label: "₹50 Wallet Cash", code: "WALLET50", desc: "₹50 credited to ZESTWallet." },
    { label: "50% Discount", code: "LUCKY50", desc: "50% off on your current order." },
    { label: "BOGO Offer", code: "LUCKYBOGO", desc: "Buy 1 Get 1 Free on snacks." },
    { label: "₹70 Cash Back", code: "WALLET70", desc: "₹70 cash back on online orders." },
    { label: "Better Luck!", code: "TRYAGAIN", desc: "Keep spinning to win prizes." }
  ]

  const spinWheel = () => {
    if (spinning) return
    setSpinning(true)
    setWonPrize(null)

    const randomSlice = Math.floor(Math.random() * prizes.length)
    const degreesPerSlice = 360 / prizes.length
    const targetDegrees = 360 - (randomSlice * degreesPerSlice) - (degreesPerSlice / 2)
    const extraSpins = 360 * (4 + Math.floor(Math.random() * 3))
    const totalRotation = rotation + extraSpins + targetDegrees

    setRotation(totalRotation)
    setPrizeIndex(randomSlice)

    setTimeout(() => {
      setSpinning(false)
      const selected = prizes[randomSlice]
      setWonPrize(selected)
      if (selected.code !== "TRYAGAIN") {
        onSaveScore(selected.code)
      }
    }, 4500)
  }

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    alert(`Copied "${code}" to clipboard! Use it at checkout.`)
  }

  return (
    <div className='zest-card border border-white/70 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center space-y-6 relative overflow-hidden select-none text-white'>
      <h3 className='font-black text-slate-100 text-lg flex items-center gap-1.5'>🎡 Lucky Spin Wheel</h3>
      <p className='text-xs text-slate-400 max-w-xs font-medium'>Spin once to win discount coupons and wallet credits instantly!</p>

      {/* Wheel Visual Container */}
      <div className='relative w-[240px] h-[240px] flex items-center justify-center'>
        <div className='absolute -top-1.5 z-20 text-3xl text-rose-500 transform -rotate-180 drop-shadow-md select-none'>▲</div>

        <div 
          className='w-full h-full rounded-full border-8 border-[#005c6e] shadow-xl relative overflow-hidden transition-transform duration-[4500ms] cubic-bezier(0.15, 0.85, 0.2, 1)'
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div className='absolute inset-0 bg-[#cbe3fc] rounded-full rotate-0' style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 50%)' }} />
          <div className='absolute inset-0 bg-[#ffa3b8] rounded-full rotate-60' style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 50%)' }} />
          <div className='absolute inset-0 bg-[#e3e7fc] rounded-full rotate-120' style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 50%)' }} />
          <div className='absolute inset-0 bg-[#cbe3fc] rounded-full rotate-180' style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 50%)' }} />
          <div className='absolute inset-0 bg-[#ffa3b8] rounded-full rotate-240' style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 50%)' }} />
          <div className='absolute inset-0 bg-[#e3e7fc] rounded-full rotate-300' style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 50%)' }} />

          {prizes.map((p, idx) => (
            <div 
              key={idx}
              className='absolute top-0 left-0 w-full h-full flex justify-center items-start pt-6 font-extrabold text-[#005c6e] text-[9px] select-none uppercase tracking-wider'
              style={{ transform: `rotate(${idx * 60 + 30}deg)`, transformOrigin: '50% 50%' }}
            >
              <span className='max-w-[50px] leading-tight text-center'>{p.label.split(' ')[0]}</span>
            </div>
          ))}
        </div>

        <button 
          onClick={spinWheel}
          disabled={spinning}
          className='absolute z-10 w-16 h-16 rounded-full bg-white border-4 border-[#005c6e] font-black text-slate-800 text-xs shadow-xl flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-80 active:scale-95 cursor-pointer select-none'
        >
          {spinning ? "SPINNING" : "SPIN"}
        </button>
      </div>

      {wonPrize && (
        <div className='bg-white/5 border border-white/5 rounded-2xl p-4 w-full max-w-xs space-y-3.5 animate-scale-in text-white'>
          <div>
            <h4 className='text-sm font-black text-[#00aad2]'>{wonPrize.label}</h4>
            <p className='text-xs text-slate-500 font-semibold mt-0.5'>{wonPrize.desc}</p>
          </div>
          {wonPrize.code !== "TRYAGAIN" ? (
            <div className='flex gap-2 justify-center items-center'>
              <span className='font-black border-2 border-dashed border-[#005c6e]/40 px-3.5 py-1.5 rounded-xl bg-white/5 text-white text-xs tracking-wider'>{wonPrize.code}</span>
              <button 
                onClick={() => handleCopyCode(wonPrize.code)}
                className='p-2.5 bg-[#005c6e] hover:bg-[#00aad2] text-white rounded-xl shadow-xs transition transform active:scale-95 cursor-pointer'
              >
                <FaRegCopy size={13} />
              </button>
            </div>
          ) : (
            <button onClick={spinWheel} className='px-4 py-2 bg-[#00aad2] text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm'>Try Again</button>
          )}
        </div>
      )}
    </div>
  )
}

// ── SUB-COMPONENT: Game 2 - Tic-Tac-Toe vs ZestBot ──────────────────────────
function GameTicTacToe({ wins, onWin }) {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [winner, setWinner] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ]
    for (let line of lines) {
      const [a, b, c] = line
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }
    if (squares.every(s => s !== null)) return 'Draw'
    return null
  }

  const makeMove = (idx) => {
    if (!isPlaying || board[idx] || !isPlayerTurn || winner) return

    const newBoard = [...board]
    newBoard[idx] = 'X'
    setBoard(newBoard)

    const outcome = checkWinner(newBoard)
    if (outcome) {
      handleGameOver(outcome)
      return
    }

    setIsPlayerTurn(false)

    setTimeout(() => {
      const emptyIndices = newBoard.map((s, i) => s === null ? i : null).filter(i => i !== null)
      if (emptyIndices.length > 0) {
        let botIdx = -1
        const winLines = [
          [0, 1, 2], [3, 4, 5], [6, 7, 8],
          [0, 3, 6], [1, 4, 7], [2, 5, 8],
          [0, 4, 8], [2, 4, 6]
        ]
        for (let line of winLines) {
          const [a, b, c] = line
          if (newBoard[a] === 'X' && newBoard[b] === 'X' && newBoard[c] === null) botIdx = c
          if (newBoard[a] === 'X' && newBoard[c] === 'X' && newBoard[b] === null) botIdx = b
          if (newBoard[b] === 'X' && newBoard[c] === 'X' && newBoard[a] === null) botIdx = a
        }

        if (botIdx === -1) {
          botIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
        }

        newBoard[botIdx] = 'O'
        setBoard(newBoard)

        const botOutcome = checkWinner(newBoard)
        if (botOutcome) {
          handleGameOver(botOutcome)
          return
        }
      }
      setIsPlayerTurn(true)
    }, 600)
  }

  const handleGameOver = (outcome) => {
    setWinner(outcome)
    if (outcome === 'X') {
      onWin()
    }
  }

  const startNewGame = () => {
    setBoard(Array(9).fill(null))
    setWinner(null)
    setIsPlayerTurn(true)
    setIsPlaying(true)
  }

  return (
    <div className='zest-card border border-white/70 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center space-y-5 select-none text-white'>
      <h3 className='font-black text-slate-100 text-lg flex items-center gap-1.5'>❌ ZestBot Tic-Tac-Toe</h3>
      <p className='text-xs text-slate-400 max-w-xs font-semibold'>Win against our ZestBot to claim the champion title!</p>

      {isPlaying && (
        <div className='text-xs font-black px-4 py-2 bg-white/5 rounded-xl text-slate-300 border border-white/5'>
          {winner ? (
            winner === 'X' ? "🎉 You Won the match!" : winner === 'O' ? "🤖 ZestBot Won! Try again." : "🤝 It's a draw!"
          ) : (
            isPlayerTurn ? "🎯 Your Turn (X)" : "🤖 ZestBot is thinking (O)..."
          )}
        </div>
      )}

      <div className='grid grid-cols-3 gap-3 w-[220px] h-[220px] bg-white/5 p-3 rounded-2xl border border-white/5'>
        {isPlaying ? (
          board.map((cell, idx) => (
            <button
              key={idx}
              onClick={() => makeMove(idx)}
              className={`w-full h-full rounded-xl text-2xl font-black flex items-center justify-center shadow-xs transition-all cursor-pointer ${cell === 'X' ? 'bg-[#cbe3fc] text-[#005c6e]' : cell === 'O' ? 'bg-[#ffb6c7] text-[#6c3f54]' : 'bg-white/5 border border-white/5 hover:bg-white/10 active:scale-95 text-white'}`}
            >
              {cell}
            </button>
          ))
        ) : (
          <div className='col-span-3 flex flex-col items-center justify-center space-y-4 bg-slate-950 text-white rounded-xl h-full p-4 border border-white/5'>
            <div className='text-4xl animate-pulse-slow'>❌</div>
            <p className='text-xs text-slate-500 font-semibold leading-normal'>Beat the bot and raise your TTT rank score.</p>
            <button onClick={startNewGame} className='px-6 py-2.5 bg-[#00aad2] hover:bg-gradient-to-br from-orange-500 to-pink-600 text-white text-xs font-black uppercase rounded-xl shadow-md cursor-pointer'>Start Game</button>
          </div>
        )}
      </div>

      {winner && (
        <button onClick={startNewGame} className='px-6 py-2.5 bg-[#005c6e] hover:bg-[#00aad2] text-white text-xs font-black uppercase rounded-xl shadow-md cursor-pointer'>Play Again</button>
      )}

      <div className='text-[10px] text-slate-400 font-bold'>
        🤖 Total Wins: {wins} matches
      </div>
    </div>
  )
}

// ── SUB-COMPONENT: Game 3 - Food Memory Match Game ─────────────────────────
function GameMatch({ onWin }) {
  const cardsTemplate = ["🍕", "🍔", "🌮", "🍕", "🍔", "🌮"]
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [won, setWon] = useState(false)
  const [moves, setMoves] = useState(0)

  useEffect(() => {
    shuffleCards()
  }, [])

  const shuffleCards = () => {
    const shuffled = [...cardsTemplate].sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setFlipped([])
    setMatched([])
    setWon(false)
    setMoves(0)
  }

  const handleCardClick = (idx) => {
    if (flipped.length === 2 || flipped.includes(idx) || matched.includes(cards[idx]) || won) return

    const newFlipped = [...flipped, idx]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      const [firstIdx, secondIdx] = newFlipped
      if (cards[firstIdx] === cards[secondIdx]) {
        const newMatched = [...matched, cards[firstIdx]]
        setMatched(newMatched)
        setFlipped([])
        if (newMatched.length === cardsTemplate.length / 2) {
          setWon(true)
          onWin()
        }
      } else {
        setTimeout(() => setFlipped([]), 1000)
      }
    }
  }

  return (
    <div className='zest-card border border-white/70 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center space-y-5 select-none text-white'>
      <h3 className='font-black text-slate-100 text-lg flex items-center gap-1.5'>🧩 Food Memory Match</h3>
      <p className='text-xs text-slate-400 max-w-xs font-semibold'>Match all emoji pairs in as few moves as possible!</p>

      {won ? (
        <div className='bg-green-500/10 text-green-400 px-4 py-3 rounded-2xl text-xs font-black border border-green-500/20 animate-scale-in'>
          🎉 Congratulations! You completed it in {moves} moves! +30 Coins added!
        </div>
      ) : (
        <p className='text-xs font-bold text-slate-300'>Moves: {moves}</p>
      )}

      <div className='grid grid-cols-3 gap-3 w-[240px] h-[160px] bg-white/5 p-3 rounded-2xl border border-white/5'>
        {cards.map((emoji, idx) => {
          const isFlipped = flipped.includes(idx) || matched.includes(emoji)
          return (
            <button
              key={idx}
              onClick={() => handleCardClick(idx)}
              className={`w-full h-full rounded-xl text-3xl flex items-center justify-center shadow-xs transition-all duration-300 transform active:scale-95 cursor-pointer ${isFlipped ? 'bg-white/10 border border-white/10 rotate-y-180 text-white' : 'bg-gradient-to-br from-orange-500 via-pink-500 to-violet-600 text-white'}`}
            >
              {isFlipped ? emoji : "?"}
            </button>
          )
        })}
      </div>

      <button onClick={shuffleCards} className='px-6 py-2.5 bg-[#005c6e] hover:bg-[#00aad2] text-white text-xs font-black uppercase rounded-xl shadow-md cursor-pointer'>
        {won ? "Play Again" : "Reset Game"}
      </button>
    </div>
  )
}

// ── SUB-COMPONENT: Game 4 - Food Trivia Quiz Challenge ──────────────────────
function GameTrivia({ onWin }) {
  const questions = [
    {
      q: "Which country is the birthplace of Pizza?",
      options: ["A. France", "B. Italy", "C. USA", "D. Greece"],
      ans: 1
    },
    {
      q: "What is the primary ingredient of traditional Japanese Sushi?",
      options: ["A. Noodles", "B. Bread", "C. Vinegared Rice", "D. Potato"],
      ans: 2
    },
    {
      q: "Which spice is known as 'Black Gold' in ancient history?",
      options: ["A. Cardamom", "B. Pepper", "C. Turmeric", "D. Saffron"],
      ans: 1
    }
  ]

  const [qIdx, setQIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const handleOption = (idx) => {
    setSelected(idx)
    if (idx === questions[qIdx].ans) {
      setScore(s => s + 1)
    }
    setTimeout(() => {
      if (qIdx < questions.length - 1) {
        setQIdx(qIdx + 1)
        setSelected(null)
      } else {
        setGameOver(true)
        if (score + (idx === questions[qIdx].ans ? 1 : 0) === questions.length) {
          onWin()
        }
      }
    }, 1200)
  }

  const restartQuiz = () => {
    setQIdx(0)
    setSelected(null)
    setScore(0)
    setGameOver(false)
  }

  return (
    <div className='zest-card border border-white/70 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center space-y-5 select-none text-white w-full max-w-sm mx-auto'>
      <h3 className='font-black text-slate-100 text-lg flex items-center gap-1.5'>❓ Food Trivia Challenge</h3>

      {gameOver ? (
        <div className='space-y-4 w-full'>
          <div className={`p-4 rounded-2xl text-xs font-black border ${score === questions.length ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
            {score === questions.length 
              ? "🏆 Perfect Score! 3/3 Correct answers. +50 Coins added!" 
              : `Completed! Correct answers: ${score}/3.`
            }
          </div>
          <button onClick={restartQuiz} className='px-6 py-2.5 bg-[#005c6e] hover:bg-[#00aad2] text-white text-xs font-black uppercase rounded-xl shadow-md cursor-pointer'>Try Again</button>
        </div>
      ) : (
        <div className='w-full space-y-4 text-left'>
          <span className='text-[10px] font-black uppercase bg-white/10 text-slate-200 px-2.5 py-1 rounded-full'>
            Question {qIdx + 1} of {questions.length}
          </span>
          <p className='font-black text-slate-100 text-sm leading-snug pt-1'>{questions[qIdx].q}</p>
          <div className='grid grid-cols-1 gap-2'>
            {questions[qIdx].options.map((opt, i) => {
              const isCorrect = i === questions[qIdx].ans
              const isSelected = i === selected
              const btnStyle = isSelected 
                ? (isCorrect ? 'bg-green-600 text-white border-green-600' : 'bg-rose-600 text-white border-rose-600') 
                : (selected !== null && isCorrect ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-white/5 border-white/5 hover:border-white/10 text-slate-300')
              
              return (
                <button
                  key={i}
                  disabled={selected !== null}
                  onClick={() => handleOption(i)}
                  className={`w-full p-3.5 rounded-xl border text-xs font-black transition text-left cursor-pointer ${btnStyle}`}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default UserDashboard