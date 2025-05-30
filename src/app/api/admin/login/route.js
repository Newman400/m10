import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const { password } = await request.json()
    
    if (!password) {
      return Response.json({ error: 'Password required' }, { status: 400 })
    }

    const adminPassword = process.env.ADMIN_PASSWORD
    
    if (!adminPassword) {
      return Response.json({ error: 'Admin password not configured' }, { status: 500 })
    }

    const isValid = await bcrypt.compare(password, adminPassword) || password === adminPassword
    
    if (!isValid) {
      return Response.json({ error: 'Invalid password' }, { status: 401 })
    }

    const cookieStore = cookies()
    cookieStore.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24
    })

    return Response.json({ success: true })
    
  } catch (error) {
    console.error('Admin login error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const cookieStore = cookies()
    const session = cookieStore.get('admin_session')
    
    if (!session || session.value !== 'authenticated') {
      return Response.json({ authenticated: false }, { status: 401 })
    }

    return Response.json({ authenticated: true })
    
  } catch (error) {
    console.error('Auth check error:', error)
    return Response.json({ authenticated: false }, { status: 500 })
  }
}