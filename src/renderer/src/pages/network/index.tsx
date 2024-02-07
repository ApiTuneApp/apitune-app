import '@glideapps/glide-data-grid/dist/index.css'
import './network.less'

import { Box } from '@mui/material'
import { DataEditor, GridCell, GridCellKind, GridColumn, Item } from '@glideapps/glide-data-grid'
import { useCallback } from 'react'

function NetworkPage(): JSX.Element {
  // If fetching data is slow you can use the DataEditor ref to send updates for cells
  // once data is loaded.
  const getContent = useCallback((cell: Item): GridCell => {
    const [col, row] = cell
    const dataRow = data[row]
    // dumb but simple way to do this
    const indexes = ['name', 'company', 'email', 'phone']
    const d = dataRow[indexes[col]]
    return {
      kind: GridCellKind.Text,
      allowOverlay: false,
      displayData: d,
      data: d
    }
  }, [])
  const data = [
    {
      name: 'Hines Fowler',
      company: 'BUZZNESS',
      email: 'hinesfowler@buzzness.com',
      phone: '+1 (869) 405-3127'
    },
    {
      name: 'Hines Fowler',
      company: 'BUZZNESS',
      email: 'hinesfowler@buzzness.com',
      phone: '+1 (869) 405-3127'
    },
    {
      name: 'Hines Fowler',
      company: 'BUZZNESS',
      email: 'hinesfowler@buzzness.com',
      phone: '+1 (869) 405-3127'
    },
    {
      name: 'Hines Fowler',
      company: 'BUZZNESS',
      email: 'hinesfowler@buzzness.com',
      phone: '+1 (869) 405-3127'
    },
    {
      name: 'Hines Fowler',
      company: 'BUZZNESS',
      email: 'hinesfowler@buzzness.com',
      phone: '+1 (869) 405-3127'
    }
  ]
  // Grid columns may also provide icon, overlayIcon, menu, style, and theme overrides
  const columns: GridColumn[] = [
    {
      title: 'Name',
      id: 'name'
    },
    {
      title: 'Company',
      id: 'company'
    },
    {
      title: 'Email',
      id: 'email'
    },
    {
      title: 'Phone',
      id: 'phone'
    }
  ]

  return (
    <Box className="app-page page-network">
      <h2>network</h2>
      <DataEditor
        className="network-table"
        theme={{
          bgCell: '#222222',
          bgHeader: '#222222',
          fgIconHeader: '#282828',
          bgHeaderHasFocus: 'rgba(235, 235, 245, 0.38)',
          textHeader: 'rgba(255, 255, 245, 0.86)',
          textDark: 'rgba(255, 255, 245, 0.86)'
        }}
        getCellContent={getContent}
        columns={columns}
        rows={data.length}
      />
    </Box>
  )
}

export default NetworkPage
