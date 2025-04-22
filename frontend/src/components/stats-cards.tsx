import { useEffect, useState } from "react"
import { GitCommit, GitFork, GitBranch, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsData {
  totalCommits: number
  totalProjects: number
  totalHackers: number
}

export function StatsCards() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('https://vmi1968527.contaboserver.net/api/user/stats')

        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }

        const data = await response.json()
        console.log('Fetched stats:', data) // Debug log

        setStats({
          totalCommits: data.totalCommits,
          totalProjects: data.totalProjects,
          totalHackers: data.totalHackers
        })
        setError(null)
      } catch (error) {
        console.error('Error fetching stats:', error)
        setError('Failed to load stats')
        setStats({
          totalCommits: 0,
          totalProjects: 0,
          totalHackers: 0
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
    // Add 5-second polling
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 text-sm">
      <div className="flex items-center justify-between border-b border-primary/20 pb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-xs uppercase text-primary/70">Active Hackers</span>
        </div>
        <div className="font-mono text-lg font-bold tracking-wider text-primary retro-glow">
          {stats?.totalHackers}
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-primary/20 pb-3">
        <div className="flex items-center gap-2">
          <GitCommit className="h-4 w-4 text-primary" />
          <span className="text-xs uppercase text-primary/70">Total Commits</span>
        </div>
        <div className="font-mono text-lg font-bold tracking-wider text-primary retro-glow">
          {stats?.totalCommits}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitFork className="h-4 w-4 text-primary" />
          <span className="text-xs uppercase text-primary/70">Active Projects</span>
        </div>
        <div className="font-mono text-lg font-bold tracking-wider text-primary retro-glow">
          {stats?.totalProjects}
        </div>
      </div>
    </div>
  )
}