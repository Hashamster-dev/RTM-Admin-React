import { useState } from 'react'
import Layout from '@/components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  Activity, 
  DollarSign, 
  TrendingUp, 
  BarChart3,
  UserCheck,
  AlertCircle
} from 'lucide-react'

export default function Dashboard() {
  const stats = [
    {
      title: 'Total Users',
      value: '2,543',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      title: 'Active Sessions',
      value: '1,234',
      change: '+8%',
      changeType: 'positive',
      icon: Activity,
      color: 'text-green-500'
    },
    {
      title: 'Revenue',
      value: '$45,678',
      change: '+23%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-gold-500'
    },
    {
      title: 'Growth Rate',
      value: '18.5%',
      change: '+5%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'text-purple-500'
    }
  ]

  const recentActivities = [
    { id: 1, action: 'New user registered', user: 'john.doe@example.com', time: '2 minutes ago', type: 'success' },
    { id: 2, action: 'Payment processed', user: 'jane.smith@example.com', time: '5 minutes ago', type: 'success' },
    { id: 3, action: 'Failed login attempt', user: 'unknown@example.com', time: '8 minutes ago', type: 'warning' },
    { id: 4, action: 'Profile updated', user: 'mike.wilson@example.com', time: '12 minutes ago', type: 'info' },
    { id: 5, action: 'Account suspended', user: 'spam@example.com', time: '15 minutes ago', type: 'error' }
  ]

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
          {stats.map((stat, index) => (
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
