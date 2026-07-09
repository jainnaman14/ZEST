import React, { useState } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'
import { useSelector, useDispatch } from 'react-redux'
import { setCurrentCity } from '../redux/userSlice'
import { FaStore, FaUtensils, FaCheckCircle, FaSpinner } from 'react-icons/fa'
import { IoArrowBack } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'

const DEMO_CITIES = [
    { city: "Bangalore", state: "Karnataka" },
    { city: "Mumbai", state: "Maharashtra" },
    { city: "Delhi", state: "Delhi" },
    { city: "Hyderabad", state: "Telangana" },
    { city: "Chennai", state: "Tamil Nadu" },
    { city: "Pune", state: "Maharashtra" },
    { city: "Kolkata", state: "West Bengal" },
    { city: "Ahmedabad", state: "Gujarat" },
]

function SeedPage() {
    const [city, setCity] = useState("")
    const [state, setState] = useState("")
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState(null)
    const [error, setError] = useState("")
    const { currentCity } = useSelector(s => s.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleSeed = async (c, s) => {
        const targetCity = c || city
        const targetState = s || state
        if (!targetCity || !targetState) return setError("Please enter both city and state.")
        setLoading(true)
        setError("")
        setResults(null)
        try {
            const { data } = await axios.post(`${serverUrl}/api/seed/seed-city`, {
                city: targetCity, state: targetState
            })
            setResults(data)
            dispatch(setCurrentCity(targetCity))
        } catch (err) {
            setError(err?.response?.data?.message || "Seeding failed. Try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='min-h-screen bg-[#f5f6f0]'>
            {/* Header */}
            <div className='sticky top-0 z-40 bg-white border-b border-slate-100 px-4 md:px-8 h-14 flex items-center gap-3 shadow-sm'>
                <button onClick={() => navigate("/")} className='p-2 rounded-xl hover:bg-slate-100 transition'>
                    <IoArrowBack size={20} className='text-slate-700' />
                </button>
                <h1 className='text-lg font-black text-slate-900'>Add Demo Restaurants</h1>
            </div>

            <div className='max-w-2xl mx-auto px-4 py-8 space-y-6'>
                {/* Info card */}
                <div className='bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6'>
                    <div className='flex items-start gap-4'>
                        <div className='w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0'>
                            <FaStore size={22} className='text-[#16a34a]' />
                        </div>
                        <div>
                            <h2 className='text-lg font-bold mb-1'>Seed Demo Data</h2>
                            <p className='text-slate-400 text-sm'>
                                This will add 6 sample restaurants with 40+ real food items to your selected city.
                                Use this to test the app with real-looking data.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick city buttons */}
                {currentCity && (
                    <div className='bg-green-50 border border-green-200 rounded-2xl p-4'>
                        <p className='text-sm font-semibold text-green-800 mb-3'>
                            Your current city: <span className='font-black'>{currentCity}</span>
                        </p>
                        {(() => {
                            const found = DEMO_CITIES.find(d => d.city.toLowerCase() === currentCity.toLowerCase())
                            return found ? (
                                <button
                                    className='w-full py-3 bg-[#16a34a] text-white font-bold rounded-xl hover:bg-[#15803d] transition flex items-center justify-center gap-2 disabled:opacity-60'
                                    onClick={() => handleSeed(found.city, found.state)}
                                    disabled={loading}
                                >
                                    {loading ? <FaSpinner className='animate-spin' /> : <FaStore />}
                                    Seed restaurants for {found.city}
                                </button>
                            ) : (
                                <p className='text-sm text-slate-600'>Your city is not in the quick list. Use the form below.</p>
                            )
                        })()}
                    </div>
                )}

                {/* Quick select buttons */}
                <div>
                    <p className='text-sm font-bold text-slate-700 mb-3'>Quick select a city:</p>
                    <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                        {DEMO_CITIES.map(d => (
                            <button
                                key={d.city}
                                onClick={() => { setCity(d.city); setState(d.state) }}
                                className={`px-3 py-2 rounded-xl text-sm font-semibold border transition ${city === d.city
                                    ? 'bg-[#16a34a] text-white border-[#16a34a]'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-[#16a34a] hover:text-[#16a34a]'
                                    }`}
                            >
                                {d.city}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom city input */}
                <div className='bg-white rounded-2xl border border-slate-100 p-5 space-y-3'>
                    <p className='font-bold text-slate-900'>Or enter a custom city:</p>
                    <div className='grid grid-cols-2 gap-3'>
                        <div>
                            <label className='text-xs font-semibold text-slate-600 mb-1 block'>City</label>
                            <input
                                type='text'
                                value={city}
                                onChange={e => setCity(e.target.value)}
                                placeholder='e.g. Jaipur'
                                className='w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400'
                            />
                        </div>
                        <div>
                            <label className='text-xs font-semibold text-slate-600 mb-1 block'>State</label>
                            <input
                                type='text'
                                value={state}
                                onChange={e => setState(e.target.value)}
                                placeholder='e.g. Rajasthan'
                                className='w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400'
                            />
                        </div>
                    </div>
                    {error && <p className='text-red-500 text-sm'>{error}</p>}
                    <button
                        className='w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-700 transition flex items-center justify-center gap-2 disabled:opacity-60'
                        onClick={() => handleSeed()}
                        disabled={loading || !city || !state}
                    >
                        {loading ? <><FaSpinner className='animate-spin' /> Seeding…</> : <><FaStore /> Add 6 Restaurants</>}
                    </button>
                </div>

                {/* Results */}
                {results && (
                    <div className='bg-white rounded-2xl border border-green-200 p-5 space-y-3'>
                        <div className='flex items-center gap-2'>
                            <FaCheckCircle className='text-[#16a34a]' size={20} />
                            <p className='font-bold text-slate-900'>{results.message}</p>
                        </div>
                        <div className='space-y-2'>
                            {results.results?.map((r, i) => (
                                <div key={i} className='flex items-center justify-between text-sm py-2 border-b border-slate-50 last:border-0'>
                                    <div className='flex items-center gap-2'>
                                        <FaUtensils className='text-[#16a34a]' size={12} />
                                        <span className='font-semibold text-slate-800'>{r.name}</span>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.status === 'created' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {r.status === 'created' ? `✓ ${r.items} items` : 'Already exists'}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button
                            className='w-full py-3 bg-[#16a34a] text-white font-bold rounded-xl hover:bg-[#15803d] transition'
                            onClick={() => navigate("/")}
                        >
                            Browse Restaurants →
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SeedPage
