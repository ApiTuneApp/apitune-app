import './sidebar.less'

import { Menu } from 'antd'
import { useNavigate } from 'react-router-dom'

import {
  AppstoreOutlined,
  FundProjectionScreenOutlined,
  RadarChartOutlined,
  SettingOutlined
} from '@ant-design/icons'

import type { MenuProps } from 'antd'
type MenuItem = Required<MenuProps>['items'][number]

const items: MenuItem[] = [
  {
    key: 'rules/list',
    icon: <AppstoreOutlined style={{ fontSize: '18px' }} />,
    label: 'API Rules'
  },
  {
    key: 'network',
    icon: <RadarChartOutlined style={{ fontSize: '18px' }} />,
    label: 'Network'
  },
  {
    key: 'testScripts',
    icon: <FundProjectionScreenOutlined style={{ fontSize: '18px' }} />,
    label: 'Test'
  },
  {
    key: 'settings',
    icon: <SettingOutlined style={{ fontSize: '18px' }} />,
    label: 'Settings'
  }
]

function Sidebar(): JSX.Element {
  const navigate = useNavigate()
  const onClick = (e: any) => {
    navigate('/' + e.key)
  }
  return (
    <Menu
      className="sidebar-menu"
      onClick={onClick}
      defaultSelectedKeys={['1']}
      defaultOpenKeys={['sub1']}
      mode="vertical"
      items={items}
    />
  )
}

export default Sidebar
