import { useEffect, useState } from "react"
import { Box, Typography, CircularProgress, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button } from "@mui/material"
import { getSingleURLStats } from "../api/urlService"
import { Close as CloseIcon } from "@mui/icons-material"

const URLStatsModal = ({ shortcode, onClose }) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!shortcode) return
    
    setLoading(true)
    setError(null)
    setStats(null)
    
    getSingleURLStats(shortcode)
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [shortcode])

  return (
    <Box sx={{ bgcolor: "#fff", p: 3, minHeight: 300, position: "relative" }}>
      <IconButton onClick={onClose} sx={{ position: "absolute", top: 8, right: 8 }}>
        <CloseIcon />
      </IconButton>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : stats ? (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {stats.shortURL}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Original: {stats.longURL}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Typography variant="body2">Clicks: <b>{stats.clicks}</b></Typography>
            <Typography variant="body2">Created: <b>{new Date(stats.createdAt).toLocaleString()}</b></Typography>
            <Typography variant="body2">Expires: <b>{new Date(stats.expiryTime).toLocaleString()}</b></Typography>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Click History</Typography>
          {stats.clickLogs && stats.clickLogs.length > 0 ? (
            <TableContainer component={Paper} sx={{ mb: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>User Agent</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.clickLogs.slice(0, 10).map((click, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{new Date(click.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{click.source}</TableCell>
                      <TableCell>{click.userAgent}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="text.secondary">No clicks yet.</Typography>
          )}
        </Box>
      ) : null}
      
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button onClick={onClose} variant="outlined">Close</Button>
      </Box>
    </Box>
  )
}

export default URLStatsModal 