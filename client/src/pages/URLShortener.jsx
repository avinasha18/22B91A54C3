import { useState, useEffect, useRef } from "react"
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Divider,
  Paper,
  Fade,
  Collapse,
  Stack,
} from "@mui/material"
import {
  ContentCopy as CopyIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  AccessTime as TimeIcon,
  Link as LinkIcon,
  Check as CheckIcon,
  KeyboardArrowDown as ExpandIcon,
} from "@mui/icons-material"
import { Log } from "../utils/logger"
import { validateURL } from "../utils/helpers"
import { createShortURL } from "../api/urlService"
import URLInputCard from "../components/URLInputCard"
import ResultItem from "../components/ResultItem"

const MAX_CARDS = 5

const URLShortener = () => {
  const [urls, setUrls] = useState([{ id: 1, longURL: "", shortcode: "", expiry: "", expanded: false }])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const resultsRef = useRef(null)

  useEffect(() => {
    Log("frontend", "info", "page", "URL Shortener page loaded")
  }, [])

  const handleInputChange = (id, field, value) => {
    setUrls(prev => prev.map(url => 
      url.id === id ? { ...url, [field]: value, expanded: field === "longURL" && value ? true : url.expanded } : url
    ))
    
    if (errors[`${id}-${field}`]) {
      setErrors(prev => ({ ...prev, [`${id}-${field}`]: null }))
    }
    
    // Add new card if last one is filled and under max limit
    if (field === "longURL" && value && id === urls[urls.length - 1].id && urls.length < MAX_CARDS) {
      setUrls(prev => [...prev, { id: prev.length + 1, longURL: "", shortcode: "", expiry: "", expanded: false }])
    }
  }

  const validateForm = () => {
    const newErrors = {}
    let hasValidUrl = false
    
    urls.forEach(url => {
      if (url.longURL.trim()) {
        hasValidUrl = true
        if (!validateURL(url.longURL)) {
          newErrors[`${url.id}-longURL`] = "Invalid URL format"
        }
        if (url.expiry && (isNaN(url.expiry) || parseInt(url.expiry) <= 0)) {
          newErrors[`${url.id}-expiry`] = "Invalid minutes"
        }
      }
    })
    
    if (!hasValidUrl) {
      newErrors.general = "Enter at least one URL to shorten"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    
    setLoading(true)
    const newResults = []
    
    try {
      for (const url of urls) {
        if (url.longURL.trim()) {
          try {
            const urlData = {
              longURL: url.longURL,
              shortcode: url.shortcode || undefined,
              expiry: url.expiry ? parseInt(url.expiry) : undefined,
            }
            const result = await createShortURL(urlData)
            newResults.push({ id: url.id, ...result, originalURL: url.longURL })
            Log("frontend", "info", "api", `Successfully created short URL`)
          } catch (error) {
            newResults.push({ id: url.id, error: error.message, originalURL: url.longURL })
            Log("frontend", "error", "api", `Failed to create short URL: ${error.message}`)
          }
        }
      }
      setResults(newResults)
      
      // Scroll to results section after a short delay
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          })
        }
      }, 100)
      
    } catch (error) {
      Log("frontend", "fatal", "component", `Critical error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      Log("frontend", "info", "component", "URL copied to clipboard")
    } catch (error) {
      Log("frontend", "error", "component", `Failed to copy: ${error.message}`)
    }
  }

  const clearAll = () => {
    setUrls([{ id: 1, longURL: "", shortcode: "", expiry: "", expanded: false }])
    setResults([])
    setErrors({})
    Log("frontend", "info", "component", "Form cleared")
  }

  const handleAddCard = () => {
    if (urls.length < MAX_CARDS) {
      setUrls(prev => [...prev, { id: prev.length + 1, longURL: "", shortcode: "", expiry: "", expanded: false }])
    }
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#000', mb: 1 }}>
          URL Shortener
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Create up to 5 short URLs at once. You can add another URL by clicking the button below.
        </Typography>
      </Box>
      
      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          {errors.general && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{errors.general}</Alert>
          )}
          
          <Stack spacing={2} mb={3}>
            {urls.map((url, index) => (
              <URLInputCard
                key={url.id}
                url={url}
                index={index}
                onChange={handleInputChange}
                errors={errors}
                disabled={loading}
              />
            ))}
          </Stack>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleAddCard}
              startIcon={<AddIcon />}
              disabled={urls.length >= MAX_CARDS || loading}
              sx={{ borderRadius: 2, fontWeight: 500 }}
            >
              Add another URL
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={clearAll}
              startIcon={<ClearIcon />}
              sx={{ borderRadius: 2, fontWeight: 500 }}
              disabled={loading}
            >
              Clear
            </Button>
          </Box>
          
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading}
              sx={{ 
                bgcolor: '#000', 
                color: 'white', 
                px: 4, 
                borderRadius: 2, 
                textTransform: 'none', 
                fontWeight: 600, 
                '&:hover': { bgcolor: '#333' }, 
                '&:disabled': { bgcolor: '#ccc' } 
              }}
            >
              {loading ? <CircularProgress size={18} color="inherit" /> : <AddIcon sx={{ mr: 1 }} />} Create URLs
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      {results.length > 0 && (
        <div ref={resultsRef}>
          <Fade in={true}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#000', mb: 3 }}>
                  Generated URLs
                </Typography>
                <Stack spacing={2}>
                  {results.map((result, index) => (
                    <Box key={result.id}>
                      {index > 0 && <Divider sx={{ my: 2 }} />}
                      <ResultItem result={result} onCopy={handleCopy} />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Fade>
        </div>
      )}
    </Box>
  )
}

export default URLShortener