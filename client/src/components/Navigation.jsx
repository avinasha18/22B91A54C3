import { useNavigate, useLocation } from "react-router-dom"
import { Tabs, Tab, Box } from "@mui/material"
import { Link as LinkIcon, BarChart as BarChartIcon } from "@mui/icons-material"

const Navigation = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const currentTab = location.pathname === "/" ? 0 : 1

  const handleTabChange = (event, newValue) => {
    if (newValue === 0) {
      navigate("/")
    } else {
      navigate("/statistics")
    }
  }

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Tabs value={currentTab} onChange={handleTabChange} textColor="inherit" indicatorColor="secondary">
        <Tab
          icon={<LinkIcon />}
          label="Shorten URL"
          iconPosition="start"
          sx={{ color: "white", "&.Mui-selected": { color: "white" } }}
        />
        <Tab
          icon={<BarChartIcon />}
          label="Statistics"
          iconPosition="start"
          sx={{ color: "white", "&.Mui-selected": { color: "white" } }}
        />
      </Tabs>
    </Box>
  )
}

export default Navigation
