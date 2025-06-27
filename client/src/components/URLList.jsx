import { List, ListItem, ListItemButton, ListItemText, Divider, Typography, Box, IconButton, Tooltip } from "@mui/material"
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useState } from "react"

const URLList = ({ urls, onSelect }) => {
  const [copied, setCopied] = useState(null)

  const handleCopy = async (url, shortcode) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(shortcode)
      setTimeout(() => setCopied(null), 1200)
    } catch {}
  }

  if (!urls.length) {
    return <Typography color="text.secondary">No URLs found.</Typography>
  }
  return (
    <Box sx={{ bgcolor: "#fafafa", borderRadius: 2, boxShadow: 1, p: 2 }}>
      <List>
        {urls.map((url, idx) => (
          <Box key={url.shortcode}>
            <ListItem
              disablePadding
              secondaryAction={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title={copied === url.shortcode ? "Copied!" : "Copy link"}>
                    <IconButton edge="end" onClick={() => handleCopy(url.shortURL, url.shortcode)}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Open link">
                    <IconButton edge="end" component="a" href={url.shortURL} target="_blank" rel="noopener noreferrer">
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <ListItemButton onClick={() => onSelect(url.shortcode)}>
                <ListItemText
                  primary={url.shortURL}
                  secondary={`Code: ${url.shortcode} | Clicks: ${url.clicks}`}
                  primaryTypographyProps={{ sx: { color: "#222", fontWeight: 500 } }}
                  secondaryTypographyProps={{ sx: { color: "#555" } }}
                />
              </ListItemButton>
            </ListItem>
            {idx < urls.length - 1 && <Divider />}
          </Box>
        ))}
      </List>
    </Box>
  )
}

export default URLList 