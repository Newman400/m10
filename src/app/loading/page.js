'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function Loading() {
  const [isPressed, setIsPressed] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const intervalRef = useRef(null)
  const timeoutRef = useRef(null)
  const router = useRouter()

  const startProgress = () => {
    if (isCompleted) return
    
    setIsPressed(true)
    setProgress(0)

    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(intervalRef.current)
          setIsCompleted(true)
          timeoutRef.current = setTimeout(() => {
            router.push('/verify')
          }, 500)
          return 100
        }
        return prev + 2
      })
    }, 100)
  }

  const stopProgress = () => {
    if (isCompleted) return
    
    setIsPressed(false)
    setProgress(0)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Security Check</h1>
        <p className="text-gray-600 mb-8">Hold the button below for 5 seconds to continue</p>

        <div className="relative mb-8">
          <button
            className={`relative w-32 h-32 rounded-full border-4 flex items-center justify-center text-white font-semibold text-lg transition-all duration-200 ${
              isCompleted 
                ? 'bg-green-500 border-green-600 cursor-default' 
                : isPressed 
                  ? 'bg-blue-600 border-blue-700 scale-95' 
                  : 'bg-blue-500 border-blue-600 hover:bg-blue-600 active:scale-95'
            }`}
            onMouseDown={startProgress}
            onMouseUp={stopProgress}
            onMouseLeave={stopProgress}
            onTouchStart={startProgress}
            onTouchEnd={stopProgress}
            disabled={isCompleted}
          >
            {isCompleted ? '✓' : 'HOLD'}
          </button>

          <svg 
            className="absolute top-0 left-0 w-32 h-32 -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="4"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={isCompleted ? "#10b981" : "#3b82f6"}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-100 ease-linear"
            />
          </svg>
        </div>

        <div className="text-sm text-gray-500">
          {isCompleted ? (
            <p className="text-green-600 font-semibold">Verification complete! Redirecting...</p>
          ) : isPressed ? (
            <p>Keep holding... {Math.floor(progress / 20)}/5 seconds</p>
          ) : (
            <p>Press and hold the button above</p>
          )}
        </div>
      </div>
    </div>
  )
}