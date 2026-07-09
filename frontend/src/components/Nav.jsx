import React, { useEffect, useRef, useState } from 'react'
import { FaLocationDot } from "react-icons/fa6"
import { IoIosSearch } from "react-icons/io"
import { FiShoppingCart } from "react-icons/fi"
import { useDispatch, useSelector } from 'react-redux'
import { RxCross2 } from "react-icons/rx"
import axios from 'axios'
import { serverUrl } from '../App'
import { setCurrentCity, setItemsInMyCity, setSearchItems, setShopsInMyCity, setUserData, setCurrentAddress, setCurrentState } from '../redux/userSlice'
import { setAddress, setLocation } from '../redux/mapSlice'
import { TbReceipt2 } from "react-icons/tb"
import { useNavigate } from 'react-router-dom'
import { FaPlus } from "react-icons/fa6"
import { HiMenuAlt3 } from "react-icons/hi"

function Nav() {
    const { userData, currentCity, currentAddress, cartItems } = useSelector(state => state.user)
    const { myShopData } = useSelector(state => state.owner)
    const [showInfo, setShowInfo] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [query, setQuery] = useState("")
    const [searching, setSearching] = useState(false)
    const [showCityModal, setShowCityModal] = useState(false)
    const [newCityInput, setNewCityInput] = useState("")
    const [suggestions, setSuggestions] = useState([])
    const [loadingSuggestions, setLoadingSuggestions] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const dropdownRef = useRef(null)
    const debounceRef = useRef(null)
    const autocompleteTimeoutRef = useRef(null)

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowInfo(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleLogOut = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
            dispatch(setUserData(null))
        } catch (error) {
            console.log(error)
        }
    }

    const fetchSuggestions = async (text) => {
        if (!text.trim()) {
            setSuggestions([])
            return
        }
        setLoadingSuggestions(true)
        try {
            const apiKey = import.meta.env.VITE_GEOAPIKEY
            const res = await axios.get(
                `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&filter=countrycode:in&apiKey=${apiKey}`
            )
            setSuggestions(res.data.features || [])
        } catch (e) {
            console.error("Autocomplete error", e)
        } finally {
            setLoadingSuggestions(false)
        }
    }

    const handleCityInputChange = (e) => {
        const val = e.target.value
        setNewCityInput(val)
        clearTimeout(autocompleteTimeoutRef.current)
        autocompleteTimeoutRef.current = setTimeout(() => {
            fetchSuggestions(val)
        }, 300)
    }

    const selectSuggestion = (feat) => {
        const props = feat.properties
        const city = props.city || props.county || props.state || "Bangalore"
        
        dispatch(setCurrentCity(city))
        dispatch(setCurrentState(props.state || ""))
        dispatch(setCurrentAddress(props.formatted || props.name || city))
        
        dispatch(setLocation({ lat: props.lat, lon: props.lon }))
        dispatch(setAddress(props.formatted || props.name || city))
        
        setShowCityModal(false)
        setNewCityInput("")
        setSuggestions([])
    }

    const handleSearchItems = async (q) => {
        if (!q || !currentCity) { dispatch(setSearchItems(null)); return }
        setSearching(true)
        try {
            const result = await axios.get(
                `${serverUrl}/api/item/search-items?query=${q}&city=${currentCity}`,
                { withCredentials: true }
            )
            dispatch(setSearchItems(result.data))
        } catch (error) {
            console.log(error)
        } finally {
            setSearching(false)
        }
    }

    const handleQueryChange = (e) => {
        const val = e.target.value
        setQuery(val)
        clearTimeout(debounceRef.current)
        if (!val.trim()) { dispatch(setSearchItems(null)); return }
        debounceRef.current = setTimeout(() => handleSearchItems(val), 400)
    }

    const clearSearch = () => {
        setQuery("")
        dispatch(setSearchItems(null))
    }

    const searchBar = (
        <div className='flex items-center h-11 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm w-full'>
            <button 
                onClick={() => setShowCityModal(true)}
                className='flex items-center gap-1.5 px-3 border-r border-slate-200 shrink-0 hover:bg-slate-50 transition h-full cursor-pointer'
                title="Change location"
            >
                <FaLocationDot size={13} className="text-orange-600" />
                <span className='text-xs font-bold text-slate-700 max-w-[120px] truncate' title={currentAddress || currentCity || ""}>
                    {currentAddress ? currentAddress.split(',')[0] : (currentCity || "Set location")}
                </span>
            </button>
            <div className='flex items-center flex-1 px-3 gap-2'>
                <IoIosSearch size={18} className='text-slate-400 shrink-0' />
                <input
                    type="text"
                    placeholder='Search food, shops…'
                    className='text-sm text-slate-700 outline-none w-full bg-transparent placeholder:text-slate-400'
                    onChange={handleQueryChange}
                    value={query}
                />
                {query && (
                    <button onClick={clearSearch} className='text-slate-400 hover:text-slate-600'>
                        <RxCross2 size={15} />
                    </button>
                )}
            </div>
        </div>
    )

    return (
        <nav className='w-full h-[64px] flex items-center justify-between px-4 md:px-8 fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-2xl border-b border-orange-100 shadow-sm'>
            {/* Logo */}
            <button className='flex items-center gap-2 shrink-0' onClick={() => navigate("/")}>
                <span className='w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 via-pink-500 to-violet-600 text-white grid place-items-center font-black text-sm shadow'>Z</span>
                <span className='text-xl font-black tracking-tight text-slate-900 hidden sm:block'>ZEST</span>
            </button>

            {/* Search bar – desktop */}
            {userData?.role === "user" && (
                <div className='hidden md:block w-[38%] lg:w-[44%]'>{searchBar}</div>
            )}

            {/* Right actions */}
            <div className='flex items-center gap-2'>
                {/* Mobile search toggle */}
                {userData?.role === "user" && !showSearch && (
                    <button
                        className='md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition'
                        onClick={() => setShowSearch(true)}
                    >
                        <IoIosSearch size={22} />
                    </button>
                )}
                {userData?.role === "user" && showSearch && (
                    <button
                        className='md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition'
                        onClick={() => { setShowSearch(false); clearSearch() }}
                    >
                        <RxCross2 size={22} />
                    </button>
                )}

                {userData?.role === "owner" && myShopData && (
                    <button
                        className='flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 text-white text-sm font-semibold shadow hover:shadow-lg hover:-translate-y-0.5 transition-all'
                        onClick={() => navigate("/add-item")}
                    >
                        <FaPlus size={13} />
                        <span className='hidden sm:inline'>Add Item</span>
                    </button>
                )}

                {userData?.role === "user" && (
                    <button
                        className='flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition'
                        onClick={() => navigate("/my-orders")}
                    >
                        <TbReceipt2 size={18} />
                        <span className='hidden sm:inline'>Orders</span>
                    </button>
                )}

                {userData?.role === "owner" && (
                    <button
                        className='flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition'
                        onClick={() => navigate("/my-orders")}
                    >
                        <TbReceipt2 size={18} />
                        <span className='hidden sm:inline'>Orders</span>
                    </button>
                )}

                {userData?.role === "user" && (
                    <button
                        className='relative p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition'
                        onClick={() => navigate("/cart")}
                    >
                        <FiShoppingCart size={20} />
                        {cartItems.length > 0 && (
                            <span className='absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-[#16a34a] text-white text-[10px] font-bold grid place-items-center'>
                                {cartItems.length}
                            </span>
                        )}
                    </button>
                )}

                {/* Avatar dropdown */}
                <div className='relative' ref={dropdownRef}>
                    <button
                        className='w-9 h-9 rounded-full bg-slate-900 text-white text-sm font-bold grid place-items-center shadow hover:bg-slate-700 transition'
                        onClick={() => setShowInfo(prev => !prev)}
                    >
                        {userData?.fullName?.slice(0, 1)?.toUpperCase()}
                    </button>

                    {showInfo && (
                        <div className='absolute top-12 right-0 w-52 bg-white border border-slate-100 shadow-xl rounded-2xl p-4 flex flex-col gap-3 z-[9999]'>
                            <div>
                                <div className='text-sm font-bold text-slate-900 truncate'>{userData.fullName}</div>
                                <div className='text-[11px] uppercase tracking-widest text-slate-400 mt-0.5'>{userData.role}</div>
                            </div>
                            <hr className='border-slate-100' />
                            {userData.role === "user" && (
                                <button className='text-left text-sm text-slate-700 font-semibold hover:text-[#16a34a] transition' onClick={() => { navigate("/my-orders"); setShowInfo(false) }}>My Orders</button>
                            )}
                            <button className='text-left text-sm text-red-500 font-semibold hover:text-red-700 transition' onClick={handleLogOut}>Log Out</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile search bar drop-down */}
            {showSearch && userData?.role === "user" && (
                <div className='md:hidden absolute top-[64px] left-0 right-0 px-4 py-3 bg-white/85 backdrop-blur-2xl border-b border-orange-100 shadow-sm'>
                    {searchBar}
                </div>
            )}
            
            {showCityModal && (
                <div className='fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-[99999] px-4 animate-fade-in'>
                    <div className='bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 shadow-2xl space-y-4 text-left relative animate-scale-in'>
                        <div className='flex items-center justify-between'>
                            <h3 className='font-black text-lg text-slate-900'>Select Location</h3>
                            <button onClick={() => { setShowCityModal(false); setSuggestions([]); setNewCityInput("") }} className='text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-50 transition cursor-pointer'>
                                <RxCross2 size={18} />
                            </button>
                        </div>
                        <p className='text-xs text-slate-500'>Search for your neighborhood or city (e.g. Civil Lines, Jaipur) to find restaurants nearby.</p>
                        
                        <div className='relative'>
                            <input
                                type="text"
                                placeholder="Search area, neighborhood, city..."
                                value={newCityInput}
                                onChange={handleCityInputChange}
                                className='w-full border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm outline-none focus:ring-2 focus:ring-[#00aad2] bg-slate-50 text-slate-800 font-medium'
                                autoFocus
                            />
                            {loadingSuggestions && (
                                <div className='absolute right-3 top-3.5'>
                                    <div className='animate-spin w-4 h-4 border-2 border-[#00aad2] border-t-transparent rounded-full' />
                                </div>
                            )}
                        </div>

                        {/* Suggestions list */}
                        {suggestions.length > 0 && (
                            <div className='max-h-60 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50 bg-white shadow-inner'>
                                {suggestions.map((feat, i) => (
                                    <button
                                        key={i}
                                        onClick={() => selectSuggestion(feat)}
                                        className='w-full text-left px-4 py-3 hover:bg-cyan-50 transition text-sm text-slate-700 flex flex-col gap-0.5 cursor-pointer'
                                    >
                                        <span className='font-bold text-slate-950'>{feat.properties.name || feat.properties.street || feat.properties.city}</span>
                                        <span className='text-xs text-slate-400 truncate'>{feat.properties.formatted}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Nav