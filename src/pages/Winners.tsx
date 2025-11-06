import { useState, useEffect, useRef } from 'react'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search,
  Loader2,
  AlertCircle,
  Trophy,
  Play
} from 'lucide-react'
import { api, User, Winner, Ticket } from '@/lib/api'
import { showToast } from '@/lib/toast'

export default function Winners() {
  const [winners, setWinners] = useState<Winner[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Spinner state
  const [allUsers, setAllUsers] = useState<User[]>([]) // All users for display
  const [selectedTicket, setSelectedTicket] = useState<string>('')
  const [prizeAmount, setPrizeAmount] = useState('')
  const [isSpinning, setIsSpinning] = useState(false)
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null)
  const spinIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetchWinners()
    fetchTickets()
  }, [])

  useEffect(() => {
    // Cleanup interval on unmount
    return () => {
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current)
      }
    }
  }, [])

  const fetchWinners = async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await api.getWinners({ page: 1, limit: 50 })
      setWinners(response.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch winners')
      console.error('Error fetching winners:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTickets = async () => {
    try {
      const data = await api.getTickets(true) // Get active tickets only
      setTickets(data || [])
    } catch (err) {
      console.error('Error fetching tickets:', err)
    }
  }

  const fetchAllUsers = async () => {
    try {
      const response = await api.getUsers({ 
        page: 1, 
        limit: 1000, // Get all users
        sort: 'createdAt',
        order: 'desc'
      })
      const users = response.data || []
      
      // Separate all users (for display) and admin users (for winner selection)
      const allUsersList = users // Show all users during spinning
      const adminUsersList = users.filter(user => user.role === 'admin') // Only admins can win
      
      setAllUsers(allUsersList)
      
      return { allUsers: allUsersList, adminUsers: adminUsersList }
    } catch (err) {
      console.error('Error fetching users:', err)
      showToast.error('Failed to fetch users')
      return { allUsers: [], adminUsers: [] }
    }
  }

  const startSpin = async () => {
    if (!selectedTicket) {
      showToast.error('Please select a ticket')
      return
    }
    if (!prizeAmount || parseFloat(prizeAmount) <= 0) {
      showToast.error('Please enter a valid prize amount')
      return
    }

    // Fetch all users (for display) and admin users (for winner selection)
    const { allUsers: usersForDisplay, adminUsers: usersForWinner } = await fetchAllUsers()
    
    if (usersForDisplay.length === 0) {
      showToast.error('No users available')
      return
    }
    
    if (usersForWinner.length === 0) {
      showToast.error('No admin users available for winner selection')
      return
    }

    setIsSpinning(true)
    setWinnerIndex(null)

    // Simulate spinning by rapidly changing through ALL users (for display)
    let currentIndex = 0
    const spinDuration = 3000 // 3 seconds
    const startTime = Date.now()
    const interval = 50 // Change every 50ms

    spinIntervalRef.current = setInterval(() => {
      // Cycle through all users for display
      currentIndex = (currentIndex + 1) % usersForDisplay.length
      setWinnerIndex(currentIndex)

      if (Date.now() - startTime >= spinDuration) {
        // Select random winner from ADMIN users only
        const randomIndex = Math.floor(Math.random() * usersForWinner.length)
        const winnerUser = usersForWinner[randomIndex]
        
        // Find the index of the winner in the all users array for display
        const winnerDisplayIndex = usersForDisplay.findIndex(u => u._id === winnerUser._id)
        setWinnerIndex(winnerDisplayIndex >= 0 ? winnerDisplayIndex : 0)
        setIsSpinning(false)
        
        if (spinIntervalRef.current) {
          clearInterval(spinIntervalRef.current)
          spinIntervalRef.current = null
        }

        // Save winner after a brief delay
        setTimeout(() => {
          saveWinner(winnerUser)
        }, 500)
      }
    }, interval)
  }

  const saveWinner = async (winnerUser: User) => {
    try {
      const selectedTicketData = tickets.find(t => t._id === selectedTicket)
      
      if (!winnerUser || !selectedTicketData) {
        showToast.error('Error: User or ticket not found')
        return
      }

      // Ensure user is admin (only admins can win)
      if (winnerUser.role !== 'admin') {
        showToast.error('Only admin users can be selected as winners')
        return
      }

      await api.createWinner({
        name: winnerUser.name,
        prize: parseFloat(prizeAmount),
        drawDate: new Date().toISOString(),
        ticketName: selectedTicketData.name,
        ticketId: selectedTicket,
        userId: winnerUser._id,
      })

      showToast.success('Winner saved successfully!')
      fetchWinners()
      
      // Reset form
      setSelectedTicket('')
      setPrizeAmount('')
      setWinnerIndex(null)
      setAllUsers([])
    } catch (err) {
      console.error('Error saving winner:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to save winner'
      showToast.error(errorMessage)
    }
  }

  const filteredWinners = winners.filter(winner =>
    winner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    winner.ticketName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Winners</h1>
            <p className="text-dark-400 mt-1">Manage lottery winners and select new winners</p>
          </div>
        </div>

        {/* Spinner Section */}
        <Card className="bg-dark-800/50 border-dark-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gold-500" />
              Select Winner
            </CardTitle>
            <CardDescription className="text-dark-400">
              Select ticket and prize amount, then spin to randomly choose a winner. All users will be shown during spinning, but only admin users can win.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Ticket Selection */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Select Ticket
              </label>
              <select
                value={selectedTicket}
                onChange={(e) => setSelectedTicket(e.target.value)}
                className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="">Choose a ticket...</option>
                {tickets.map(ticket => (
                  <option key={ticket._id} value={ticket._id}>
                    {ticket.name} - {ticket.price} RS
                  </option>
                ))}
              </select>
            </div>

            {/* Prize Amount */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Prize Amount (RS)
              </label>
              <Input
                type="number"
                value={prizeAmount}
                onChange={(e) => setPrizeAmount(e.target.value)}
                placeholder="Enter prize amount"
                className="bg-dark-900 border-dark-700 text-white"
              />
            </div>

            {/* Spinner Display */}
            <div className="mt-6">
              <div className="text-white font-medium mb-4 text-center">
                {isSpinning ? 'Spinning...' : winnerIndex !== null ? 'Winner Selected!' : 'Ready to Spin'}
              </div>
              <div className="bg-dark-900 border-2 border-gold-500 rounded-lg p-6 min-h-[200px] flex items-center justify-center">
                {isSpinning && winnerIndex !== null && allUsers[winnerIndex] ? (
                  <div className="text-center">
                    <Trophy className="w-16 h-16 text-gold-500 mx-auto mb-4" />
                    <div className="text-2xl font-bold text-white">
                      {allUsers[winnerIndex].name}
                    </div>
                    <div className="text-dark-400 mt-2">
                      {allUsers[winnerIndex].email}
                    </div>
                  </div>
                ) : winnerIndex !== null && allUsers[winnerIndex] ? (
                  <div className="text-center">
                    <Trophy className="w-16 h-16 text-gold-500 mx-auto mb-4" />
                    <div className="text-2xl font-bold text-white">
                      {allUsers[winnerIndex].name}
                    </div>
                    <div className="text-dark-400 mt-2">
                      {allUsers[winnerIndex].email}
                    </div>
                  </div>
                ) : (
                  <div className="text-dark-400 text-center">
                    {isSpinning ? 'Selecting winner...' : 'Click "Spin to Select Winner" to start'}
                  </div>
                )}
              </div>
            </div>

            {/* Spin Button */}
            <Button
              onClick={startSpin}
              disabled={isSpinning || !selectedTicket || !prizeAmount}
              className="w-full bg-gold-500 hover:bg-gold-600 text-dark-900 font-bold"
            >
              {isSpinning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Spinning...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Spin to Select Winner
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Winners List */}
        <Card className="bg-dark-800/50 border-dark-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gold-500" />
              Recent Winners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search winners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-dark-900 border-dark-700 text-white"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-red-400 py-4">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            ) : filteredWinners.length === 0 ? (
              <div className="text-center py-8 text-dark-400">
                No winners found
              </div>
            ) : (
              <div className="space-y-3">
                {filteredWinners.map(winner => (
                  <div
                    key={winner._id}
                    className="bg-dark-900 border border-dark-700 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gold-500/20 rounded-full flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-gold-500" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{winner.name}</div>
                        <div className="text-dark-400 text-sm">{winner.ticketName}</div>
                        <div className="text-dark-400 text-sm">
                          {new Date(winner.drawDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gold-500 font-bold text-lg">
                        {winner.prize.toLocaleString()} RS
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

