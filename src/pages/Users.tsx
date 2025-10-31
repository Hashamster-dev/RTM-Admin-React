import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  Filter, 
  Trash2, 
  UserPlus,
  Eye,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { api, User } from '@/lib/api'

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  })

  useEffect(() => {
    fetchUsers()
  }, [page])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await api.getUsers({ 
        page, 
        limit: 10, 
        sort: 'createdAt', 
        order: 'desc' 
      })
      setUsers(response.data || [])
      if (response.pagination) {
        setPagination(response.pagination)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
      console.error('Error fetching users:', err)
    } finally {
      setIsLoading(false)
    }
  }
    
  

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectUser = (userId: string) => {
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
      setSelectedUsers(filteredUsers.map(user => user._id))
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      await api.deleteUser(userId)
      // Refresh users list
      fetchUsers()
      // Remove from selection
      setSelectedUsers(prev => prev.filter(id => id !== userId))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete user')
    }
  }

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString()
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-gold-500/20 text-gold-400 border-gold-500/30'
      case 'user':
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
      </div>

      {/* Error Message */}
      {error && (
        <Card className="bg-red-500/20 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-dark-800/50 border-dark-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{pagination.total || users.length}</p>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                <Search className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-800/50 border-dark-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm">Active Users</p>
                <p className="text-2xl font-bold text-white">{users.length}</p>
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
                <p className="text-2xl font-bold text-white">{users.filter(u => u.role === 'admin').length}</p>
              </div>
              <div className="p-2 bg-gold-500/20 rounded-lg text-gold-400">
                <UserPlus className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-800/50 border-dark-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm">Verified</p>
                <p className="text-2xl font-bold text-white">{users.filter(u => u.emailVerified).length}</p>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Eye className="w-5 h-5 text-green-400" />
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
                  <th className="text-left p-4 text-dark-300 font-medium">Phone</th>
                  <th className="text-left p-4 text-dark-300 font-medium">Join Date</th>
                  <th className="text-left p-4 text-dark-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 text-gold-500 animate-spin" />
                        <p className="text-dark-400">Loading users...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-dark-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="border-b border-dark-700 hover:bg-dark-700/50">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleSelectUser(user._id)}
                          className="rounded border-dark-600 bg-dark-700 text-gold-500 focus:ring-gold-500"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center text-dark-900 font-semibold">
                            {user.name.charAt(0).toUpperCase()}
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          user.emailVerified 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }`}>
                          {user.emailVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="p-4 text-dark-300">{user.phone || 'N/A'}</td>
                      <td className="p-4 text-dark-300">{formatDate(user.createdAt)}</td>
                      <td className="p-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-dark-400 hover:text-red-400"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-dark-700">
              <div className="text-dark-400 text-sm">
                Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="border-dark-600 text-dark-300"
                >
                  Previous
                </Button>
                <span className="text-dark-300 text-sm">
                  Page {page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.min(pagination.pages, prev + 1))}
                  disabled={page === pagination.pages}
                  className="border-dark-600 text-dark-300"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </Layout>
  )
}
