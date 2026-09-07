import axios from 'axios';
import React, { useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { ClipLoader } from 'react-spinners';

function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [err, setErr] = useState("")
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault()
    if (!email.trim()) {
      setErr("Please enter your email")
      return
    }
    setLoading(true)
    setErr("")
    try {
      await axios.post(`${serverUrl}/api/auth/send-otp`, { email }, { withCredentials: true })
      setErr("")
      setStep(2)
    } catch (error) {
      setErr(error?.response?.data?.message || (typeof error?.response?.data === 'string' ? error.response.data : null) || error?.message || "Failed to send OTP. Please check your email.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault()
    if (!otp.trim()) {
      setErr("Please enter the OTP")
      return
    }
    setLoading(true)
    setErr("")
    try {
      await axios.post(`${serverUrl}/api/auth/verify-otp`, { email, otp }, { withCredentials: true })
      setErr("")
      setStep(3)
    } catch (error) {
      setErr(error?.response?.data?.message || (typeof error?.response?.data === 'string' ? error.response.data : null) || error?.message || "Invalid or expired OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    if (e) e.preventDefault()
    if (!newPassword) {
      setErr("Please enter a new password")
      return
    }
    if (newPassword.length < 6) {
      setErr("Password must be at least 6 characters long")
      return
    }
    if (newPassword !== confirmPassword) {
      setErr("Passwords do not match")
      return
    }
    setLoading(true)
    setErr("")
    try {
      await axios.post(`${serverUrl}/api/auth/reset-password`, { email, newPassword }, { withCredentials: true })
      setErr("")
      navigate("/signin")
    } catch (error) {
      setErr(error?.response?.data?.message || (typeof error?.response?.data === 'string' ? error.response.data : null) || error?.message || "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex w-full items-center justify-center min-h-screen p-4 bg-[#f7f8f3]'>
      <div className='bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-lime-100'>
        <div className='flex items-center gap-4 mb-6'>
          <IoIosArrowRoundBack size={30} className='text-[#16a34a] cursor-pointer hover:scale-110 transition' onClick={() => navigate("/signin")} />
          <h1 className='text-2xl font-black text-slate-900'>Forgot Password</h1>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <p className='text-sm text-slate-600 mb-4'>Enter your registered email address and we'll send you an OTP to reset your password.</p>
            <div className='mb-6'>
              <label htmlFor="email" className='block text-slate-700 font-semibold mb-1'>Email</label>
              <input 
                id="email"
                type="email" 
                className='w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500' 
                placeholder='Enter your Email' 
                onChange={(e) => setEmail(e.target.value)} 
                value={email} 
                required 
              />
            </div>
            <button 
              type="submit"
              className='w-full font-bold py-3 rounded-xl transition bg-[#16a34a] text-white hover:bg-[#15803d] cursor-pointer shadow-lg shadow-green-100 disabled:opacity-60' 
              disabled={loading}
            >
              {loading ? <ClipLoader size={20} color='white' /> : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <p className='text-sm text-slate-600 mb-4'>Enter the 4-digit OTP sent to <strong className='text-slate-900'>{email}</strong>.</p>
            <div className='mb-6'>
              <label htmlFor="otp" className='block text-slate-700 font-semibold mb-1'>OTP</label>
              <input 
                id="otp"
                type="text" 
                className='w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 tracking-widest text-center text-lg font-bold' 
                placeholder='Enter OTP' 
                onChange={(e) => setOtp(e.target.value)} 
                value={otp} 
                required 
              />
            </div>
            <button 
              type="submit"
              className='w-full font-bold py-3 rounded-xl transition bg-[#16a34a] text-white hover:bg-[#15803d] cursor-pointer shadow-lg shadow-green-100 disabled:opacity-60' 
              disabled={loading}
            >
              {loading ? <ClipLoader size={20} color='white' /> : "Verify OTP"}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <p className='text-sm text-slate-600 mb-4'>Create a new, strong password for your account.</p>
            <div className='mb-4'>
              <label htmlFor="newPassword" className='block text-slate-700 font-semibold mb-1'>New Password</label>
              <div className='relative'>
                <input 
                  id="newPassword"
                  type={showPassword ? "text" : "password"} 
                  className='w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 pr-10' 
                  placeholder='Enter New Password' 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  value={newPassword}
                  required
                />
                <button 
                  type="button"
                  className='absolute right-3 cursor-pointer top-[16px] text-slate-500' 
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  {!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>
              </div>
            </div>
            <div className='mb-6'>
              <label htmlFor="confirmPassword" className='block text-slate-700 font-semibold mb-1'>Confirm Password</label>
              <input 
                id="confirmPassword"
                type={showPassword ? "text" : "password"} 
                className='w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500' 
                placeholder='Confirm Password' 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                value={confirmPassword} 
                required
              />
            </div>
            <button 
              type="submit"
              className='w-full font-bold py-3 rounded-xl transition bg-[#16a34a] text-white hover:bg-[#15803d] cursor-pointer shadow-lg shadow-green-100 disabled:opacity-60' 
              disabled={loading}
            >
              {loading ? <ClipLoader size={20} color='white' /> : "Reset Password"}
            </button>
          </form>
        )}

        {err && (
          <div className='my-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium text-center leading-relaxed'>
            *{err}
          </div>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
