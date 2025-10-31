import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  Activity, 
  DollarSign, 
  TrendingUp, 
  BarChart3,
  UserCheck,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { api } from '@/lib/api'
import { User } from '@/lib/api'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    admins: 0,
  })
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        // Fetch all users to calculate stats
        const usersResponse = await api.getUsers({ limit: 1000, sort: 'createdAt', order: 'desc' })
        const users = usersResponse.data || []

        // Calculate stats
        const now = new Date()
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        
        const totalUsers = usersResponse.pagination?.total || users.length
        const newUsersThisMonth = users.filter(
          (user) => new Date(user.createdAt) >= thisMonth
        ).length
        const admins = users.filter((user) => user.role === 'admin').length

        setStats({
          totalUsers,
          activeUsers: users.length, // You can enhance this with lastLogin tracking
          newUsersThisMonth,
          admins,
        })

        // Get recent users for activities
        setRecentUsers(users.slice(0, 5))
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: stats.newUsersThisMonth > 0 ? `+${stats.newUsersThisMonth}` : '0',
      changeType: 'positive' as const,
      icon: Users,
      color: 'text-blue-500'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      change: 'Recently active',
      changeType: 'positive' as const,
      icon: Activity,
      color: 'text-green-500'
    },
    {
      title: 'Admins',
      value: stats.admins.toString(),
      change: 'Admin accounts',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'text-gold-500'
    },
    {
      title: 'New This Month',
      value: stats.newUsersThisMonth.toString(),
      change: `${stats.totalUsers > 0 ? Math.round((stats.newUsersThisMonth / stats.totalUsers) * 100) : 0}% of total`,
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'text-purple-500'
    }
  ]

  const formatTimeAgo = (date: string): string => {
    const now = new Date()
    const userDate = new Date(date)
    const diffMs = now.getTime() - userDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return new Date(date).toLocaleDateString()
  }

  const recentActivities = recentUsers.map((user, index) => ({
    id: user._id,
    action: 'New user registered',
    user: user.email,
    time: formatTimeAgo(user.createdAt),
    type: 'success' as const
  }))

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
            <p className="text-dark-300">Loading dashboard data...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back, Admin!</h2>
          <p className="text-dark-300">Here's what's happening with your platform today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <Card key={index} className="bg-dark-800/50 border-dark-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-dark-400 text-sm font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    <p className={`text-sm mt-1 ${stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-dark-700 ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts and Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Placeholder */}
          <Card className="bg-dark-800/50 border-dark-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-gold-500" />
                Analytics Overview
              </CardTitle>
              <CardDescription className="text-dark-300">
                User engagement and platform metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-dark-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-dark-500 mx-auto mb-2" />
                  <p className="text-dark-400">Chart visualization will be implemented here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="bg-dark-800/50 border-dark-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-gold-500" />
                Recent Activities
              </CardTitle>
              <CardDescription className="text-dark-300">
                Latest user actions and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-dark-700 rounded-lg">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-500/20 text-green-400' :
                      activity.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                      activity.type === 'error' ? 'bg-red-500/20 text-red-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {activity.type === 'success' ? <UserCheck className="w-4 h-4" /> :
                       activity.type === 'warning' ? <AlertCircle className="w-4 h-4" /> :
                       activity.type === 'error' ? <AlertCircle className="w-4 h-4" /> :
                       <Activity className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{activity.action}</p>
                      <p className="text-dark-400 text-sm">{activity.user}</p>
                      <p className="text-dark-500 text-xs">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
