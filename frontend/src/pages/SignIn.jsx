import React, { useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import { serverUrl } from '../App';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth } from '../../firebase';
import { ClipLoader } from 'react-spinners';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';

function SignIn() {
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [err, setErr] = useState("")
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()

    const handleSignIn = async () => {
        setLoading(true)
        try {
            const result = await axios.post(`${serverUrl}/api/auth/signin`, { email, password }, { withCredentials: true })
            dispatch(setUserData(result.data))
            setErr("")
        } catch (error) {
            setErr(error?.response?.data?.message)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleAuth = async () => {
        setLoading(true)
        setErr("")
        try {
            const provider = new GoogleAuthProvider()
            provider.setCustomParameters({ prompt: 'select_account' })
            const result = await signInWithPopup(auth, provider)
            const { data } = await axios.post(`${serverUrl}/api/auth/google-auth`, {
                fullName: result.user.displayName,
                email: result.user.email,
                role: "user",
                mobile: result.user.phoneNumber || ""
            }, { withCredentials: true })
            dispatch(setUserData(data))
        } catch (error) {
            // User simply closed the popup — not a real error, don't show anything
            if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
                // silent — user dismissed it
            } else if (error?.code === 'auth/popup-blocked') {
                // Browser blocked popup — fallback to redirect
                setErr("Popup was blocked. Trying redirect...")
                const provider = new GoogleAuthProvider()
                provider.setCustomParameters({ prompt: 'select_account' })
                await signInWithRedirect(auth, provider)
            } else {
                setErr(error?.response?.data?.message || error?.message || "Google sign-in failed")
            }
        } finally {
            setLoading(false)
        }
    }

    // Handle redirect result (fallback when popup was blocked)
    React.useEffect(() => {
        const checkRedirect = async () => {
            try {
                const result = await getRedirectResult(auth)
                if (result?.user) {
                    setLoading(true)
                    const { data } = await axios.post(`${serverUrl}/api/auth/google-auth`, {
                        fullName: result.user.displayName,
                        email: result.user.email,
                        role: "user",
                        mobile: result.user.phoneNumber || ""
                    }, { withCredentials: true })
                    dispatch(setUserData(data))
                }
            } catch (error) {
                if (error?.code !== 'auth/no-auth-event') {
                    setErr(error?.response?.data?.message || error?.message || "")
                }
            } finally {
                setLoading(false)
            }
        }
        checkRedirect()
    }, [])

    return (
        <div className='min-h-screen w-full grid md:grid-cols-[1.05fr_0.95fr] bg-[#f7f8f3]'>
            <div className='hidden md:flex flex-col justify-between p-10 bg-slate-950 text-white'>
                <div className='flex items-center gap-3'>
                    <span className='w-12 h-12 rounded-2xl bg-[#16a34a] grid place-items-center font-black text-xl'>Z</span>
                    <span className='text-3xl font-black'>ZEST</span>
                </div>
                <div>
                    <p className='text-sm uppercase tracking-[0.3em] text-lime-300 font-semibold'>Fresh local delivery</p>
                    <h1 className='text-5xl font-black mt-4 leading-tight'>Your next meal should feel effortless.</h1>
                    <p className='text-slate-300 mt-5 max-w-md'>Sign in to reorder favorites, discover nearby kitchens, and track every delivery in real time.</p>
                </div>
                <p className='text-slate-500 text-sm'>Fast food discovery for hungry moments.</p>
            </div>

            <div className='flex items-center justify-center p-4'>
                <div className='bg-white rounded-3xl shadow-xl w-full max-w-md p-8 border border-lime-100'>
                    <h1 className='text-4xl font-black mb-2 text-slate-950'>Welcome to <span className='text-[#16a34a]'>ZEST</span></h1>
                    <p className='text-slate-600 mb-8'>Sign in to continue ordering fresh favorites.</p>

                    <div className='mb-4'>
                        <label htmlFor="email" className='block text-slate-700 font-semibold mb-1'>Email</label>
                        <input type="email" className='w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500' placeholder='Enter your email' onChange={(e) => setEmail(e.target.value)} value={email} required />
                    </div>

                    <div className='mb-4'>
                        <label htmlFor="password" className='block text-slate-700 font-semibold mb-1'>Password</label>
                        <div className='relative'>
                            <input type={showPassword ? "text" : "password"} className='w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 pr-10' placeholder='Enter your password' onChange={(e) => setPassword(e.target.value)} value={password} required />
                            <button className='absolute right-3 cursor-pointer top-[16px] text-slate-500' onClick={() => setShowPassword(prev => !prev)}>{!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}</button>
                        </div>
                    </div>

                    <button className='text-right mb-4 cursor-pointer text-[#16a34a] font-semibold w-full' onClick={() => navigate("/forgot-password")}>Forgot Password</button>

                    <button className='w-full font-bold py-3 rounded-xl transition bg-[#16a34a] text-white hover:bg-[#15803d] cursor-pointer shadow-lg shadow-green-100' onClick={handleSignIn} disabled={loading}>
                        {loading ? <ClipLoader size={20} color='white' /> : "Sign In"}
                    </button>
                    {err && <p className='text-red-500 text-center my-3'>*{err}</p>}

                    <button className='w-full mt-4 flex items-center justify-center gap-2 border border-slate-200 rounded-xl px-4 py-3 transition cursor-pointer hover:bg-lime-50' onClick={handleGoogleAuth}>
                        <FcGoogle size={20} />
                        <span className='font-semibold'>Sign In with Google</span>
                    </button>
                    <p className='text-center mt-6 cursor-pointer text-slate-600' onClick={() => navigate("/signup")}>Want to create a new account? <span className='text-[#16a34a] font-bold'>Sign Up</span></p>
                </div>
            </div>
        </div>
    )
}

export default SignIn