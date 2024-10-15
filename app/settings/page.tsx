import SettingsPage from '@/components/setting'
import { SessionProvider } from 'next-auth/react'
import React from 'react'

const settings = () => {
  return (
    <SessionProvider>
    <SettingsPage />
    </SessionProvider>
  )
}

export default settings