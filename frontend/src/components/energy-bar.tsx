"use client"

import { useEffect, useState } from "react"

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

  // Calculate the rotation for the needle (from -120 to 120 degrees)
  const rotation = -120 + (percentageOfGoal / 100) * 240

  if (isLoading) {
    return (
      <div className="relative flex aspect-video flex-col items-center justify-center opacity-50">
        <div className="text-primary/70">Loading commit data...</div>
      </div>
    )
  }

  return (
    <div className="relative flex aspect-video flex-col items-center justify-center p-8">
      {/* Header */}

      {/* Right Side - % of Goal */}
      <div className="absolute right-12 top-0 text-center">
        <div className="text-6xl font-bold tracking-wider">
          {Math.round(percentageOfGoal)}%
        </div>
        <div className="text-sm text-primary/60 tracking-wider mb-1">GOAL REACHED</div>
      </div>

      {/* Center - Total Commits */}
      <div className="relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
          <div className="text-[8rem] font-bold tracking-wider">
            {stats.totalCommits}
          </div>
          <div className="text-sm text-primary/60 tracking-[0.2em] mt-4">TOTAL COMMITS</div>
        </div>
      </div>

      {/* Bottom Left - Goal */}
      <div className="absolute bottom-12 left-12">
        <div className="text-sm text-primary/60 tracking-wider mb-1">GOAL</div>
        <div className="text-6xl font-bold tracking-wider">
          {stats.goal}
        </div>
      </div>
    </div>
  )
}
