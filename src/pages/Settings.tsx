import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Youtube,
  Loader2,
  Save,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Trash2
} from 'lucide-react'
import { api, AppSettings } from '@/lib/api'
import { showToast } from '@/lib/toast'

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>({
    youtubeChannelUrl: '',
    youtubeLiveStreamUrl: '',
  })
  const [originalSettings, setOriginalSettings] = useState<AppSettings>({
    youtubeChannelUrl: '',
    youtubeLiveStreamUrl: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      setError('')
      const data = await api.getAppSettings()
      setSettings(data)
      setOriginalSettings(data)
      setHasChanges(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings')
      console.error('Error fetching settings:', err)
      showToast.error('Failed to fetch settings')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Check if settings have changed
    const changed = 
      settings.youtubeChannelUrl !== originalSettings.youtubeChannelUrl ||
      settings.youtubeLiveStreamUrl !== originalSettings.youtubeLiveStreamUrl
    setHasChanges(changed)
  }, [settings, originalSettings])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError('')
      
      // Validate URLs
      if (settings.youtubeChannelUrl && !isValidUrl(settings.youtubeChannelUrl)) {
        showToast.error('Please enter a valid YouTube channel URL')
        return
      }
      
      if (settings.youtubeLiveStreamUrl && !isValidUrl(settings.youtubeLiveStreamUrl)) {
        showToast.error('Please enter a valid YouTube live stream URL')
        return
      }

      const updatedSettings = await api.updateAppSettings(settings)
      setSettings(updatedSettings)
      setOriginalSettings(updatedSettings)
      setHasChanges(false)
      showToast.success('Settings saved successfully!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings'
      setError(errorMessage)
      showToast.error(errorMessage)
      console.error('Error saving settings:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setSettings(originalSettings)
    setHasChanges(false)
    showToast.info('Settings reset to original values')
  }

  const handleClear = (field: 'youtubeChannelUrl' | 'youtubeLiveStreamUrl') => {
    setSettings({ ...settings, [field]: '' })
    showToast.info(`${field === 'youtubeChannelUrl' ? 'Channel' : 'Live Stream'} URL cleared`)
  }

  const handleTestLink = (url: string, type: string) => {
    if (!url) {
      showToast.error(`No ${type} URL configured`)
      return
    }
    if (!isValidUrl(url)) {
      showToast.error(`Invalid ${type} URL`)
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">App Settings</h1>
            <p className="text-dark-400 mt-1">Manage YouTube channel and live stream links</p>
          </div>
        </div>

        {isLoading ? (
          <Card className="bg-dark-800/50 border-dark-700">
            <CardContent className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-dark-800/50 border-dark-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Youtube className="w-5 h-5 text-gold-500" />
                YouTube Configuration
              </CardTitle>
              <CardDescription className="text-dark-400">
                Configure YouTube channel and live stream links that will be displayed in the mobile app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-400 text-sm font-medium">Error</p>
                    <p className="text-red-300 text-xs mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Current Settings Display */}
              <div className="bg-dark-900/50 border border-dark-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white">Current Settings</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchSettings}
                    className="text-dark-400 hover:text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-dark-400">Channel URL:</span>
                    <span className={`text-white truncate max-w-[60%] ${settings.youtubeChannelUrl ? '' : 'text-dark-500'}`}>
                      {settings.youtubeChannelUrl || 'Not set'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-dark-400">Live Stream URL:</span>
                    <span className={`text-white truncate max-w-[60%] ${settings.youtubeLiveStreamUrl ? '' : 'text-dark-500'}`}>
                      {settings.youtubeLiveStreamUrl || 'Not set'}
                    </span>
                  </div>
                </div>
              </div>

              {/* YouTube Channel URL */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-white">
                    YouTube Channel URL
                  </label>
                  <div className="flex gap-2">
                    {settings.youtubeChannelUrl && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTestLink(settings.youtubeChannelUrl, 'Channel')}
                          className="text-gold-500 hover:text-gold-400 h-7 px-2"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Test
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleClear('youtubeChannelUrl')}
                          className="text-red-400 hover:text-red-300 h-7 px-2"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <Input
                  type="url"
                  value={settings.youtubeChannelUrl}
                  onChange={(e) => setSettings({ ...settings, youtubeChannelUrl: e.target.value })}
                  placeholder="https://www.youtube.com/@rtmlottery"
                  className="bg-dark-900 border-dark-700 text-white"
                />
                <p className="text-dark-400 text-xs mt-2">
                  The full URL to your YouTube channel (e.g., https://www.youtube.com/@channelname)
                </p>
              </div>

              {/* YouTube Live Stream URL */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-white">
                    YouTube Live Stream URL
                  </label>
                  <div className="flex gap-2">
                    {settings.youtubeLiveStreamUrl && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTestLink(settings.youtubeLiveStreamUrl, 'Live Stream')}
                          className="text-gold-500 hover:text-gold-400 h-7 px-2"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Test
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleClear('youtubeLiveStreamUrl')}
                          className="text-red-400 hover:text-red-300 h-7 px-2"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <Input
                  type="url"
                  value={settings.youtubeLiveStreamUrl}
                  onChange={(e) => setSettings({ ...settings, youtubeLiveStreamUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="bg-dark-900 border-dark-700 text-white"
                />
                <p className="text-dark-400 text-xs mt-2">
                  The URL to your current or upcoming live stream (e.g., https://www.youtube.com/watch?v=...)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-dark-700">
                <Button
                  variant="ghost"
                  onClick={handleReset}
                  disabled={!hasChanges || isSaving}
                  className="text-dark-400 hover:text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <div className="flex gap-3">
                  {hasChanges && (
                    <span className="text-xs text-gold-500 self-center">Unsaved changes</span>
                  )}
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges}
                    className="bg-gold-500 hover:bg-gold-600 text-dark-900 font-bold min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}

