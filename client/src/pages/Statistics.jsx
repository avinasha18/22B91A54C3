import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Modal,
  Backdrop,
  Fade,
  Button,
  Avatar,
  Stack,
  LinearProgress,
} from "@mui/material"
import {
  Refresh as RefreshIcon,
  Launch as LaunchIcon,
  AccessTime as TimeIcon,
  Mouse as ClickIcon,
  TrendingUp as TrendingIcon,
  Link as LinkIcon,
  Close as CloseIcon,
  BarChart as ChartIcon,
  Visibility as ViewIcon,
  Language as WebIcon,
  DeviceHub as DeviceIcon,
  Schedule as ScheduleIcon,
  Analytics as AnalyticsIcon,
} from "@mui/icons-material"
import { Log } from "../utils/logger"
import { getAllURLs, getSingleURLStats } from "../api/urlService"
import { formatTimeRemaining } from "../utils/helpers"

const Statistics = () => {
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedShortcode, setSelectedShortcode] = useState(null)
  const [selectedStats, setSelectedStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    Log("frontend", "info", "page", "Statistics page loaded")
    fetchURLs()
  }, [])

  const fetchURLs = async () => {
    setLoading(true)
    setError(null)
    try {
      const urls = await getAllURLs()
      setUrls(urls)
      Log("frontend", "info", "api", `Loaded ${urls.length} URLs for statistics list`)
    } catch (error) {
      Log("frontend", "error", "api", `Failed to fetch URLs: ${error.message}`)
      setError("Failed to load URLs. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectURL = async (shortcode) => {
    setSelectedShortcode(shortcode)
    setSelectedStats(null)
    setStatsError(null)
    setStatsLoading(true)
    setModalOpen(true)
    
    try {
      const stats = await getSingleURLStats(shortcode)
      setSelectedStats(stats)
      Log("frontend", "info", "api", `Loaded stats for ${shortcode}`)
    } catch (error) {
      setStatsError(error.message)
      Log("frontend", "error", "api", `Failed to load stats for ${shortcode}: ${error.message}`)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedShortcode(null)
    setSelectedStats(null)
    setStatsError(null)
  }

  const getStatusColor = (expiryTime) => {
    const now = new Date()
    const expiry = new Date(expiryTime)
    const timeLeft = expiry - now
    if (timeLeft <= 0) return "error"
    if (timeLeft <= 5 * 60 * 1000) return "warning"
    return "success"
  }

  const getStatusText = (expiryTime) => {
    const now = new Date()
    const expiry = new Date(expiryTime)
    const timeLeft = expiry - now
    if (timeLeft <= 0) return "Expired"
    return formatTimeRemaining(timeLeft)
  }

  const getReferrerDisplayName = (source) => {
    if (source === 'direct') return 'Direct Access';
    try {
      const url = new URL(source);
      const domain = url.hostname;
      const knownSites = {
        'instagram.com': 'Instagram',
        'facebook.com': 'Facebook',
        'twitter.com': 'Twitter',
        'linkedin.com': 'LinkedIn',
        'youtube.com': 'YouTube',
        'reddit.com': 'Reddit',
        'tiktok.com': 'TikTok',
        'whatsapp.com': 'WhatsApp',
        'telegram.org': 'Telegram',
        'google.com': 'Google',
        'bing.com': 'Bing',
        'yahoo.com': 'Yahoo',
        'github.com': 'GitHub',
        'stackoverflow.com': 'Stack Overflow'
      };
      if (knownSites[domain]) return knownSites[domain];
      for (const [siteDomain, siteName] of Object.entries(knownSites)) {
        if (domain.includes(siteDomain)) return siteName;
      }
      return domain.replace('www.', '');
    } catch {
      return source;
    }
  }

  const getBrowserInfo = (userAgent) => {
    if (!userAgent || userAgent === 'Unknown') return 'Unknown Browser';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    if (userAgent.includes('MSIE') || userAgent.includes('Trident')) return 'Internet Explorer';
    if (userAgent.includes('Mobile')) return 'Mobile Browser';
    if (userAgent.includes('Android')) return 'Android Browser';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS Browser';
    return 'Other Browser';
  }

  const getClicksProgress = (clicks) => {
    const maxClicks = Math.max(...urls.map(url => url.clicks), 1)
    return (clicks / maxClicks) * 100
  }

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          color: 'white',
          p: 4
        }}
      >
        <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 300 }}>
          Loading URLs...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      p: 3
    }}>
      {/* Header Section */}
      <Box sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        mb: 4,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        p: 3,
        color: 'white',
        boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
            <AnalyticsIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              URL Analytics
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
              Monitor your short URLs performance
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Refresh URL list">
          <IconButton 
            onClick={fetchURLs} 
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
              color: 'white'
            }}
            size="large"
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(244, 67, 54, 0.2)'
          }}
        >
          {error}
        </Alert>
      )}

      {/* URLs Grid */}
      <Grid container spacing={3}>
        {urls.map((url, index) => (
          <Grid item xs={12} md={6} lg={4} key={url.shortcode}>
            <Card 
              sx={{ 
                borderRadius: '20px',
                boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': {
                  transform: 'translateY(-10px)',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                }
              }}
              onClick={() => handleSelectURL(url.shortcode)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ 
                    bgcolor: 'primary.main',
                    width: 48, 
                    height: 48,
                    mr: 2
                  }}>
                    <LinkIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {url.shortcode}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {url.shortURL}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Click Progress
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={getClicksProgress(url.clicks)}
                    sx={{ 
                      height: 8, 
                      borderRadius: 5,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)'
                      }
                    }}
                  />
                </Box>

                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip 
                    icon={<ClickIcon />} 
                    label={`${url.clicks} clicks`} 
                    size="small"
                    sx={{ 
                      bgcolor: 'primary.main',
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                  <Chip 
                    icon={<ViewIcon />} 
                    label="View Stats" 
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Stack>

                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                    }
                  }}
                >
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Statistics Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { backdropFilter: 'blur(10px)' }
        }}
      >
        <Fade in={modalOpen}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', sm: '90%', md: '80%', lg: '70%' },
            maxWidth: '1000px',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: '25px',
            boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
            p: 0,
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <Box sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              p: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                  <ChartIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    URL Analytics
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {selectedShortcode}
                  </Typography>
                </Box>
              </Box>
              <IconButton 
                onClick={handleCloseModal}
                sx={{ 
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Modal Content */}
            <Box sx={{ p: 3, maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
              {statsLoading ? (
                <Box display="flex" flexDirection="column" alignItems="center" py={6}>
                  <CircularProgress size={50} sx={{ mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Loading statistics...
                  </Typography>
                </Box>
              ) : statsError ? (
                <Alert severity="error" sx={{ borderRadius: '15px' }}>
                  {statsError}
                </Alert>
              ) : selectedStats ? (
                <Box>
                  {/* URL Info Card */}
                  <Card sx={{ 
                    mb: 3, 
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Original URL
                          </Typography>
                          <Typography variant="body1" sx={{ wordBreak: 'break-all', mb: 2 }}>
                            {selectedStats.longURL}
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                              {selectedStats.shortURL}
                            </Typography>
                            <Tooltip title="Open URL">
                              <IconButton 
                                size="small" 
                                onClick={() => window.open(selectedStats.shortURL, "_blank")}
                                sx={{ 
                                  bgcolor: 'primary.main',
                                  color: 'white',
                                  '&:hover': { bgcolor: 'primary.dark' }
                                }}
                              >
                                <LaunchIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Stats Grid */}
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ 
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        textAlign: 'center'
                      }}>
                        <CardContent>
                          <ClickIcon sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {selectedStats.clicks || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Total Clicks
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ 
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white',
                        textAlign: 'center'
                      }}>
                        <CardContent>
                          <TimeIcon sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {getStatusText(selectedStats.expiryTime)}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Time Remaining
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ 
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        color: 'white',
                        textAlign: 'center'
                      }}>
                        <CardContent>
                          <ScheduleIcon sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="body1" sx={{ fontWeight: 700 }}>
                            {new Date(selectedStats.createdAt).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Created Date
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ 
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                        color: 'white',
                        textAlign: 'center'
                      }}>
                        <CardContent>
                          <TrendingIcon sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {selectedStats.clickLogs?.length || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Click Events
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Click History */}
                  {selectedStats.clickLogs && selectedStats.clickLogs.length > 0 && (
                    <Card sx={{ borderRadius: '20px', overflow: 'hidden' }}>
                      <Box sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        p: 2
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WebIcon />
                          Click History
                        </Typography>
                      </Box>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                              <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Source/Referrer</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Browser</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedStats.clickLogs.slice(0, 10).map((click, clickIndex) => (
                              <TableRow key={clickIndex} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {new Date(click.timestamp).toLocaleString()}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  {click.source === 'direct' ? (
                                    <Chip 
                                      label="Direct Access" 
                                      size="small" 
                                      sx={{ 
                                        bgcolor: 'grey.200',
                                        fontWeight: 500
                                      }}
                                    />
                                  ) : (
                                    <Tooltip title={click.source}>
                                      <Chip 
                                        label={getReferrerDisplayName(click.source)} 
                                        size="small" 
                                        color="primary" 
                                        variant="outlined"
                                        sx={{ fontWeight: 500 }}
                                      />
                                    </Tooltip>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Tooltip title={click.userAgent}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <DeviceIcon fontSize="small" color="action" />
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {getBrowserInfo(click.userAgent)}
                                      </Typography>
                                    </Box>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      {selectedStats.clickLogs.length > 10 && (
                        <Box sx={{ p: 2, bgcolor: 'grey.50', textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            Showing latest 10 clicks out of {selectedStats.clickLogs.length} total
                          </Typography>
                        </Box>
                      )}
                    </Card>
                  )}
                </Box>
              ) : null}
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  )
}

export default Statistics