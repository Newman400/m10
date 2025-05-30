import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import Email from '@/lib/models/Email'

async function checkAuth() {
  const cookieStore = cookies()
  const session = cookieStore.get('admin_session')
  return session && session.value === 'authenticated'
}

export async function POST(request) {
  try {
    if (!await checkAuth()) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    
    if (!file) {
      return Response.json({ message: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()
    let emails = []

    if (file.name.endsWith('.json')) {
      try {
        const jsonData = JSON.parse(text)
        emails = Array.isArray(jsonData) ? jsonData : jsonData.emails || []
      } catch (error) {
        return Response.json({ message: 'Invalid JSON format' }, { status: 400 })
      }
    } else if (file.name.endsWith('.csv')) {
      const lines = text.split('\n')
      emails = lines
        .map(line => line.split(',')[0].trim())
        .filter(email => email && email.includes('@'))
    } else {
      emails = text
        .split('\n')
        .map(line => line.trim())
        .filter(email => email && email.includes('@'))
    }

    if (emails.length === 0) {
      return Response.json({ message: 'No valid emails found in file' }, { status: 400 })
    }

    await dbConnect()
    
    let importedCount = 0
    for (const email of emails) {
      try {
        const cleanEmail = email.toLowerCase()
        const domain = cleanEmail.split('@')[1]
        
        const existingEmail = await Email.findOne({ email: cleanEmail })
        if (!existingEmail) {
          await new Email({ email: cleanEmail, domain }).save()
          importedCount++
        }
      } catch (error) {
        console.error(`Failed to import email ${email}:`, error)
      }
    }
    
    return Response.json({ 
      success: true, 
      count: importedCount,
      message: `Imported ${importedCount} emails successfully` 
    })
    
  } catch (error) {
    console.error('Import error:', error)
    return Response.json({ message: 'Internal server error' }, { status: 500 })
  }
}