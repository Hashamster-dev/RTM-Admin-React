import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  Trash2, 
  Plus,
  Edit,
  Upload,
  Loader2,
  AlertCircle,
  CreditCard,
  X
} from 'lucide-react'
import { api, PaymentMethod } from '@/lib/api'
import { showToast } from '@/lib/toast'

export default function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
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
    ibanOrAccount: '',
    accountHolderName: '',
    logo: null as File | null,
    logoPreview: null as string | null,
    isActive: true,
  })

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true)
      setError('')
      const data = await api.getPaymentMethods(false) // Get all, including inactive
      setPaymentMethods(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment methods')
      console.error('Error fetching payment methods:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMethods = paymentMethods.filter(method =>
    method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    method.ibanOrAccount.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (method?: PaymentMethod) => {
    if (method) {
      setIsEditing(true)
      setEditingId(method._id)
      setFormData({
        name: method.name,
        ibanOrAccount: method.ibanOrAccount,
        accountHolderName: method.accountHolderName || '',
        logo: null,
        logoPreview: method.logoUrl,
        isActive: method.isActive,
      })
    } else {
      setIsEditing(false)
      setEditingId(null)
      setFormData({
        name: '',
        ibanOrAccount: '',
        accountHolderName: '',
        logo: null,
        logoPreview: null,
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
      ibanOrAccount: '',
      accountHolderName: '',
      logo: null,
      logoPreview: null,
      isActive: true,
    })
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast.error('File size must be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        showToast.error('Please select an image file')
        return
      }
      setFormData({
        ...formData,
        logo: file,
        logoPreview: URL.createObjectURL(file),
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.ibanOrAccount.trim() || !formData.accountHolderName.trim()) {
      showToast.warning('Please fill in all required fields')
      return
    }

    if (!isEditing && !formData.logo) {
      showToast.warning('Please upload a logo image')
      return
    }

    try {
      setIsSubmitting(true)
      
      if (isEditing && editingId) {
        await api.updatePaymentMethod(editingId, {
          name: formData.name.trim(),
          ibanOrAccount: formData.ibanOrAccount.trim(),
          accountHolderName: formData.accountHolderName.trim(),
          isActive: formData.isActive,
          ...(formData.logo && { logo: formData.logo }),
        })
        showToast.success('Payment method updated successfully')
      } else {
        if (!formData.logo) {
          showToast.error('Logo is required for new payment methods')
          return
        }
        await api.createPaymentMethod({
          name: formData.name.trim(),
          ibanOrAccount: formData.ibanOrAccount.trim(),
          accountHolderName: formData.accountHolderName.trim(),
          logo: formData.logo,
        })
        showToast.success('Payment method created successfully')
      }
      
      handleCloseModal()
      fetchPaymentMethods()
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Failed to save payment method')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return
    
    try {
      await api.deletePaymentMethod(id)
      showToast.success('Payment method deleted successfully')
      fetchPaymentMethods()
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Failed to delete payment method')
    }
  }

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString()
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Payment Methods</h1>
            <p className="text-dark-400 mt-1">Manage payment methods and account details</p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-gold-500 hover:bg-gold-600 text-dark-900"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Payment Method
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
                  placeholder="Search by name or account..."
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
          /* Payment Methods List */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMethods.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <CreditCard className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                <p className="text-dark-400 text-lg">No payment methods found</p>
              </div>
            ) : (
              filteredMethods.map((method) => (
                <Card
                  key={method._id}
                  className={`bg-dark-800/50 border-dark-700 ${!method.isActive ? 'opacity-60' : ''}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-dark-700 flex items-center justify-center overflow-hidden">
                          {method.logoUrl ? (
                            <img
                              src={method.logoUrl}
                              alt={method.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <CreditCard className="w-6 h-6 text-dark-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-white text-lg truncate">
                            {method.name}
                          </CardTitle>
                          <CardDescription className="text-dark-400 text-xs mt-1">
                            {method.isActive ? (
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
                          onClick={() => handleOpenModal(method)}
                          className="text-dark-400 hover:text-gold-400 hover:bg-dark-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(method._id)}
                          className="text-dark-400 hover:text-red-400 hover:bg-dark-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-xs text-dark-500 mb-1">IBAN / Account Number</p>
                      <p className="text-white font-mono text-sm break-all">
                        {method.ibanOrAccount}
                      </p>
                    </div>
                    {method.accountHolderName && (
                      <div>
                        <p className="text-xs text-dark-500 mb-1">Account Holder</p>
                        <p className="text-white text-sm">
                          {method.accountHolderName}
                        </p>
                      </div>
                    )}
                    <div className="pt-2 border-t border-dark-700">
                      <p className="text-xs text-dark-500">
                        Created: {formatDate(method.createdAt)}
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
                    {isEditing ? 'Edit Payment Method' : 'Add Payment Method'}
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
                      Payment Method Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., JazzCash, EasyPaisa"
                      required
                      className="bg-dark-900 border-dark-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      IBAN / Account Number *
                    </label>
                    <Input
                      type="text"
                      value={formData.ibanOrAccount}
                      onChange={(e) => setFormData({ ...formData, ibanOrAccount: e.target.value })}
                      placeholder="Enter IBAN or account number"
                      required
                      className="bg-dark-900 border-dark-700 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Account Holder Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.accountHolderName}
                      onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                      placeholder="Enter account holder name"
                      required
                      className="bg-dark-900 border-dark-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Logo Image {!isEditing && '*'}
                    </label>
                    <div className="space-y-2">
                      {formData.logoPreview && (
                        <div className="relative w-24 h-24 rounded-lg bg-dark-700 overflow-hidden">
                          <img
                            src={formData.logoPreview}
                            alt="Preview"
                            className="w-full h-full object-contain"
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
                            onChange={handleLogoChange}
                            className="hidden"
                          />
                        </label>
                        {formData.logo && (
                          <span className="text-sm text-dark-400">{formData.logo.name}</span>
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

