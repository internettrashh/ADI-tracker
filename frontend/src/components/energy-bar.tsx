"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface CommitStats {
  totalCommits: number
  goal: number
}

export function EnergyBar() {
  const [stats, setStats] = useState<CommitStats>({ totalCommits: 0, goal: 300 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCommitStats = async () => {
      try {
        const response = await fetch('https://vmi1968527.contaboserver.net/api/user/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }
        const data = await response.json()
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
      <div className="relative w-full h-48 mt-24">
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
        >
          {/* Glow Effect */}
          <div className="absolute -inset-[2px] bg-primary/20 blur-lg rounded-t-lg" />

          {/* Commit Count */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.totalCommits}
            </div>
            <div className="text-sm text-primary/70 uppercase tracking-[0.2em]">
              Total Commits
            </div>
          </div>
        </motion.div>

        {/* Bottom Label */}
        <div className="absolute -bottom-6 left-0 text-sm text-primary/70 uppercase tracking-[0.2em]">
          0
        </div>
      </div>
    </div>
  )
}
