import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/context/AuthContext'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = () => {
    setIsLoading(true)
    logout()
    setTimeout(() => {
      setIsLoading(false)
      navigate('/signin')
    }, 300)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 flex ">
      <Sidebar onLogout={handleLogout} isLoading={isLoading} />
      
      {/* Main content */}
        <main className="min-h-screen flex-1">
          {children}
        </main>
    </div>
  )
}
