import { NavLink } from 'react-router-dom'
import { useUxStore } from '@renderer/store/ux'
import { useEffect } from 'react'

interface LogLinkProps {
  id: number
  children?: React.ReactNode
}

function LogLink({ id, children }: LogLinkProps): JSX.Element {
  const setSelectedLogId = useUxStore((state) => state.setSelectedLogId)

  useEffect(() => {
    // Cleanup selected log when component unmounts
    return () => {
      setSelectedLogId(undefined)
    }
  }, [])

  const handleClick = () => {
    setSelectedLogId(id)
  }

  return (
    <NavLink to={`/network`} onClick={handleClick}>
      {children || `#${id}`}
    </NavLink>
  )
}

export default LogLink
