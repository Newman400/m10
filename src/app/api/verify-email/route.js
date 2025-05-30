import dbConnect from '@/lib/mongodb'
import Email from '@/lib/models/Email'
import Config from '@/lib/models/Config'

export async function POST(request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return Response.json({ message: 'Email required' }, { status: 400 })
    }

    await dbConnect()
    
    const emailRecord = await Email.findOne({ email: email.toLowerCase() })
    
    if (!emailRecord) {
      return Response.json({ message: 'Email not authorized' }, { status: 404 })
    }

    let redirectUrl = emailRecord.redirectUrl
    
    if (!redirectUrl) {
      const domain = email.split('@')[1].toLowerCase()
      
      const domainConfig = await Config.findOne({ key: domain })
      if (domainConfig) {
        redirectUrl = domainConfig.value
      } else {
        const defaultConfig = await Config.findOne({ key: 'default' })
        redirectUrl = defaultConfig ? defaultConfig.value : 'https://google.com'
      }
    }

    return Response.json({ 
      success: true, 
      redirectUrl,
      message: 'Email verified successfully'
    })
    
  } catch (error) {
    console.error('Email verification error:', error)
    return Response.json({ message: 'Internal server error' }, { status: 500 })
  }
}