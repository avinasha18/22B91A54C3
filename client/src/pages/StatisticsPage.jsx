import { useState, useEffect } from "react"
import { Box, Typography, Container, Alert, CircularProgress, Dialog, Button, Stack } from "@mui/material"
import { getAllURLs } from "../api/urlService"
import { Log } from "../utils/logger"
import URLList from "../components/URLList"
import URLStatsModal from "../components/URLStatsModal"
import RefreshIcon from '@mui/icons-material/Refresh';

const StatisticsPage = () => {
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedShortcode, setSelectedShortcode] = useState(null)
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
    } catch (error) {
      setError("Failed to load URLs. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (shortcode) => {
    setSelectedShortcode(shortcode)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedShortcode(null)
  }

  return (
    <Container maxWidth="lg" sx={{ bgcolor: "#fff", minHeight: "100vh", py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: "#222" }}>
          URL Statistics
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchURLs}
          sx={{ borderRadius: 2, fontWeight: 500 }}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: '100%' }}>
          <URLList urls={urls} onSelect={handleSelect} />
        </Box>
      )}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <URLStatsModal shortcode={selectedShortcode} onClose={handleCloseModal} />
      </Dialog>
    </Container>
  )
}

export default StatisticsPage 