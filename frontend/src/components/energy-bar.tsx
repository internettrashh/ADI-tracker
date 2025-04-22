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
    // Update to 5 seconds
    const interval = setInterval(fetchCommitStats, 5000)
    return () => clearInterval(interval)
  }, [])

  // Calculate percentage towards goal
  const percentage = Math.min(100, (stats.totalCommits / stats.goal) * 100)
  
  // Determine color based on progress
  const getProgressColor = () => {
    if (percentage < 30) return "bg-red-500"
    if (percentage < 70) return "bg-yellow-500"
    return "bg-green-500"
  }

  // Calculate remaining commits
  const remainingCommits = Math.max(0, stats.goal - stats.totalCommits)

  if (isLoading) {
    return (
      <div className="flex h-full flex-col justify-between gap-4">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold">{stats.totalCommits}</div>
        <div className="text-sm text-muted-foreground">
          Goal: {stats.goal}
        </div>
      </div>

      <div className="relative h-64 w-full bg-muted rounded-lg overflow-hidden">
        <div
          className={`absolute bottom-0 w-full transition-all duration-1000 ${getProgressColor()}`}
          style={{ height: `${percentage}%` }}
        ></div>

        {/* Level markers */}
        <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none">
          <div className="border-t border-dashed border-foreground/20 pt-1">
            <span className="text-xs text-foreground/50">300</span>
          </div>
          <div className="border-t border-dashed border-foreground/20 pt-1">
            <span className="text-xs text-foreground/50">225</span>
          </div>
          <div className="border-t border-dashed border-foreground/20 pt-1">
            <span className="text-xs text-foreground/50">150</span>
          </div>
          <div className="border-t border-dashed border-foreground/20 pt-1">
            <span className="text-xs text-foreground/50">75</span>
          </div>
          <div className="border-t border-dashed border-foreground/20 pt-1">
            <span className="text-xs text-foreground/50">0</span>
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {remainingCommits === 0 ? (
          <span className="text-green-500 font-medium">Goal achieved! 🎉</span>
        ) : (
          `${remainingCommits} commits to reach goal`
        )}
      </div>
    </div>
  )
}
