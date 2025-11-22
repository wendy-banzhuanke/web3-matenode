"use client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useEffect, useState } from "react"

export default function AutoDismissAlert({ content, status }: { content: string|null, status: 'success'|'error' }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <Alert variant="default" className="w-100 h-20 flex items-center justify-center">
        {status === 'success' ? (
            <AlertDescription className=" text-green-700 font-bold">{content}</AlertDescription>
        ) : (
            <AlertDescription className=" text-red-700 font-bold">{content}</AlertDescription>
        )}
    </Alert>
  )
}
