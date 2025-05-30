import { cookies } from 'next/headers'

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