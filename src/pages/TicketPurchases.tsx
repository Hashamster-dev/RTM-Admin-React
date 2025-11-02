import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  Check,
  X,
  Eye,
  Loader2,
  AlertCircle,
  Receipt,
  User,
  Ticket as TicketIcon,
  CreditCard,
  Calendar,
  DollarSign,
  Clock,
  Table,
  LayoutGrid,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { api, TicketPurchase } from '@/lib/api'
import { showToast } from '@/lib/toast'

export default function TicketPurchases() {
  const [purchases, setPurchases] = useState<TicketPurchase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [selectedPurchase, setSelectedPurchase] = useState<TicketPurchase | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchPurchases()
  }, [statusFilter])

  const fetchPurchases = async () => {
    try {
      setIsLoading(true)
      setError('')
      const status = statusFilter === 'all' ? undefined : statusFilter
      const data = await api.getTicketPurchases(status)
      setPurchases(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch purchases')
      console.error('Error fetching purchases:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPurchases = purchases.filter(purchase => {
    const user = typeof purchase.user === 'object' ? purchase.user : null
    const ticket = typeof purchase.ticket === 'object' ? purchase.ticket : null
    const paymentMethod = typeof purchase.paymentMethod === 'object' ? purchase.paymentMethod : null
    
    const searchLower = searchTerm.toLowerCase()
    return (
      purchase.transactionId.toLowerCase().includes(searchLower) ||
      (user && user.name.toLowerCase().includes(searchLower)) ||
      (user && user.email.toLowerCase().includes(searchLower)) ||
      (ticket && ticket.name.toLowerCase().includes(searchLower)) ||
      (paymentMethod && paymentMethod.name.toLowerCase().includes(searchLower))
    )
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedPurchases = filteredPurchases.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, searchTerm])

  const handleViewDetails = async (purchaseId: string) => {
    try {
      const purchase = await api.getTicketPurchaseById(purchaseId)
      setSelectedPurchase(purchase)
      setIsDetailModalOpen(true)
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Failed to load purchase details')
    }
  }

  const handleApprove = async (id: string) => {
    if (!confirm('Are you sure you want to approve this purchase?')) return

    try {
      setIsProcessing(true)
      await api.updatePurchaseStatus(id, 'approved', reviewNotes || undefined)
      setReviewNotes('')
      setIsDetailModalOpen(false)
      fetchPurchases()
      showToast.success('Purchase approved successfully')
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Failed to approve purchase')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async (id: string) => {
    if (!reviewNotes.trim()) {
      showToast.warning('Please provide a reason for rejection')
      return
    }

    if (!confirm('Are you sure you want to reject this purchase?')) return

    try {
      setIsProcessing(true)
      await api.updatePurchaseStatus(id, 'rejected', reviewNotes)
      setReviewNotes('')
      setIsDetailModalOpen(false)
      fetchPurchases()
      showToast.success('Purchase rejected successfully')
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Failed to reject purchase')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-400 bg-green-900/20 border-green-700'
      case 'rejected':
        return 'text-red-400 bg-red-900/20 border-red-700'
      case 'pending':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-700'
      default:
        return 'text-dark-400 bg-dark-700 border-dark-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="w-4 h-4" />
      case 'rejected':
        return <X className="w-4 h-4" />
      case 'pending':
        return <Loader2 className="w-4 h-4 animate-spin" />
      default:
        return null
    }
  }

  const getStatusCount = (status: string) => {
    return purchases.filter(p => p.status === status).length
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Ticket Purchases</h1>
          <p className="text-dark-400 mt-1">Review and manage ticket purchase requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-dark-800/50 border-dark-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-dark-500 mb-1">Total</p>
                  <p className="text-2xl font-bold text-white">{purchases.length}</p>
                </div>
                <Receipt className="w-8 h-8 text-dark-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-900/20 border-yellow-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-yellow-400 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-yellow-400">{getStatusCount('pending')}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-900/20 border-green-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-400 mb-1">Approved</p>
                  <p className="text-2xl font-bold text-green-400">{getStatusCount('approved')}</p>
                </div>
                <Check className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-red-900/20 border-red-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-400 mb-1">Rejected</p>
                  <p className="text-2xl font-bold text-red-400">{getStatusCount('rejected')}</p>
                </div>
                <X className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-dark-800/50 border-dark-700">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by transaction ID, user, ticket, or payment method..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-dark-900 border-dark-700 text-white placeholder-dark-500"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  className={statusFilter === 'all' ? 'bg-gold-500 hover:bg-gold-600' : 'border-dark-700 text-dark-300'}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('pending')}
                  className={statusFilter === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600' : 'border-dark-700 text-dark-300'}
                >
                  Pending
                </Button>
                <Button
                  variant={statusFilter === 'approved' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('approved')}
                  className={statusFilter === 'approved' ? 'bg-green-500 hover:bg-green-600' : 'border-dark-700 text-dark-300'}
                >
                  Approved
                </Button>
                <Button
                  variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('rejected')}
                  className={statusFilter === 'rejected' ? 'bg-red-500 hover:bg-red-600' : 'border-dark-700 text-dark-300'}
                >
                  Rejected
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
                  className="border-dark-700 text-dark-300 hover:bg-dark-700 hover:text-white"
                  title={viewMode === 'cards' ? 'Switch to Table View' : 'Switch to Card View'}
                >
                  {viewMode === 'cards' ? <Table className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="bg-red-900/20 border-red-700">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300">{error}</span>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
          </div>
        ) : (
          <>
            {filteredPurchases.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                <p className="text-dark-400 text-lg">No purchases found</p>
              </div>
            ) : viewMode === 'table' ? (
              /* Table View */
              <Card className="bg-dark-800/50 border-dark-700">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-dark-700">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Purchase ID</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Transaction ID</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Ticket</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Quantity</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">User</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Payment Method</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedPurchases.map((purchase) => {
                          const user = typeof purchase.user === 'object' ? purchase.user : null
                          const ticket = typeof purchase.ticket === 'object' ? purchase.ticket : null
                          const paymentMethod = typeof purchase.paymentMethod === 'object' ? purchase.paymentMethod : null

                          return (
                            <tr key={purchase._id} className="border-b border-dark-700 hover:bg-dark-900/50">
                              <td className="px-4 py-3">
                                <span className="text-white text-sm font-semibold font-mono">{purchase.purchaseId ?? 'N/A'}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 w-fit ${getStatusColor(purchase.status)}`}>
                                  {getStatusIcon(purchase.status)}
                                  {purchase.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-white text-sm font-mono">#{purchase.transactionId}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-white text-sm">{ticket ? ticket.name : 'Unknown'}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-white text-sm font-semibold">{purchase.quantity ?? 1}</span>
                              </td>
                              <td className="px-4 py-3">
                                {user ? (
                                  <div>
                                    <p className="text-white text-sm">{user.name}</p>
                                    <p className="text-dark-400 text-xs">{user.email}</p>
                                  </div>
                                ) : (
                                  <span className="text-dark-400 text-sm">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-white font-semibold">{purchase.amountPaid.toLocaleString()} PKR</span>
                                {ticket && (
                                  <p className="text-dark-400 text-xs">({ticket.price.toLocaleString()} × {purchase.quantity ?? 1})</p>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {paymentMethod ? (
                                  <div className="flex items-center gap-2">
                                    {paymentMethod.logoUrl && (
                                      <img 
                                        src={paymentMethod.logoUrl} 
                                        alt={paymentMethod.name}
                                        className="w-5 h-5 object-contain"
                                      />
                                    )}
                                    <span className="text-white text-sm">{paymentMethod.name}</span>
                                  </div>
                                ) : (
                                  <span className="text-dark-400 text-sm">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-dark-400 text-sm">{formatDate(purchase.createdAt)}</span>
                              </td>
                              <td className="px-4 py-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewDetails(purchase._id)}
                                  className="border-dark-700 text-dark-300 hover:bg-dark-700 hover:text-white"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Card View */
              <div className="space-y-4">
                {paginatedPurchases.map((purchase) => {
                const user = typeof purchase.user === 'object' ? purchase.user : null
                const ticket = typeof purchase.ticket === 'object' ? purchase.ticket : null
                const paymentMethod = typeof purchase.paymentMethod === 'object' ? purchase.paymentMethod : null

                return (
                  <Card
                    key={purchase._id}
                    className={`bg-dark-800/50 border-dark-700 ${purchase.status === 'pending' ? 'border-yellow-500/50' : ''}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-semibold font-mono text-gold-400">
                              {purchase.purchaseId ?? 'N/A'}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusColor(purchase.status)}`}>
                              {getStatusIcon(purchase.status)}
                              {purchase.status.toUpperCase()}
                            </span>
                          </div>
                          <CardTitle className="text-white">
                            {ticket ? ticket.name : 'Unknown Ticket'}
                          </CardTitle>
                          {user && (
                            <CardDescription className="text-dark-400 mt-1">
                              <User className="w-4 h-4 inline mr-1" />
                              {user.name} ({user.email})
                            </CardDescription>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(purchase._id)}
                          className="border-dark-700 text-dark-300 hover:bg-dark-700 hover:text-white"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-dark-500 mb-1 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            Amount Paid
                          </p>
                          <p className="text-white font-semibold">
                            {purchase.amountPaid.toLocaleString()} PKR
                          </p>
                          {ticket && (
                            <p className="text-xs text-dark-400 mt-1">
                              {ticket.price.toLocaleString()} × {purchase.quantity ?? 1}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-dark-500 mb-1 flex items-center gap-1">
                            <TicketIcon className="w-3 h-3" />
                            Quantity
                          </p>
                          <p className="text-white font-semibold">
                            {purchase.quantity ?? 1} {(purchase.quantity ?? 1) === 1 ? 'ticket' : 'tickets'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-dark-500 mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Purchase Date
                        </p>
                        <p className="text-white text-sm">
                          {formatDate(purchase.createdAt)}
                        </p>
                      </div>
                      {paymentMethod && (
                        <div>
                          <p className="text-xs text-dark-500 mb-1 flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            Payment Method
                          </p>
                          <div className="flex items-center gap-2">
                            {paymentMethod.logoUrl && (
                              <img 
                                src={paymentMethod.logoUrl} 
                                alt={paymentMethod.name}
                                className="w-6 h-6 object-contain"
                              />
                            )}
                            <p className="text-white text-sm">{paymentMethod.name}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
                })}
              </div>
            )}
            
            {/* Pagination Controls */}
            {filteredPurchases.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-dark-400">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredPurchases.length)} of {filteredPurchases.length} purchases
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="border-dark-700 text-dark-300 hover:bg-dark-700 hover:text-white disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={
                          currentPage === page
                            ? 'bg-gold-500 hover:bg-gold-600 text-dark-900'
                            : 'border-dark-700 text-dark-300 hover:bg-dark-700 hover:text-white'
                        }
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="border-dark-700 text-dark-300 hover:bg-dark-700 hover:text-white disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Detail Modal */}
        {isDetailModalOpen && selectedPurchase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card className="bg-dark-800 border-dark-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Purchase Details</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsDetailModalOpen(false)
                      setSelectedPurchase(null)
                      setReviewNotes('')
                    }}
                    className="text-dark-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status */}
                <div>
                  <p className="text-sm text-dark-500 mb-2">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border inline-flex items-center gap-1 ${getStatusColor(selectedPurchase.status)}`}>
                    {getStatusIcon(selectedPurchase.status)}
                    {selectedPurchase.status.toUpperCase()}
                  </span>
                </div>

                {/* User Information */}
                {typeof selectedPurchase.user === 'object' && (
                  <div>
                    <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      User Information
                    </p>
                    <div className="bg-dark-900 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-dark-400">Name:</span>
                        <span className="text-sm text-white">{selectedPurchase.user.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-dark-400">Email:</span>
                        <span className="text-sm text-white">{selectedPurchase.user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-dark-400">Phone:</span>
                        <span className="text-sm text-white">{selectedPurchase.user.phone}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ticket Information */}
                {typeof selectedPurchase.ticket === 'object' && (
                  <div>
                    <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <TicketIcon className="w-4 h-4" />
                      Ticket Information
                    </p>
                    <div className="bg-dark-900 rounded-lg p-4 space-y-3">
                      {selectedPurchase.ticket.imageUrl && (
                        <img 
                          src={selectedPurchase.ticket.imageUrl} 
                          alt={selectedPurchase.ticket.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      )}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-dark-400">Ticket Name:</span>
                          <span className="text-sm text-white font-semibold">{selectedPurchase.ticket.name}</span>
                        </div>
                        {selectedPurchase.ticket.description && (
                          <div>
                            <span className="text-sm text-dark-400">Description:</span>
                            <p className="text-sm text-white mt-1">{selectedPurchase.ticket.description}</p>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-sm text-dark-400">Price:</span>
                          <span className="text-sm text-white font-semibold">{selectedPurchase.ticket.price.toLocaleString()} PKR</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-dark-400">Draw Date:</span>
                          <span className="text-sm text-white">{new Date(selectedPurchase.ticket.drawDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Information */}
                {typeof selectedPurchase.paymentMethod === 'object' && (
                  <div>
                    <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Payment Information
                    </p>
                    <div className="bg-dark-900 rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-3 mb-3">
                        {selectedPurchase.paymentMethod.logoUrl && (
                          <img 
                            src={selectedPurchase.paymentMethod.logoUrl} 
                            alt={selectedPurchase.paymentMethod.name}
                            className="w-12 h-12 object-contain"
                          />
                        )}
                        <span className="text-white font-semibold">{selectedPurchase.paymentMethod.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-dark-400">Account Holder:</span>
                        <span className="text-sm text-white">{selectedPurchase.paymentMethod.accountHolderName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-dark-400">IBAN / Account:</span>
                        <span className="text-sm text-white font-mono">{selectedPurchase.paymentMethod.ibanOrAccount}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Transaction Details */}
                <div>
                  <p className="text-sm font-semibold text-white mb-3">Transaction Details</p>
                  <div className="bg-dark-900 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-dark-400">Purchase ID:</span>
                      <span className="text-sm text-white font-semibold font-mono text-gold-400">{selectedPurchase.purchaseId ?? 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-dark-400">Transaction ID:</span>
                      <span className="text-sm text-white font-mono">{selectedPurchase.transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-dark-400">Quantity:</span>
                      <span className="text-sm text-white font-semibold">{selectedPurchase.quantity ?? 1} {(selectedPurchase.quantity ?? 1) === 1 ? 'ticket' : 'tickets'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-dark-400">Amount Paid:</span>
                      <span className="text-sm font-semibold text-gold-400">
                        {selectedPurchase.amountPaid.toLocaleString()} PKR
                        {typeof selectedPurchase.ticket === 'object' && (
                          <span className="text-dark-400 text-xs ml-2">
                            ({selectedPurchase.ticket.price.toLocaleString()} × {selectedPurchase.quantity ?? 1})
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-dark-400">Purchase Date:</span>
                      <span className="text-sm text-white">{formatDate(selectedPurchase.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Receipt Image */}
                {selectedPurchase.receiptImageUrl && (
                  <div>
                    <p className="text-sm font-semibold text-white mb-3">Receipt Image</p>
                    <div className="bg-dark-900 rounded-lg p-4">
                      <img 
                        src={selectedPurchase.receiptImageUrl} 
                        alt="Receipt"
                        className="w-full rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedPurchase.notes && (
                  <div>
                    <p className="text-sm font-semibold text-white mb-3">User Notes</p>
                    <div className="bg-dark-900 rounded-lg p-4">
                      <p className="text-sm text-white">{selectedPurchase.notes}</p>
                    </div>
                  </div>
                )}

                {/* Review Information */}
                {selectedPurchase.status !== 'pending' && (
                  <div>
                    <p className="text-sm font-semibold text-white mb-3">Review Information</p>
                    <div className="bg-dark-900 rounded-lg p-4 space-y-2">
                      {typeof selectedPurchase.reviewedBy === 'object' && (
                        <div className="flex justify-between">
                          <span className="text-sm text-dark-400">Reviewed By:</span>
                          <span className="text-sm text-white">{selectedPurchase.reviewedBy.name} ({selectedPurchase.reviewedBy.email})</span>
                        </div>
                      )}
                      {selectedPurchase.reviewedAt && (
                        <div className="flex justify-between">
                          <span className="text-sm text-dark-400">Reviewed At:</span>
                          <span className="text-sm text-white">{formatDate(selectedPurchase.reviewedAt)}</span>
                        </div>
                      )}
                      {selectedPurchase.reviewNotes && (
                        <div>
                          <span className="text-sm text-dark-400">Review Notes:</span>
                          <p className="text-sm text-white mt-1">{selectedPurchase.reviewNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons for Pending Purchases */}
                {selectedPurchase.status === 'pending' && (
                  <div className="space-y-4 pt-4 border-t border-dark-700">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">
                        Review Notes (Required for rejection)
                      </label>
                      <textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Add notes about your review..."
                        rows={3}
                        className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-md text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleApprove(selectedPurchase._id)}
                        disabled={isProcessing}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleReject(selectedPurchase._id)}
                        disabled={isProcessing || !reviewNotes.trim()}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  )
}

