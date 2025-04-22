import { useState } from "react"
import { Github, GitCommit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <GitCommit className="h-6 w-6" />
          <span className="text-lg font-semibold">DevPulse</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          {!isConnected ? (
            <GitHubConnectButton onConnect={handleConnect} />
          ) : (
            <Button variant="outline" size="sm" className="gap-2">
              <Github className="h-4 w-4" />
              Synced
            </Button>
          )}
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <StatsCards />
        <Tabs defaultValue="overview" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Top Hackers</CardTitle>
                  <CardDescription>Leaderboard by commit count</CardDescription>
                </CardHeader>
                <CardContent>
                  <LeaderBoard />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Commit Energy</CardTitle>
                
                </CardHeader>
                <CardContent>
                  <EnergyBar />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader className="flex flex-row items-center">
                  <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Recent commits across all repositories</CardDescription>
                  </div>
                  <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <GitCommit className="h-4 w-4" />
                      Commits
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CommitFeed />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}