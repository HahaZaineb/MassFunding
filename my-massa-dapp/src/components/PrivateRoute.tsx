import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccountStore } from '@massalabs/react-ui-kit'
import { ReactNode } from 'react'

interface PrivateRouteProps {
  children: ReactNode
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { connectedAccount } = useAccountStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!connectedAccount) {
      navigate('/')
    }
  }, [connectedAccount, navigate])

  return <>{connectedAccount && children}</>
}

export default PrivateRoute
