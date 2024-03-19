import { ReactElement } from 'react'

import { Box, Typography } from '@mui/material'

type RuleOutlineProps = {
  title: string
  WrapComponent: ReactElement
}

function RuleOutline({ title, WrapComponent }: RuleOutlineProps) {
  return (
    <Box className="rule-value-item">
      <Typography variant="subtitle1" gutterBottom>
        {title}
      </Typography>
      {WrapComponent}
    </Box>
  )
}

export default RuleOutline
