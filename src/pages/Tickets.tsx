import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  Plus,
  Edit,
  Upload,
  Loader2,
  AlertCircle,
  Ticket,
  X
} from 'lucide-react'
import { api, Ticket as TicketType } from '@/lib/api'

export default function Tickets() {
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    drawDate: '',
    sortOrder: '0',
    image: null as File | null,
    imagePreview: null as string | null,
    isActive: true,
  })

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      setIsLoading(true)
      setError('')
      const data = await api.getTickets(false) // Get all, including inactive
      setTickets(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets')
      console.error('Error fetching tickets:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTickets = tickets.filter(ticket =>
    ticket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ticket.description && ticket.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleOpenModal = (ticket?: TicketType) => {
    if (ticket) {
      setIsEditing(true)
      setEditingId(ticket._id)
      const drawDate = new Date(ticket.drawDate).toISOString().split('T')[0]
      setFormData({
        name: ticket.name,
        description: ticket.description || '',
        price: ticket.price.toString(),
        drawDate: drawDate,
        sortOrder: (ticket as any).sortOrder?.toString() || '0',
        image: null,
        imagePreview: ticket.imageUrl,
        isActive: ticket.isActive,
      })
    } else {
      setIsEditing(false)
      setEditingId(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        drawDate: '',
        sortOrder: '0',
        image: null,
        imagePreview: null,
        isActive: true,
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setIsEditing(false)
    setEditingId(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      drawDate: '',
      sortOrder: '0',
      image: null,
      imagePreview: null,
      isActive: true,
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file),
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.price.trim() || !formData.drawDate.trim()) {
      alert('Please fill in all required fields')
      return
    }

    const priceNum = parseFloat(formData.price)
    if (isNaN(priceNum) || priceNum < 0) {
      alert('Please enter a valid price')
      return
    }

    if (!isEditing && !formData.image) {
      alert('Please upload a ticket image')
      return
    }

    try {
      setIsSubmitting(true)
      
      if (isEditing && editingId) {
        await api.updateTicket(editingId, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          price: priceNum,
          drawDate: formData.drawDate,
          isActive: formData.isActive,
          sortOrder: parseInt(formData.sortOrder, 10) || 0,
          ...(formData.image && { image: formData.image }),
        })
      } else {
        if (!formData.image) {
          alert('Image is required for new tickets')
          return
        }
        await api.createTicket({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          price: priceNum,
          drawDate: formData.drawDate,
          sortOrder: parseInt(formData.sortOrder, 10) || 0,
          image: formData.image,
        })
      }
      
      handleCloseModal()
      fetchTickets()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
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

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Tickets</h1>
            <p className="text-dark-400 mt-1">Manage lottery tickets and draws</p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-gold-500 hover:bg-gold-600 text-dark-900"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Ticket
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="bg-dark-800/50 border-dark-700">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-dark-900 border-dark-700 text-white placeholder-dark-500"
                />
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
          /* Tickets List */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTickets.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Ticket className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                <p className="text-dark-400 text-lg">No tickets found</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <Card
                  key={ticket._id}
                  className={`bg-dark-800/50 border-dark-700 ${!ticket.isActive ? 'opacity-60' : ''}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-dark-700 flex items-center justify-center overflow-hidden">
                          {ticket.imageUrl ? (
                            <img
                              src={ticket.imageUrl}
                              alt={ticket.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Ticket className="w-6 h-6 text-dark-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-white text-lg truncate">
                            {ticket.name}
                          </CardTitle>
                          <CardDescription className="text-dark-400 text-xs mt-1">
                            {ticket.isActive ? (
                              <span className="text-green-400">Active</span>
                            ) : (
                              <span className="text-red-400">Inactive</span>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenModal(ticket)}
                          className="text-dark-400 hover:text-gold-400 hover:bg-dark-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-xs text-dark-500 mb-1">Price</p>
                      <p className="text-white font-semibold text-lg">
                        {ticket.price.toLocaleString()} PKR
                      </p>
                    </div>
                    {ticket.description && (
                      <div>
                        <p className="text-xs text-dark-500 mb-1">Description</p>
                        <p className="text-white text-sm line-clamp-2">
                          {ticket.description}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-dark-500 mb-1">Draw Date</p>
                      <p className="text-white text-sm">
                        {formatDateTime(ticket.drawDate)}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-dark-700">
                      <p className="text-xs text-dark-500">
                        Created: {formatDate(ticket.createdAt)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card className="bg-dark-800 border-dark-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">
                    {isEditing ? 'Edit Ticket' : 'Add Ticket'}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCloseModal}
                    className="text-dark-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Ticket Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Lucky Draw #1"
                      required
                      className="bg-dark-900 border-dark-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter ticket description..."
                      rows={3}
                      className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-md text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Price (PKR) *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="Enter ticket price"
                      required
                      className="bg-dark-900 border-dark-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Draw Date *
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.drawDate}
                      onChange={(e) => setFormData({ ...formData, drawDate: e.target.value })}
                      required
                      className="bg-dark-900 border-dark-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Sort Order
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                      placeholder="0"
                      className="bg-dark-900 border-dark-700 text-white"
                    />
                    <p className="text-xs text-dark-500 mt-1">
                      Lower numbers appear first in mobile app. Default is 0.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Ticket Image {!isEditing && '*'}
                    </label>
                    <div className="space-y-2">
                      {formData.imagePreview && (
                        <div className="relative w-full h-48 rounded-lg bg-dark-700 overflow-hidden">
                          <img
                            src={formData.imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white cursor-pointer hover:bg-dark-700 transition-colors">
                          <Upload className="w-4 h-4" />
                          <span className="text-sm">Choose File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                        {formData.image && (
                          <span className="text-sm text-dark-400">{formData.image.name}</span>
                        )}
                      </div>
                      <p className="text-xs text-dark-500">
                        Maximum file size: 5MB. Formats: JPG, PNG, GIF
                      </p>
                    </div>
                  </div>

                  {isEditing && (
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="w-4 h-4 rounded border-dark-700 bg-dark-900 text-gold-500"
                        />
                        <span className="text-sm text-dark-300">Active</span>
                      </label>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseModal}
                      className="flex-1 border-dark-700 text-dark-300 hover:bg-dark-700"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gold-500 hover:bg-gold-600 text-dark-900"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  )
}

