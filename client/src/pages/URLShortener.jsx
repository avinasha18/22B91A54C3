import { useState, useEffect } from "react"
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

// Small URL Input Component
const URLInput = ({ url, index, onChange, errors }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <Paper 
      elevation={0}
      sx={{ 
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        '&:hover': { borderColor: '#000', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinkIcon sx={{ fontSize: 18, color: '#666' }} />
            <Typography variant="subtitle2" color="text.secondary">
              URL #{index + 1}
            </Typography>
          </Box>
          <IconButton 
            size="small" 
            onClick={() => setExpanded(!expanded)}
            sx={{ 
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          >
            <ExpandIcon fontSize="small" />
          </IconButton>
        </Box>

        <TextField
          fullWidth
          size="small"
          placeholder="https://example.com/very-long-url"
          value={url.longURL}
          onChange={(e) => onChange(url.id, "longURL", e.target.value)}
          error={!!errors[`${url.id}-longURL`]}
          helperText={errors[`${url.id}-longURL`]}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': { borderColor: '#000' },
              '&.Mui-focused fieldset': { borderColor: '#000' }
            }
          }}
        />

        <Collapse in={expanded}>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Custom Code"
                placeholder="my-link"
                value={url.shortcode}
                onChange={(e) => onChange(url.id, "shortcode", e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#000' },
                    '&.Mui-focused fieldset': { borderColor: '#000' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Expiry (min)"
                type="number"
                placeholder="30"
                value={url.expiry}
                onChange={(e) => onChange(url.id, "expiry", e.target.value)}
                error={!!errors[`${url.id}-expiry`]}
                helperText={errors[`${url.id}-expiry`]}
                inputProps={{ min: 1 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#000' },
                    '&.Mui-focused fieldset': { borderColor: '#000' }
                  }
                }}
              />
            </Grid>
          </Grid>
        </Collapse>
      </Box>
    </Paper>
  )
}

// Result Item Component
const ResultItem = ({ result, onCopy }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await onCopy(result.shortURL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (result.error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        <Typography variant="body2">
          <strong>URL #{result.id}:</strong> {result.error}
        </Typography>
      </Alert>
    )
  }

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 2,
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        transition: 'all 0.2s ease',
        '&:hover': { borderColor: '#000', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        {result.originalURL}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#000' }}>
          {result.shortURL}
        </Typography>
        <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
          <IconButton 
            size="small" 
            onClick={handleCopy}
            sx={{ 
              color: copied ? '#4caf50' : '#000',
              '&:hover': { bgcolor: '#f5f5f5' }
            }}
          >
            {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Chip
          icon={<TimeIcon />}
          label={new Date(result.expiryTime).toLocaleString()}
          size="small"
          variant="outlined"
          sx={{ 
            borderColor: '#e0e0e0',
            '&:hover': { borderColor: '#000' }
          }}
        />
        <Chip 
          label={`Code: ${result.shortcode}`} 
          size="small" 
          sx={{ 
            bgcolor: '#000',
            color: 'white',
            '&:hover': { bgcolor: '#333' }
          }}
        />
      </Box>
    </Paper>
  )
}

const URLShortener = () => {
  const [urls, setUrls] = useState([
    { id: 1, longURL: "", shortcode: "", expiry: "" },
    { id: 2, longURL: "", shortcode: "", expiry: "" },
    { id: 3, longURL: "", shortcode: "", expiry: "" },
  ])

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    Log("frontend", "info", "page", "URL Shortener page loaded")
  }, [])

  const handleInputChange = (id, field, value) => {
    setUrls((prev) => prev.map((url) => (url.id === id ? { ...url, [field]: value } : url)))
    if (errors[`${id}-${field}`]) {
      setErrors((prev) => ({ ...prev, [`${id}-${field}`]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    let hasValidUrl = false

    urls.forEach((url) => {
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
    setUrls((prev) => prev.map((url) => ({ ...url, longURL: "", shortcode: "", expiry: "" })))
    setResults([])
    setErrors({})
    Log("frontend", "info", "component", "Form cleared")
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#000', mb: 1 }}>
          URL Shortener
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create multiple short URLs quickly and efficiently
        </Typography>
      </Box>

      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          {errors.general && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {errors.general}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            {urls.map((url, index) => (
              <URLInput
                key={url.id}
                url={url}
                index={index}
                onChange={handleInputChange}
                errors={errors}
              />
            ))}
          </Box>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
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
              {loading ? "Creating..." : "Create URLs"}
            </Button>

            <Button 
              variant="outlined" 
              size="large" 
              onClick={clearAll} 
              startIcon={<ClearIcon />}
              sx={{
                borderColor: '#e0e0e0',
                color: '#666',
                px: 3,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { borderColor: '#000', color: '#000' }
              }}
            >
              Clear
            </Button>
          </Box>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Fade in={true}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#000', mb: 3 }}>
                Generated URLs
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {results.map((result, index) => (
                  <Box key={result.id}>
                    {index > 0 && <Divider sx={{ my: 2 }} />}
                    <ResultItem result={result} onCopy={handleCopy} />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Fade>
      )}
    </Box>
  )
}

export default URLShortener