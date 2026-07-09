import React, { useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import { serverUrl } from '../App';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth } from '../../firebase';
import { ClipLoader } from "react-spinners"
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';

function SignUp() {
    const [showPassword, setShowPassword] = useState(false)
    const [role, setRole] = useState("user")
    const navigate = useNavigate()
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [mobile, setMobile] = useState("")
    const [err, setErr] = useState("")
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()

    const handleSignUp = async () => {
        setLoading(true)
        try {
            const result = await axios.post(`${serverUrl}/api/auth/signup`, { fullName, email, password, mobile, role }, { withCredentials: true })
            dispatch(setUserData(result.data))
            setErr("")
        } catch (error) {
            setErr(error?.response?.data?.message)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleAuth = async () => {
        if (!mobile) return setErr("Mobile number is required before signing up with Google")
        setLoading(true)
        setErr("")
        try {
            const provider = new GoogleAuthProvider()
            provider.setCustomParameters({ prompt: 'select_account' })
            const result = await signInWithPopup(auth, provider)
            const { data } = await axios.post(`${serverUrl}/api/auth/google-auth`, {
                fullName: result.user.displayName,
                email: result.user.email,
                role,
                mobile
            }, { withCredentials: true })
            dispatch(setUserData(data))
        } catch (error) {
            // User simply closed the popup — not a real error
            if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
                // silent — user dismissed it
            } else if (error?.code === 'auth/popup-blocked') {
                // Fallback to redirect, save mobile & role first
                localStorage.setItem('zest_signup_mobile', mobile)
                localStorage.setItem('zest_signup_role', role)
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

    // Handle redirect result (only used when popup was blocked)
    React.useEffect(() => {
        const checkRedirect = async () => {
            try {
                const result = await getRedirectResult(auth)
                if (result?.user) {
                    setLoading(true)
                    const savedMobile = localStorage.getItem('zest_signup_mobile') || ""
                    const savedRole = localStorage.getItem('zest_signup_role') || "user"
                    const { data } = await axios.post(`${serverUrl}/api/auth/google-auth`, {
                        fullName: result.user.displayName,
                        email: result.user.email,
                        role: savedRole,
                        mobile: savedMobile
                    }, { withCredentials: true })
                    localStorage.removeItem('zest_signup_mobile')
                    localStorage.removeItem('zest_signup_role')
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
        <div className='min-h-screen w-full flex items-center justify-center p-4 bg-[#f7f8f3]'>
            <div className='bg-white rounded-3xl shadow-xl w-full max-w-md p-8 border border-lime-100'>
                <div className='flex items-center gap-3 mb-6'>
                    <span className='w-11 h-11 rounded-2xl bg-[#16a34a] text-white grid place-items-center font-black'>Z</span>
                    <div>
                        <h1 className='text-3xl font-black text-slate-950'>Join ZEST</h1>
                        <p className='text-slate-500 text-sm'>Create an account for fresh deliveries.</p>
                    </div>
                </div>

                <div className='grid gap-4'>
                    <label className='block'>
                        <span className='block text-slate-700 font-semibold mb-1'>Full Name</span>
                        <input type="text" className='w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500' placeholder='Enter your full name' onChange={(e) => setFullName(e.target.value)} value={fullName} required />
                    </label>
                    <label className='block'>
                        <span className='block text-slate-700 font-semibold mb-1'>Email</span>
                        <input type="email" className='w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500' placeholder='Enter your email' onChange={(e) => setEmail(e.target.value)} value={email} required />
                    </label>
                    <label className='block'>
                        <span className='block text-slate-700 font-semibold mb-1'>Mobile</span>
                        <input type="tel" className='w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500' placeholder='Enter your mobile number' onChange={(e) => setMobile(e.target.value)} value={mobile} required />
                    </label>
                    <label className='block'>
                        <span className='block text-slate-700 font-semibold mb-1'>Password</span>
                        <div className='relative'>
                            <input type={showPassword ? "text" : "password"} className='w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 pr-10' placeholder='Enter your password' onChange={(e) => setPassword(e.target.value)} value={password} required />
                            <button className='absolute right-3 cursor-pointer top-[16px] text-slate-500' onClick={() => setShowPassword(prev => !prev)}>{!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}</button>
                        </div>
                    </label>

                    <div>
                        <span className='block text-slate-700 font-semibold mb-2'>Role</span>
                        <div className='grid grid-cols-3 gap-2'>
                            {["user", "owner", "deliveryBoy"].map((r) => (
                                <button key={r} className={`border rounded-xl px-2 py-3 text-center font-bold transition cursor-pointer text-sm ${role == r ? "bg-[#16a34a] text-white border-[#16a34a]" : "border-lime-100 text-[#16a34a] hover:bg-lime-50"}`} onClick={() => setRole(r)}>
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button className='w-full mt-6 font-bold py-3 rounded-xl transition bg-[#16a34a] text-white hover:bg-[#15803d] cursor-pointer shadow-lg shadow-green-100' onClick={handleSignUp} disabled={loading}>
                    {loading ? <ClipLoader size={20} color='white' /> : "Sign Up"}
                </button>
                {err && <p className='text-red-500 text-center my-3'>*{err}</p>}

                <button className='w-full mt-4 flex items-center justify-center gap-2 border border-slate-200 rounded-xl px-4 py-3 transition cursor-pointer hover:bg-lime-50' onClick={handleGoogleAuth}>
                    <FcGoogle size={20} />
                    <span className='font-semibold'>Sign up with Google</span>
                </button>
                <p className='text-center mt-6 cursor-pointer text-slate-600' onClick={() => navigate("/signin")}>Already have an account? <span className='text-[#16a34a] font-bold'>Sign In</span></p>
            </div>
        </div>
    )
}

export default SignUp