import { useState } from 'react'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  UserPlus,
  Download,
  Upload
} from 'lucide-react'

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])

  // Mock user data
  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Admin',
      status: 'Active',
      lastLogin: '2 hours ago',
      avatar: 'JD',
      joinDate: '2024-01-15'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'User',
      status: 'Active',
      lastLogin: '1 day ago',
      avatar: 'JS',
      joinDate: '2024-02-20'
    },
    {
      id: 3,
      name: 'Mike Wilson',
      email: 'mike.wilson@example.com',
      role: 'Moderator',
      status: 'Inactive',
      lastLogin: '1 week ago',
      avatar: 'MW',
      joinDate: '2024-01-10'
    },
    {
      id: 4,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      role: 'User',
      status: 'Active',
      lastLogin: '3 hours ago',
      avatar: 'SJ',
      joinDate: '2024-03-05'
    },
    {
      id: 5,
      name: 'David Brown',
      email: 'david.brown@example.com',
      role: 'User',
      status: 'Suspended',
      lastLogin: '2 weeks ago',
      avatar: 'DB',
      joinDate: '2024-02-15'
    }
  ]

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'Inactive':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'Suspended':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-dark-500/20 text-dark-400 border-dark-500/30'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-gold-500/20 text-gold-400 border-gold-500/30'
      case 'Moderator':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'User':
        return 'bg-dark-500/20 text-dark-400 border-dark-500/30'
      default:
        return 'bg-dark-500/20 text-dark-400 border-dark-500/30'
    }
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Users</h1>
          <p className="text-dark-300 mt-1">Manage user accounts and permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-dark-600 text-dark-300 hover:text-white">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="border-dark-600 text-dark-300 hover:text-white">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button className="bg-gold-500 hover:bg-gold-600 text-dark-900">
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-dark-800/50 border-dark-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{users.length}</p>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-800/50 border-dark-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm">Active Users</p>
                <p className="text-2xl font-bold text-white">{users.filter(u => u.status === 'Active').length}</p>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Eye className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-800/50 border-dark-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm">Admins</p>
                <p className="text-2xl font-bold text-white">{users.filter(u => u.role === 'Admin').length}</p>
              </div>
              <div className="p-2 bg-gold-500/20 rounded-lg">
                <Users className="w-5 h-5 text-gold-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-800/50 border-dark-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm">Suspended</p>
                <p className="text-2xl font-bold text-white">{users.filter(u => u.status === 'Suspended').length}</p>
              </div>
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-dark-800/50 border-dark-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-dark-700 border-dark-600 text-white placeholder:text-dark-400"
                />
              </div>
            </div>
            <Button variant="outline" className="border-dark-600 text-dark-300 hover:text-white">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-dark-800/50 border-dark-700">
        <CardHeader>
          <CardTitle className="text-white">User List</CardTitle>
          <CardDescription className="text-dark-300">
            {filteredUsers.length} users found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left p-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-dark-600 bg-dark-700 text-gold-500 focus:ring-gold-500"
                    />
                  </th>
                  <th className="text-left p-4 text-dark-300 font-medium">User</th>
                  <th className="text-left p-4 text-dark-300 font-medium">Role</th>
                  <th className="text-left p-4 text-dark-300 font-medium">Status</th>
                  <th className="text-left p-4 text-dark-300 font-medium">Last Login</th>
                  <th className="text-left p-4 text-dark-300 font-medium">Join Date</th>
                  <th className="text-left p-4 text-dark-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-dark-700 hover:bg-dark-700/50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded border-dark-600 bg-dark-700 text-gold-500 focus:ring-gold-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center text-dark-900 font-semibold">
                          {user.avatar}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-dark-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-dark-300">{user.lastLogin}</td>
                    <td className="p-4 text-dark-300">{user.joinDate}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="text-dark-400 hover:text-white">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-dark-400 hover:text-white">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-dark-400 hover:text-white">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </div>
    </Layout>
  )
}
