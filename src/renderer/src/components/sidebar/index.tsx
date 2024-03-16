import './sidebar.less'

import { NavLink } from 'react-router-dom'

import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined'
import Stack from '@mui/material/Stack'

function Sidebar(): JSX.Element {
  return (
    <Stack direction="column" className="app-sidebar">
      <NavLink to="/rules" className="sidebar-link">
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
          className="sidebar-item"
        >
          <DashboardOutlinedIcon />
          <span className="sidebar-item-text">API Rules</span>
        </Stack>
      </NavLink>
      <NavLink to="/network" className="sidebar-link">
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
          className="sidebar-item"
        >
          <SpeedOutlinedIcon />
          <span className="sidebar-item-text">Network</span>
        </Stack>
      </NavLink>
      <NavLink to="/settings" className="sidebar-link">
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
          className="sidebar-item"
        >
          <SettingsOutlinedIcon />
          <span className="sidebar-item-text">Settings</span>
        </Stack>
      </NavLink>
    </Stack>
  )
}

export default Sidebar
