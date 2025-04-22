import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"

interface Commit {
  id: string
  message: string
  author: string
  repo: string
  time: string
  avatarUrl?: string
}

export function CommitFeed() {
  const [commits, setCommits] = useState<Commit[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        const response = await fetch('https://vmi1968527.contaboserver.net/api/recent-commits', {
          credentials: 'include'
        })
        const data = await response.json()
        setCommits(data)
      } catch (error) {
        console.error('Error fetching commits:', error)
        setCommits([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCommits()

    // Set up polling to refresh commits every 5 seconds
    const interval = setInterval(fetchCommits, 5000)
    return () => clearInterval(interval)
  }, [])

  const getTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000)

    if (seconds < 60) return `${seconds} seconds ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    const days = Math.floor(hours / 24)
    return `${days} day${days !== 1 ? 's' : ''} ago`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (commits.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
        No commits yet
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {commits.map((commit) => (
        <div key={commit.id} className="flex items-start gap-4 rounded-lg border p-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={commit.avatarUrl} alt={commit.author} />
            <AvatarFallback>
              {commit.author.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="font-medium leading-none">{commit.message}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{commit.author}</span>
              <span>•</span>
              <span className="font-medium text-foreground">{commit.repo}</span>
              <span>•</span>
              <span>{getTimeAgo(commit.time)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
