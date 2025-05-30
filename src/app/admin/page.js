'use client'

import { useState, useEffect } from 'react'

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [emails, setEmails] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [redirectUrls, setRedirectUrls] = useState({})
  const [selectedFile, setSelectedFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/check-auth')
        if (response.ok) {
          setIsLoggedIn(true)
          loadEmails()
          loadRedirectUrls()
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }
    checkAuth()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      if (response.ok) {
        setIsLoggedIn(true)
        setPassword('')
        loadEmails()
        loadRedirectUrls()
      } else {
        alert('Invalid password')
      }
    } catch (error) {
      alert('Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const loadEmails = async () => {
    try {
      const response = await fetch('/api/admin/emails')
      const data = await response.json()
      setEmails(data.emails || [])
    } catch (error) {
      console.error('Failed to load emails:', error)
    }
  }

  const loadRedirectUrls = async () => {
    try {
      const response = await fetch('/api/admin/redirects')
      const data = await response.json()
      setRedirectUrls(data.redirects || {})
    } catch (error) {
      console.error('Failed to load redirects:', error)
    }
  }

  const handleAddEmail = async (e) => {
    e.preventDefault()
    if (!newEmail) return

    try {
      const response = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail })
      })

      if (response.ok) {
        setNewEmail('')
        loadEmails()
      } else {
        const data = await response.json()
        alert(data.message || 'Failed to add email')
      }
    } catch (error) {
      alert('Failed to add email')
    }
  }

  const handleDeleteEmail = async (email) => {
    if (!confirm('Are you sure you want to delete this email?')) return

    try {
      const response = await fetch('/api/admin/emails', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        loadEmails()
      } else {
        alert('Failed to delete email')
      }
    } catch (error) {
      alert('Failed to delete email')
    }
  }

  const handleImport = async (e) => {
    e.preventDefault()
    if (!selectedFile) return

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch('/api/admin/import', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Imported ${data.count} emails successfully`)
        setSelectedFile(null)
        loadEmails()
      } else {
        const data = await response.json()
        alert(data.message || 'Import failed')
      }
    } catch (error) {
      alert('Import failed')
    }
  }

  const handleExport = async (format) => {
    try {
      const response = await fetch(`/api/admin/export?format=${format}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `emails.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      alert('Export failed')
    }
  }

  const handleUpdateRedirect = async (domain, url) => {
    try {
      const response = await fetch('/api/admin/redirects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, url })
      })

      if (response.ok) {
        loadRedirectUrls()
        alert('Redirect URL updated successfully')
      } else {
        alert('Failed to update redirect URL')
      }
    } catch (error) {
      alert('Failed to update redirect URL')
    }
  }

  const filteredEmails = emails.filter(email => 
    email.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Admin Login</h1>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Panel</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Email Management</h2>
            
            <form onSubmit={handleAddEmail} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Add new email"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Add
                </button>
              </div>
            </form>

            <div className="mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search emails..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="max-h-64 overflow-y-auto">
              {filteredEmails.map((email) => (
                <div key={email.email} className="flex items-center justify-between p-2 border-b">
                  <span className="text-sm">{email.email}</span>
                  <button
                    onClick={() => handleDeleteEmail(email.email)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Total emails: {emails.length}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Import/Export</h2>
            
            <form onSubmit={handleImport} className="mb-4">
              <div className="mb-2">
                <input
                  type="file"
                  accept=".txt,.csv,.json"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                disabled={!selectedFile}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Import
              </button>
            </form>

            <div className="space-y-2">
              <button
                onClick={() => handleExport('json')}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Export as JSON
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Export as CSV
              </button>
              <button
                onClick={() => handleExport('txt')}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Export as TXT
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Redirect URLs Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'live.com', 'default'].map((domain) => (
                <div key={domain} className="border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {domain === 'default' ? 'Default URL' : domain}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      defaultValue={redirectUrls[domain] || ''}
                      placeholder={`https://example.com${domain !== 'default' ? '#' + domain.split('.')[0] : ''}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onBlur={(e) => {
                        if (e.target.value !== (redirectUrls[domain] || '')) {
                          handleUpdateRedirect(domain, e.target.value)
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}