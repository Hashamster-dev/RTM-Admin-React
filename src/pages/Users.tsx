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
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  XCircle,
  Calendar,
  Key,
  Users as UsersIcon,
  ArrowDown,
  ArrowUp,
  UserCog
} from 'lucide-react'
import { api, User } from '@/lib/api'
import { showToast } from '@/lib/toast'

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
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

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

  const handleViewDetails = async (userId: string) => {
    try {
      const user = await api.getUserById(userId)
      setSelectedUser(user)
      setIsDetailModalOpen(true)
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Failed to load user details')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      await api.deleteUser(userId)
      showToast.success('User deleted successfully')
      // Refresh users list
      fetchUsers()
      // Remove from selection
      setSelectedUsers(prev => prev.filter(id => id !== userId))
      // Close modal if deleted user is selected
      if (selectedUser && selectedUser._id === userId) {
        setIsDetailModalOpen(false)
        setSelectedUser(null)
      }
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Failed to delete user')
    }
  }

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString()
  }

  const formatDateTime = (date: string): string => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-dark-600 bg-dark-700 text-gold-500 focus:ring-gold-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Join Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Actions</th>
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
                    <tr key={user._id} className="border-b border-dark-700 hover:bg-dark-900/50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleSelectUser(user._id)}
                          className="rounded border-dark-600 bg-dark-700 text-gold-500 focus:ring-gold-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center text-dark-900 font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{user.name}</p>
                            <p className="text-dark-400 text-xs">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 w-fit ${getRoleColor(user.role)}`}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 w-fit ${
                          user.emailVerified 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }`}>
                          {user.emailVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white text-sm">{user.phone || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-dark-400 text-sm">{formatDate(user.createdAt)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-dark-700 text-dark-300 hover:bg-dark-700 hover:text-white"
                            onClick={() => handleViewDetails(user._id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-dark-700 text-dark-300 hover:bg-dark-700 hover:text-red-400"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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
                  className="border-dark-700 text-dark-300 hover:bg-dark-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <span className="text-dark-300 text-sm px-4">
                  Page {page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.min(pagination.pages, prev + 1))}
                  disabled={page === pagination.pages}
                  className="border-dark-700 text-dark-300 hover:bg-dark-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      {isDetailModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="bg-dark-800 border-dark-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">User Details</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsDetailModalOpen(false)
                    setSelectedUser(null)
                  }}
                  className="text-dark-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Avatar and Name */}
              <div className="flex items-center gap-4 pb-4 border-b border-dark-700">
                <div className="w-20 h-20 bg-gold-500 rounded-full flex items-center justify-center text-dark-900 font-bold text-2xl">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedUser.name}</h3>
                  <p className="text-dark-400 text-sm">{selectedUser.email}</p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 w-fit ${getRoleColor(selectedUser.role)}`}>
                  {selectedUser.role.toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 w-fit ${
                  selectedUser.emailVerified 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                    : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                }`}>
                  {selectedUser.emailVerified ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  Email {selectedUser.emailVerified ? 'Verified' : 'Unverified'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 w-fit ${
                  selectedUser.phoneVerified 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                    : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                }`}>
                  {selectedUser.phoneVerified ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  Phone {selectedUser.phoneVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>

              {/* Contact Information */}
              <div>
                <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contact Information
                </p>
                <div className="bg-dark-900 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-dark-400">Email:</span>
                    <span className="text-sm text-white">{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-dark-400">Phone:</span>
                    <span className="text-sm text-white">{selectedUser.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Account Information
                </p>
                <div className="bg-dark-900 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-dark-400">User ID:</span>
                    <span className="text-sm text-white font-mono text-xs">{selectedUser._id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-dark-400">Role:</span>
                    <span className={`text-sm font-semibold ${selectedUser.role === 'admin' ? 'text-gold-400' : 'text-white'}`}>
                      {selectedUser.role.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Referral Chain */}
              <div>
                <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <UsersIcon className="w-4 h-4" />
                  Referral Chain
                </p>
                <div className="bg-dark-900 rounded-lg p-4 space-y-4">
                  {/* Referred By Section */}
                  <div>
                    <p className="text-xs text-dark-500 mb-2 flex items-center gap-2">
                      <ArrowUp className="w-3 h-3" />
                      Referred By
                    </p>
                    {selectedUser.referredBy ? (
                      <div className="bg-dark-800 rounded-lg p-3 border border-dark-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gold-500/20 rounded-full flex items-center justify-center text-gold-400 font-semibold text-sm border border-gold-500/30">
                            {selectedUser.referredBy.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium">{selectedUser.referredBy.name}</p>
                            <p className="text-dark-400 text-xs">{selectedUser.referredBy.email}</p>
                            {selectedUser.referredBy.referralCode && (
                              <p className="text-gold-400 text-xs font-mono mt-1">Code: {selectedUser.referredBy.referralCode}</p>
                            )}
                          </div>
                          <span className="text-xs text-dark-500">
                            {new Date(selectedUser.referredBy.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-dark-800 rounded-lg p-3 border border-dark-700">
                        <p className="text-dark-400 text-sm">No referrer</p>
                      </div>
                    )}
                  </div>

                  {/* Referral Code */}
                  {selectedUser.referralCode && (
                    <div>
                      <p className="text-xs text-dark-500 mb-2 flex items-center gap-2">
                        <Key className="w-3 h-3" />
                        This User's Referral Code
                      </p>
                      <div className="bg-dark-800 rounded-lg p-3 border border-gold-500/30">
                        <p className="text-gold-400 font-mono font-semibold text-sm">{selectedUser.referralCode}</p>
                      </div>
                    </div>
                  )}

                  {/* Referred Users Section */}
                  <div>
                    <p className="text-xs text-dark-500 mb-2 flex items-center gap-2">
                      <ArrowDown className="w-3 h-3" />
                      ({selectedUser.referredUsers?.length || 0})
                    </p>
                    {selectedUser.referredUsers && selectedUser.referredUsers.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedUser.referredUsers.map((referredUser) => (
                          <div key={referredUser._id} className="bg-dark-800 rounded-lg p-3 border border-dark-700">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-semibold text-sm border border-blue-500/30">
                                {referredUser.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <p className="text-white text-sm font-medium">{referredUser.name}</p>
                                <p className="text-dark-400 text-xs">{referredUser.email}</p>
                                {referredUser.referralCode && (
                                  <p className="text-blue-400 text-xs font-mono mt-1">Code: {referredUser.referralCode}</p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1">
                                  {referredUser.emailVerified ? (
                                    <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                                      Verified
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                      Unverified
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-dark-500">
                                  {new Date(referredUser.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-dark-800 rounded-lg p-3 border border-dark-700">
                        <p className="text-dark-400 text-sm">No referred users yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Dates */}
              <div>
                <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Account Dates
                </p>
                <div className="bg-dark-900 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-dark-400">Join Date:</span>
                    <span className="text-sm text-white">{formatDateTime(selectedUser.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-dark-400">Last Updated:</span>
                    <span className="text-sm text-white">{formatDateTime(selectedUser.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-dark-700">
                <Button
                  variant="outline"
                  onClick={() => handleDeleteUser(selectedUser._id)}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailModalOpen(false)
                    setSelectedUser(null)
                  }}
                  className="border-dark-700 text-dark-300 hover:bg-dark-700 hover:text-white"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </Layout>
  )
}
