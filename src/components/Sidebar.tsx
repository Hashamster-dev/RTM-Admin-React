import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  onLogout: () => void
  isLoading: boolean
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Users',
    href: '/users',
    icon: Users,
  },
]

export default function Sidebar({ onLogout, isLoading }: SidebarProps) {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 text-white hover:bg-dark-700"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-dark-800/90 backdrop-blur-sm border-r border-dark-700 transform transition-transform duration-300 ease-in-out",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0 lg:static lg:inset-0",
        isCollapsed && "lg:w-16"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-dark-700">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5 text-dark-900" />
                </div>
                <span className="text-white font-bold text-lg">RTM Admin</span>
              </div>
            )}
            {isCollapsed && (
              <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center mx-auto">
                <LayoutDashboard className="w-5 h-5 text-dark-900" />
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex text-dark-400 hover:text-white hover:bg-dark-700"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                      : "text-dark-300 hover:text-white hover:bg-dark-700",
                    isCollapsed && "justify-center"
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <item.icon className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-dark-700 space-y-2">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-dark-300 hover:text-white hover:bg-dark-700",
                isCollapsed && "justify-center px-2"
              )}
            >
              <Settings className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
              {!isCollapsed && <span>Settings</span>}
            </Button>
            
            <Button
              variant="ghost"
              onClick={onLogout}
              disabled={isLoading}
              className={cn(
                "w-full justify-start text-dark-300 hover:text-white hover:bg-dark-700",
                isCollapsed && "justify-center px-2"
              )}
            >
              <LogOut className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
              {!isCollapsed && <span>{isLoading ? 'Logging out...' : 'Logout'}</span>}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
