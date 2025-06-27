import { List, ListItem, ListItemButton, ListItemText, Divider, Typography, Box } from "@mui/material"

const URLList = ({ urls, onSelect }) => {
  if (!urls.length) {
    return <Typography color="text.secondary">No URLs found.</Typography>
  }
  return (
    <Box sx={{ bgcolor: "#fafafa", borderRadius: 2, boxShadow: 1, p: 2 }}>
      <List>
        {urls.map((url, idx) => (
          <Box key={url.shortcode}>
            <ListItem disablePadding>
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