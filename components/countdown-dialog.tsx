import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface CountdownDialogProps {
  isOpen: boolean
  onClose: () => void
  countdown: number
}

export function CountdownDialog({ isOpen, onClose, countdown }: CountdownDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>強制ログアウトまであと{countdown}秒</DialogTitle>
          <DialogDescription>
            あと{countdown}秒でログアウトします。操作を続ける場合は「継続」ボタンをクリックしてください。
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button onClick={onClose}>継続</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}