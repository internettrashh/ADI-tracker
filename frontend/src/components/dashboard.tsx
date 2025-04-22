import { useState } from "react"
import { Github, GitCommit } from "lucide-react"
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
    <div className="grid-bg flex min-h-screen w-full flex-col bg-background p-6">
      {/* GitHub Connection Button - Top Right */}
      <div className="absolute right-6">
        {!isConnected ? (
          <GitHubConnectButton onConnect={handleConnect} />
        ) : (
          <Button variant="outline" size="sm" className="gap-2 border-primary/50">
            <Github className="h-4 w-4" />
            Synced
          </Button>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="flex flex-1 items-stretch">
        {/* Left Side - Stats and Activity */}
        <div className="flex w-72 flex-col gap-6">
          <Card className="retro-panel border-primary/30">
            <CardHeader className="p-4">
              <CardTitle className="retro-glow text-sm tracking-wider">SYSTEM STATS</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <StatsCards />
            </CardContent>
          </Card>

          {/* Recent Activity - Full height */}
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
        </div>

        {/* Center - Energy Meter */}
        <div className="mx-auto w-full max-w-3xl px-6 my-auto">
          <Card className="retro-panel border-primary/30">
            <CardHeader className="text-center p-4">
              <CardTitle className="retro-glow text-2xl tracking-widest">COMMIT ENERGY</CardTitle>
              <CardDescription className="text-primary/70">System Performance Monitor</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <EnergyBar />
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Top Hackers - Full height */}
        <div className="w-96">
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
        </div>
      </div>
    </div>
  )
}