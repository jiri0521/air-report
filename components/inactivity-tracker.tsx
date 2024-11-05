'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from "@/hooks/use-toast"
import { CountdownDialog } from './countdown-dialog'


const INACTIVITY_TIMEOUT = 40000 // 40 seconds in milliseconds
const COUNTDOWN_DURATION = 20 // 20 seconds countdown

export function InactivityTracker() {
  const { data: session } = useSession()
  const router = useRouter()
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [showCountdown, setShowCountdown] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION)

  useEffect(() => {
    if (!session) return

    const resetTimer = () => {
      setLastActivity(Date.now())
      setShowCountdown(false)
      setCountdown(COUNTDOWN_DURATION)
    }

    // Add event listeners for user activity
    window.addEventListener('mousemove', resetTimer)
    window.addEventListener('keydown', resetTimer)
    window.addEventListener('click', resetTimer)
    window.addEventListener('scroll', resetTimer)

    const checkInactivity = setInterval(() => {
      const now = Date.now()
      const inactiveTime = now - lastActivity

      if (inactiveTime > INACTIVITY_TIMEOUT && !showCountdown) {
        setShowCountdown(true)
      }

      if (showCountdown) {
        setCountdown(prev => {
          if (prev <= 1) {
            handleLogout()
            return 0
          }
          return prev - 1
        })
      }
    }, 1000) // Check every second

    return () => {
      // Clean up event listeners and interval
      window.removeEventListener('mousemove', resetTimer)
      window.removeEventListener('keydown', resetTimer)
      window.removeEventListener('click', resetTimer)
      window.removeEventListener('scroll', resetTimer)
      clearInterval(checkInactivity)
    }
  }, [session, lastActivity, showCountdown])

  const handleLogout = async () => {
    await signOut({ redirect: false })
    toast({
      title: "セッション終了",
      description: "一定時間の無操作によりログアウトしました。",
      variant: "default",
    })
    router.push('/login')
  }

  return (
    <CountdownDialog
      isOpen={showCountdown}
      onClose={() => setShowCountdown(false)}
      countdown={countdown}
    />
  )
}