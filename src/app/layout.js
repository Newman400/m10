import './globals.css'

export const metadata = {
  title: 'Email Verifier',
  description: 'Secure email verification system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}