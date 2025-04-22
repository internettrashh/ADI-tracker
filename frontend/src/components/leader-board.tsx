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
        const response = await fetch('https://vmi1968527.contaboserver.net/api/leaderboard')
        const data = await response.json()
        // Show more hackers with compact layout
        setLeaders(data.slice(0, 8))
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
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between border-b border-primary/20 pb-2 last:border-0 animate-pulse">
            <div className="flex items-center gap-2">
              <div className="font-mono text-sm font-bold text-primary/20">#{i}</div>
              <div className="h-6 w-6 rounded-full bg-primary/20" />
              <div className="h-3 w-20 bg-primary/20 rounded" />
            </div>
            <div className="h-3 w-12 bg-primary/20 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {leaders.map((user, index) => (
        <div
          key={user.username}
          className="flex items-center justify-between border-b border-primary/20 pb-2 last:border-0"
        >
          <div className="flex items-center gap-2">
            <div className="font-mono text-sm font-bold text-primary/70 w-4">
              #{index + 1}
            </div>
            <Avatar className="h-6 w-6 border border-primary/30">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="text-xs">{user.username[0]}</AvatarFallback>
            </Avatar>
            <div className="font-mono text-xs tracking-wider text-primary truncate">
              {user.username}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="font-mono text-xs text-primary/70">COMMITS</div>
            <div className="font-mono text-sm font-bold tracking-wider text-primary retro-glow min-w-[2ch] text-right">
              {user.totalCommits}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 