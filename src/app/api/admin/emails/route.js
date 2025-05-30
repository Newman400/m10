import { cookies } from 'next/headers'
import dbConnect from '../../../../lib/mongodb'
import Email from '../../../../lib/models/Email'

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
    const emails = await Email.find({}).sort({ createdAt: -1 })
    
    return Response.json({ emails })
    
  } catch (error) {
    console.error('Get emails error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    if (!await checkAuth()) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email } = await request.json()
    
    if (!email) {
      return Response.json({ message: 'Email required' }, { status: 400 })
    }

    await dbConnect()
    
    const domain = email.split('@')[1].toLowerCase()
    
    const existingEmail = await Email.findOne({ email: email.toLowerCase() })
    if (existingEmail) {
      return Response.json({ message: 'Email already exists' }, { status: 400 })
    }

    const newEmail = new Email({
      email: email.toLowerCase(),
      domain
    })

    await newEmail.save()
    
    return Response.json({ success: true, message: 'Email added successfully' })
    
  } catch (error) {
    console.error('Add email error:', error)
    return Response.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    if (!await checkAuth()) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email } = await request.json()
    
    if (!email) {
      return Response.json({ message: 'Email required' }, { status: 400 })
    }

    await dbConnect()
    
    const result = await Email.deleteOne({ email: email.toLowerCase() })
    
    if (result.deletedCount === 0) {
      return Response.json({ message: 'Email not found' }, { status: 404 })
    }
    
    return Response.json({ success: true, message: 'Email deleted successfully' })
    
  } catch (error) {
    console.error('Delete email error:', error)
    return Response.json({ message: 'Internal server error' }, { status: 500 })
  }
}