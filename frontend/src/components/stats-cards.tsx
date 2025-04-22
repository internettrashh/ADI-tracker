import { useEffect, useState } from "react"
import { GitCommit, GitFork, GitBranch } from "lucide-react"
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
        const response = await fetch('http://vmi1968527.contaboserver.net/api/user/stats')
        
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
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Hackers</CardTitle>
          <GitFork className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalHackers}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Commits</CardTitle>
          <GitCommit className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalCommits}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          <GitBranch className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalProjects}</div>
        </CardContent>
      </Card>
    </div>
  )
}