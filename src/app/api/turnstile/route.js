export async function POST(request) {
  try {
    const { token } = await request.json()
    
    if (!token) {
      return Response.json({ error: 'Token required' }, { status: 400 })
    }

    const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token
      })
    })

    const verifyData = await verifyResponse.json()

    if (verifyData.success) {
      return Response.json({ success: true })
    } else {
      return Response.json({ error: 'Verification failed' }, { status: 400 })
    }
  } catch (error) {
    console.error('Turnstile verification error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}