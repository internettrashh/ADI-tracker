import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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
  const [prevCommits, setPrevCommits] = useState<Commit[]>([])

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        const response = await fetch('https://vmi1968527.contaboserver.net/api/recent-commits', {
        })
        const data = await response.json()
        // Show more commits since we have a more compact layout
        setPrevCommits(commits)
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

    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    return `${days}d`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  if (commits.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 text-xs text-muted-foreground">
        No commits yet
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {commits.map((commit, index) => {
          const isNew = !prevCommits.some(prev => prev.id === commit.id)
          return (
            <motion.div
              key={commit.id}
              initial={isNew ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                delay: isNew ? index * 0.1 : 0
              }}
              className="flex items-center gap-2 rounded-lg border px-2 py-1.5 mt-4"
            >
              <motion.div
                initial={isNew ? { scale: 0 } : false}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={commit.avatarUrl} alt={commit.author} />
                  <AvatarFallback className="text-xs">
                    {commit.author.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <div className="flex-1 min-w-0">
                <motion.p
                  className="font-medium truncate"
                  initial={isNew ? { x: -20, opacity: 0 } : false}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: isNew ? 0.2 : 0 }}
                >
                  {commit.message}
                </motion.p>
                <motion.div
                  className="flex items-center gap-1 text-sm text-muted-foreground"
                  initial={isNew ? { x: -20, opacity: 0 } : false}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: isNew ? 0.3 : 0 }}
                >
                  <span className="truncate">{commit.author}</span>
                  <span>•</span>
                  <span className="font-medium text-foreground truncate">{commit.repo.split("/")[1]}</span>
                  <span>•</span>
                  <span>{getTimeAgo(commit.time)}</span>
                </motion.div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
