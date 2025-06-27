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
} from "@mui/material"
import {
  ContentCopy as CopyIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material"
import { Log } from "../utils/logger"
import { validateURL } from "../utils/helpers"
import { createShortURL } from "../api/urlService"

const URLShortener = () => {
  const [urls, setUrls] = useState([
    { id: 1, longURL: "", shortcode: "", expiry: "" },
    { id: 2, longURL: "", shortcode: "", expiry: "" },
    { id: 3, longURL: "", shortcode: "", expiry: "" },
    { id: 4, longURL: "", shortcode: "", expiry: "" },
    { id: 5, longURL: "", shortcode: "", expiry: "" },
  ])

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    Log("frontend", "info", "page", "URL Shortener page loaded")
  }, [])

  const handleInputChange = (id, field, value) => {
    setUrls((prev) => prev.map((url) => (url.id === id ? { ...url, [field]: value } : url)))

    // Clear error when user starts typing
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
          newErrors[`${url.id}-longURL`] = "Please enter a valid URL"
        }

        if (url.expiry && (isNaN(url.expiry) || parseInt(url.expiry) <= 0)) {
          newErrors[`${url.id}-expiry`] = "Please enter a valid number of minutes"
        }
      }
    })

    if (!hasValidUrl) {
      newErrors.general = "Please enter at least one URL to shorten"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      Log("frontend", "warn", "component", "Form validation failed")
      return
    }

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

            newResults.push({
              id: url.id,
              ...result,
              originalURL: url.longURL,
            })

            Log("frontend", "info", "api", `Successfully created short URL for ${url.longURL}`)
          } catch (error) {
            Log("frontend", "error", "api", `Failed to create short URL: ${error.message}`)
            newResults.push({
              id: url.id,
              error: error.message,
              originalURL: url.longURL,
            })
          }
        }
      }

      setResults(newResults)
    } catch (error) {
      Log("frontend", "fatal", "component", `Critical error in URL shortening: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      Log("frontend", "info", "component", "URL copied to clipboard")
    } catch (error) {
      Log("frontend", "error", "component", `Failed to copy URL: ${error.message}`)
    }
  }

  const clearAll = () => {
    setUrls((prev) => prev.map((url) => ({ ...url, longURL: "", shortcode: "", expiry: "" })))
    setResults([])
    setErrors({})
    Log("frontend", "info", "component", "Form cleared")
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom align="center" color="primary">
        Create Short URLs
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          {errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.general}
            </Alert>
          )}

          <Grid container spacing={3}>
            {urls.map((url, index) => (
              <Grid item xs={12} key={url.id}>
                <Box sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom color="text.secondary">
                    URL #{index + 1}
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Long URL"
                        placeholder="https://example.com/very-long-url"
                        value={url.longURL}
                        onChange={(e) => handleInputChange(url.id, "longURL", e.target.value)}
                        error={!!errors[`${url.id}-longURL`]}
                        helperText={errors[`${url.id}-longURL`]}
                        variant="outlined"
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Custom Short Code (Optional)"
                        placeholder="my-link"
                        value={url.shortcode}
                        onChange={(e) => handleInputChange(url.id, "shortcode", e.target.value)}
                        variant="outlined"
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Expiry (Minutes)"
                        type="number"
                        placeholder="30"
                        value={url.expiry}
                        onChange={(e) => handleInputChange(url.id, "expiry", e.target.value)}
                        error={!!errors[`${url.id}-expiry`]}
                        helperText={errors[`${url.id}-expiry`] || "Default: 30 minutes"}
                        inputProps={{ min: 1 }}
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
              sx={{ minWidth: 150 }}
            >
              {loading ? "Creating..." : "Create Short URLs"}
            </Button>

            <Button variant="outlined" size="large" onClick={clearAll} startIcon={<ClearIcon />}>
              Clear All
            </Button>
          </Box>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom color="primary">
              Results
            </Typography>

            {results.map((result, index) => (
              <Box key={result.id} sx={{ mb: 2 }}>
                {index > 0 && <Divider sx={{ mb: 2 }} />}

                {result.error ? (
                  <Alert severity="error">
                    <Typography variant="body2">
                      <strong>URL #{result.id}:</strong> {result.error}
                    </Typography>
                  </Alert>
                ) : (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Original URL: {result.originalURL}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <Typography variant="h6" color="primary">
                        {result.shortURL}
                      </Typography>
                      <Tooltip title="Copy to clipboard">
                        <IconButton size="small" onClick={() => handleCopy(result.shortURL)} color="primary">
                          <CopyIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Chip
                        icon={<TimeIcon />}
                        label={`Expires: ${new Date(result.expiryTime).toLocaleString()}`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                      <Chip label={`Code: ${result.shortcode}`} size="small" color="primary" variant="outlined" />
                    </Box>
                  </Box>
                )}
              </Box>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default URLShortener
