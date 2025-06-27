import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Alert,
  Chip,
} from "@mui/material"
import {
  ContentCopy as CopyIcon,
  Launch as LaunchIcon,
  Check as CheckIcon,
} from "@mui/icons-material"
import { useState } from "react"

const ResultItem = ({ result, onCopy }) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    if (result.error) return
    
    try {
      await onCopy(result.shortURL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const openInNewTab = () => {
    if (result.error) return
    window.open(result.shortURL, "_blank", "noopener,noreferrer")
  }

  if (result.error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Failed to create short URL
          </Typography>
          <Typography variant="caption" color="inherit">
            {result.error}
          </Typography>
        </Alert>
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Original URL: {result.originalURL}
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
          Original:
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            wordBreak: 'break-all',
            color: '#666',
            fontStyle: 'italic'
          }}
        >
          {result.originalURL}
        </Typography>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1, 
        mb: 2,
        p: 2,
        bgcolor: '#f8f9fa',
        borderRadius: 1,
        border: '1px solid #e9ecef'
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            color: '#1976d2',
            flexGrow: 1,
            wordBreak: 'break-all'
          }}
        >
          {result.shortURL}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={copied ? "Copied!" : "Copy URL"}>
            <IconButton 
              size="small" 
              onClick={copyToClipboard}
              sx={{ 
                bgcolor: copied ? '#4caf50' : '#fff',
                color: copied ? '#fff' : '#666',
                border: '1px solid #ddd',
                '&:hover': { 
                  bgcolor: copied ? '#4caf50' : '#f5f5f5' 
                }
              }}
            >
              {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Open URL">
            <IconButton 
              size="small" 
              onClick={openInNewTab}
              sx={{ 
                bgcolor: '#fff',
                color: '#666',
                border: '1px solid #ddd',
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
            >
              <LaunchIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip 
          label={`Code: ${result.shortcode}`} 
          size="small" 
          variant="outlined"
          sx={{ fontSize: '0.75rem' }}
        />
        <Chip 
          label={`Expires: ${new Date(result.expiryTime).toLocaleString()}`} 
          size="small" 
          variant="outlined"
          sx={{ fontSize: '0.75rem' }}
        />
        <Chip 
          label="0 clicks" 
          size="small" 
          variant="outlined"
          sx={{ fontSize: '0.75rem' }}
        />
      </Box>
    </Box>
  )
}

export default ResultItem 