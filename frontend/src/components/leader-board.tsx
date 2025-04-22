import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"

interface LeaderboardUser {
  username: string
  totalCommits: number
  avatarUrl?: string
}

export function LeaderBoard() {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/leaderboard', {
          credentials: 'include'
        })
        const data = await response.json()
        setLeaders(data.slice(0, 7)) // Only take top 7
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
        setLeaders([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
    // Add 5-second polling
    const interval = setInterval(fetchLeaderboard, 5000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-muted-foreground">Loading leaderboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {leaders.map((user, index) => (
        <div
          key={user.username}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-semibold">
              {index + 1}
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback>
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="font-medium">{user.username}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{user.totalCommits}</span>
            <span className="text-sm text-muted-foreground">commits</span>
          </div>
        </div>
      ))}
    </div>
  )
} 