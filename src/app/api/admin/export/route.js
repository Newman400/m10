import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import Email from '@/lib/models/Email'

async function checkAuth() {
  const cookieStore = cookies()
  const session = cookieStore.get('admin_session')
  return session && session.value === 'authenticated'
}

export async function GET(request) {
  try {
    if (!await checkAuth()) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'

    await dbConnect()
    const emails = await Email.find({}).sort({ createdAt: -1 })
    const emailList = emails.map(email => email.email)

    let content
    let contentType
    let filename

    switch (format.toLowerCase()) {
      case 'json':
        content = JSON.stringify(emailList, null, 2)
        contentType = 'application/json'
        filename = 'emails.json'
        break
      case 'csv':
        content = 'Email\n' + emailList.join('\n')
        contentType = 'text/csv'
        filename = 'emails.csv'
        break
      case 'txt':
        content = emailList.join('\n')
        contentType = 'text/plain'
        filename = 'emails.txt'
        break
      default:
        return Response.json({ error: 'Invalid format' }, { status: 400 })
    }

    return new Response(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
    
  } catch (error) {
    console.error('Export error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}