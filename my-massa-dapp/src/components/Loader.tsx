"use client"
import type React from "react"
import CircularProgress from '@mui/material/CircularProgress'

export default function Loader() {
  return (<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#181f36] to-[#101626] text-white">
      <div className="relative flex flex-col items-center text-center">
        <CircularProgress
          thickness={4}
          size={64}
          style={{ color: '#00ff9d' }}
        />
      </div>
    </div>)
}
