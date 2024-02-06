import Stack from '@mui/material/Stack'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'

import './sidebar.less'

function Sidebar(): JSX.Element {
  return (
    <Stack direction="column" className="app-sidebar">
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        className="sidebar-item"
      >
        <DashboardOutlinedIcon />
        <span className="sidebar-item-text">API Rules</span>
      </Stack>
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        className="sidebar-item"
      >
        <SpeedOutlinedIcon />
        <span className="sidebar-item-text">Network</span>
      </Stack>
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        className="sidebar-item"
      >
        <SettingsOutlinedIcon />
        <span className="sidebar-item-text">Settings</span>
      </Stack>
    </Stack>
  )
}

export default Sidebar
