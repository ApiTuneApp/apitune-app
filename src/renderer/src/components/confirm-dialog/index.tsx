import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'

interface ConfirmDialogProps {
  title: string
  content?: string | JSX.Element
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

function ConfirmDialog(props: ConfirmDialogProps) {
  const { title, content, open, onClose, onConfirm } = props
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      {content && <DialogContent>{content}</DialogContent>}
      <DialogActions>
        <Button size="small" onClick={onClose}>
          Cancel
        </Button>
        <Button size="small" variant="contained" onClick={onConfirm}>
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDialog
