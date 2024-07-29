import './sidebar.less'

import { Menu } from 'antd'
import { useNavigate } from 'react-router-dom'

import {
  AppstoreOutlined,
  FundProjectionScreenOutlined,
  RadarChartOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { strings } from '@renderer/services/localization'
import { useSettingStore } from '@renderer/store/setting'

import type { MenuProps } from 'antd'
type MenuItem = Required<MenuProps>['items'][number]

function Sidebar(): JSX.Element {
  const navigate = useNavigate()
  // Reset component language when setting language changes
  const { language } = useSettingStore((state) => state)
  const onClick = (e: any) => {
    navigate('/' + e.key)
  }
  const items: MenuItem[] = [
    {
      key: 'rules/list',
      icon: <AppstoreOutlined style={{ fontSize: '18px' }} />,
      label: strings.apiRules
    },
    {
      key: 'network',
      icon: <RadarChartOutlined style={{ fontSize: '18px' }} />,
      label: strings.network
    },
    {
      key: 'testScripts',
      icon: <FundProjectionScreenOutlined style={{ fontSize: '18px' }} />,
      label: strings.test
    },
    {
      key: 'settings',
      icon: <SettingOutlined style={{ fontSize: '18px' }} />,
      label: strings.settings
    }
  ]
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
