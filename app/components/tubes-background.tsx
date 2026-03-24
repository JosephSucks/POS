'use client'

import React, { useEffect, useRef, useState } from 'react'

interface TubesBackgroundProps {
  children?: React.ReactNode
  className?: string
  enableClickInteraction?: boolean
}

export function TubesBackground({
  children,
  className = '',
  enableClickInteraction = true,
}: TubesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const tubesRef = useRef<any>(null)

  useEffect(() => {
    let mounted = true

    const initTubes = async () => {
      if (!canvasRef.current) return

      try {
        // Dynamic import from CDN
        const module = await import(
          'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js'
        )
        const TubesCursor = module.default

        if (!mounted) return

        const app = TubesCursor(canvasRef.current, {
          tubes: {
            colors: ['#f967fb', '#53bc28', '#6958d5'],
            lights: {
              intensity: 200,
              colors: ['#83f36e', '#fe8a2e', '#ff008a', '#60aed5'],
            },
          },
        })

        tubesRef.current = app
        setIsLoaded(true)
      } catch (error) {
        console.error('[v0] Failed to load TubesCursor:', error)
      }
    }

    initTubes()

    return () => {
      mounted = false
    }
  }, [])

  const handleClick = () => {
    if (!enableClickInteraction || !tubesRef.current) return

    const randomColor = () =>
      '#' + Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')

    const colors = [randomColor(), randomColor(), randomColor()]
    const lightsColors = [randomColor(), randomColor(), randomColor(), randomColor()]

    try {
      tubesRef.current.tubes?.setColors?.(colors)
      tubesRef.current.tubes?.setLightsColors?.(lightsColors)
    } catch (err) {
      console.error('[v0] Error updating tube colors:', err)
    }
  }

  return (
    <div
      className={`relative w-full h-full min-h-screen overflow-hidden bg-slate-900 ${className}`}
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
        style={{ touchAction: 'none' }}
      />

      {/* Content Overlay */}
      <div className="relative z-10 w-full h-full pointer-events-none">{children}</div>
    </div>
  )
}

export default TubesBackground
