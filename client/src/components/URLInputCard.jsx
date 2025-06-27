import {
  Card,
  CardContent,
  TextField,
  Box,
  Typography,
  Collapse,
  IconButton,
  Tooltip,
} from "@mui/material"
import {
  KeyboardArrowDown as ExpandIcon,
  KeyboardArrowUp as CollapseIcon,
} from "@mui/icons-material"

const URLInputCard = ({ url, index, onChange, errors, disabled }) => {
  const handleExpandToggle = () => {
    onChange(url.id, "expanded", !url.expanded)
  }

  return (
    <Card 
      elevation={0} 
      sx={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': { borderColor: '#1976d2' }
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600, 
              color: '#666',
              flexGrow: 1 
            }}
          >
            URL {index + 1}
          </Typography>
          <Tooltip title={url.expanded ? "Collapse" : "Expand"}>
            <IconButton 
              size="small" 
              onClick={handleExpandToggle}
              disabled={disabled}
            >
              {url.expanded ? <CollapseIcon /> : <ExpandIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        <TextField
          fullWidth
          label="Long URL"
          placeholder="https://example.com/very-long-url"
          value={url.longURL}
          onChange={(e) => onChange(url.id, "longURL", e.target.value)}
          error={!!errors[`${url.id}-longURL`]}
          helperText={errors[`${url.id}-longURL`] || "Enter the URL you want to shorten"}
          disabled={disabled}
          sx={{ mb: 2 }}
        />

        <Collapse in={url.expanded}>
          <Box sx={{ mt: 2, space: 2 }}>
            <TextField
              fullWidth
              label="Custom Shortcode (optional)"
              placeholder="my-custom-code"
              value={url.shortcode}
              onChange={(e) => onChange(url.id, "shortcode", e.target.value)}
              disabled={disabled}
              sx={{ mb: 2 }}
              helperText="Leave empty for auto-generated code"
            />
            
            <TextField
              fullWidth
              label="Expiry Time (minutes)"
              placeholder="30"
              type="number"
              value={url.expiry}
              onChange={(e) => onChange(url.id, "expiry", e.target.value)}
              error={!!errors[`${url.id}-expiry`]}
              helperText={errors[`${url.id}-expiry`] || "Leave empty for default 30 minutes"}
              disabled={disabled}
              inputProps={{ min: 1 }}
            />
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  )
}

export default URLInputCard 