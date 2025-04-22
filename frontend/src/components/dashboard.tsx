import { useState } from "react"
import { Github, GitCommit } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CommitFeed } from "@/components/commit-feed"
import { EnergyBar } from "@/components/energy-bar"
import { GitHubConnectButton } from "@/components/github-connect-button"
import { StatsCards } from "@/components/stats-cards"
import { LeaderBoard } from "@/components/leader-board"

export default function Dashboard() {
  const [isConnected, setIsConnected] = useState(false)

  const handleConnect = () => {
    setIsConnected(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid-bg flex min-h-screen w-full flex-col bg-background p-6"
    >
      {/* GitHub Connection Button - Top Right */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="absolute right-6"
      >
        <AnimatePresence mode="wait">
          {!isConnected ? (
            <motion.div
              key="connect"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <GitHubConnectButton onConnect={handleConnect} />
            </motion.div>
          ) : (
            <motion.div
              key="connected"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <Button variant="outline" size="sm" className="gap-2 border-primary/50">
                <Github className="h-4 w-4" />
                Synced
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Main Content Grid */}
      <div className="flex flex-1 items-stretch">
        {/* Left Side - Stats and Activity */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex w-72 flex-col gap-6"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="retro-panel border-primary/30">
              <CardHeader className="p-4">
                <CardTitle className="retro-glow text-sm tracking-wider">SYSTEM STATS</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <StatsCards />
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity - Full height */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex-1"
          >
            <Card className="retro-panel border-primary/30 flex flex-1 flex-col">
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="retro-glow text-sm tracking-wider">RECENT ACTIVITY</CardTitle>
                  <div className="flex items-center gap-1 text-xs text-primary/70">
                    <GitCommit className="h-3 w-3" />
                    COMMITS
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto p-4 scrollbar-thin scrollbar-track-background scrollbar-thumb-primary/20">
                <CommitFeed />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Center - Energy Meter */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mx-auto w-full max-w-3xl px-6 my-auto"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="retro-panel border-primary/30">
              <CardHeader className="text-center p-4">
                <CardTitle className="retro-glow text-2xl tracking-widest">COMMIT ENERGY</CardTitle>
                <CardDescription className="text-primary/70">System Performance Monitor</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <EnergyBar />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Right Side - Top Hackers - Full height */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-96"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="h-full"
          >
            <Card className="retro-panel border-primary/30 h-full flex flex-col">
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="retro-glow text-sm tracking-wider">TOP HACKERS</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto p-4 scrollbar-thin scrollbar-track-background scrollbar-thumb-primary/20">
                <LeaderBoard />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}