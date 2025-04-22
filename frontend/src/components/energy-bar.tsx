"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"

interface CommitStats {
  totalCommits: number
  goal: number
}

export function EnergyBar() {
  const [stats, setStats] = useState<CommitStats>({ totalCommits: 0, goal: 300 })
  const [isLoading, setIsLoading] = useState(true)
  const prevCommitsRef = useRef(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio('/commit-sound.wav')
    audioRef.current.volume = 0.5 // Set volume to 50%
  }, [])

  useEffect(() => {
    const fetchCommitStats = async () => {
      try {
        const response = await fetch('https://vmi1968527.contaboserver.net/api/user/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }
        const data = await response.json()

        // Play sound if commits increased
        if (data.totalCommits > prevCommitsRef.current && prevCommitsRef.current !== 0) {
          audioRef.current?.play().catch(console.error)
        }

        prevCommitsRef.current = data.totalCommits

        setStats({
          totalCommits: data.totalCommits || 0,
          goal: 300
        })
      } catch (error) {
        console.error('Error fetching commit stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCommitStats()
    // Update every 5 seconds
    const interval = setInterval(fetchCommitStats, 5000)
    return () => clearInterval(interval)
  }, [])

  // Calculate percentage towards goal
  const percentageOfGoal = Math.min(100, (stats.totalCommits / stats.goal) * 100)

  if (isLoading) {
    return (
      <div className="relative flex aspect-video flex-col items-center justify-center opacity-50">
        <div className="text-primary/70">Loading commit data...</div>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col items-center justify-center p-8">
      {/* Main Stats Display */}
      <div className="absolute left-0 top-0 text-[12rem] font-bold text-primary/5 select-none pointer-events-none z-0">
        {stats.totalCommits}
      </div>

      {/* Goal Progress */}
      <div className="absolute top-4 right-4 text-right">
        <div className="text-6xl font-bold text-primary">
          {Math.round(percentageOfGoal)}%
        </div>
        <div className="text-sm text-primary/70 uppercase tracking-[0.2em]">
          Goal Reached
        </div>
      </div>

      {/* Bar Chart */}
      <div className="relative w-full h-48 mt-24 ml-4">
        {/* Graph Background */}
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-[1px]">
          {Array.from({ length: 84 }).map((_, i) => (
            <div
              key={i}
              className="bg-primary/5 border-[0.5px] border-primary/10"
            />
          ))}
        </div>

        {/* Vertical Lines */}
        <div className="absolute inset-0 flex justify-between">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-full w-[1px] bg-primary/10"
            />
          ))}
        </div>

        {/* Horizontal Lines with Labels */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = Math.round((4 - i) * (stats.goal / 4));
            return (
              <div key={i} className="relative w-full ml-auto text-right">
                <div className="absolute -left-8 text-xs text-primary/40 font-mono">
                  {value}
                </div>
                <div className="w-full h-[1px] bg-primary/10" />
              </div>
            );
          })}
        </div>

        {/* Goal Line */}
        <div className="absolute top-0 left-0 w-full border-t-2 border-dashed border-primary/30" />
        <div className="absolute -top-6 left-0 text-sm text-primary/70 uppercase tracking-[0.2em]">
          Goal: {stats.goal}
        </div>

        {/* Commit Bar */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${percentageOfGoal}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 bg-gradient-to-t from-primary/50 to-primary/20 backdrop-blur-sm rounded-t-lg"
          style={{ zIndex: 10 }}
        >
          {/* Glow Effect */}
          <div className="absolute -inset-[2px] bg-primary/20 blur-lg rounded-t-lg" />

          {/* Commit Count */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-center w-full">
            <div className="text-2xl font-bold text-primary">
              {stats.totalCommits}
            </div>
            <div className="text-sm text-primary/70 uppercase tracking-[0.2em] mt-2">
              Total Commits
            </div>
          </div>

          {/* Bar Highlight */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0)_0%,rgba(255,255,255,0.1)_50%,rgba(0,0,0,0)_100%)]" />
        </motion.div>

        {/* Bottom Label */}
        {/* <div className="absolute -bottom-6 -left-16 text-xs text-primary/40 font-mono">
          0
        </div> */}
      </div>
    </div>
  )
}
