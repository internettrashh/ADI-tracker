import { useEffect, useState } from "react"
import { GitCommit, GitFork, GitBranch, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"

interface StatsData {
  totalCommits: number
  totalProjects: number
  totalHackers: number
}

export function StatsCards() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [prevStats, setPrevStats] = useState<StatsData | null>(null)
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
        console.log('Fetched stats:', data)

        setPrevStats(stats)
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

  const AnimatedNumber = ({ value, prevValue, icon: Icon, label }: { value: number, prevValue: number | null, icon: any, label: string }) => {
    const isNew = prevValue !== null && value !== prevValue
    const isIncrease = prevValue !== null && value > prevValue

    return (
      <motion.div
        key={value}
        initial={isNew ? { y: -20, opacity: 0 } : false}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="relative flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <motion.div
            initial={isNew ? { scale: 0 } : false}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="p-2 rounded-md bg-primary/10 group-hover:bg-primary/15 transition-colors"
          >
            <Icon className="h-4 w-4 text-primary" />
          </motion.div>
          <div>
            <div className="text-xs uppercase text-primary/70 group-hover:text-primary/80 transition-colors">{label}</div>
            <div className="font-mono text-xl font-bold tracking-wider text-primary retro-glow">
              {value.toLocaleString()}
            </div>
          </div>
        </div>
        {isNew && isIncrease && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -right-1 -top-1 text-xs font-bold text-green-500"
          >
            ↑
          </motion.div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="grid gap-6">
      <motion.div
        className="group"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <AnimatePresence mode="wait">
          <AnimatedNumber
            value={stats?.totalHackers || 0}
            prevValue={prevStats?.totalHackers}
            icon={Users}
            label="Active Hackers"
          />
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="group"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <AnimatePresence mode="wait">
          <AnimatedNumber
            value={stats?.totalCommits || 0}
            prevValue={prevStats?.totalCommits}
            icon={GitCommit}
            label="Total Commits"
          />
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="group"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <AnimatePresence mode="wait">
          <AnimatedNumber
            value={stats?.totalProjects || 0}
            prevValue={prevStats?.totalProjects}
            icon={GitFork}
            label="Active Projects"
          />
        </AnimatePresence>
      </motion.div>
    </div>
  )
}