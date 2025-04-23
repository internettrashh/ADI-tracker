import { useState, useEffect } from "react"
import { Github, GitCommit } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CommitFeed } from "@/components/commit-feed"
import { EnergyBar } from "@/components/energy-bar"
import { GitHubConnectButton } from "@/components/github-connect-button"
import { StatsCards } from "@/components/stats-cards"
import { LeaderBoard } from "@/components/leader-board"

const MatrixBackground = () => {
  useEffect(() => {
    const canvas = document.getElementById('matrix-bg') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix characters
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*";
    const charSize = 20;
    const columns = canvas.width / charSize;
    const drops: number[] = [];

    // Initialize drops
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const draw = () => {
      // Semi-transparent white to create fade effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text color - very dark for maximum visibility in light theme
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'; // Very high opacity
      ctx.font = `bold ${charSize}px "Courier New", monospace`; // Larger, bolder font

      // Draw characters
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];

        // Add shadow for extra visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 2;
        ctx.fillText(text, i * charSize, drops[i] * charSize);
        ctx.shadowBlur = 0;

        // Reset drop when it reaches bottom or randomly
        if (drops[i] * charSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    // Animation loop with slower speed for better visibility
    const interval = setInterval(draw, 80);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      id="matrix-bg"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

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
      className="grid-bg flex min-h-screen w-full flex-col bg-background p-8 relative overflow-hidden"
    >
      {/* Matrix Background */}
      <MatrixBackground />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="absolute top-8 z-20  left-1/2 !translate-x-[-66%]"
      >
        <img
          src="/ai.png"
          alt="Arweave India"
          className="h-12 w-auto opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="flex flex-1 items-stretch gap-8 relative z-10">
        {/* Left Side - Stats and Activity */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex w-80 flex-col gap-8"
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="retro-panel border-primary/20 backdrop-blur-md bg-background/90 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all">
              <CardHeader className="p-5">
                <CardTitle className="retro-glow text-sm tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">SYSTEM STATS</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <StatsCards />
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity - Full height */}
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex-1"
          >
            <Card className="retro-panel border-primary/20 h-full flex flex-col backdrop-blur-md bg-background/90 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all">
              <CardHeader className="p-4 flex-none border-b border-primary/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="retro-glow text-sm tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">RECENT ACTIVITY</CardTitle>
                  <div className="flex items-center gap-1.5 text-xs text-primary/70">
                    <GitCommit className="h-3 w-3" />
                    COMMITS
                  </div>
                </div>
              </CardHeader>
              <CardContent
                className="flex-1 overflow-hidden p-0 relative"
              >
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background/90 to-transparent pointer-events-none z-10" />
                <div className="h-full overflow-y-auto scrollbar-thin scrollbar-track-background/40 scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/30">
                  <div className="px-4 space-y-1">
                    <CommitFeed />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Center - Energy Meter */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mx-auto w-full max-w-3xl flex flex-col gap-6"
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="my-auto"
          >
            <Card className="retro-panel border-primary/20 backdrop-blur-md bg-background/90 shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all overflow-hidden">
              <CardHeader className="text-center p-8 pb-4">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                >
                  <CardTitle className="retro-glow text-5xl tracking-widest mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-primary/70 font-bold">HACKERHOUSE ENERGY</CardTitle>
                  <CardDescription className="text-primary/70 text-xl font-medium">Hacker Performance Monitor</CardDescription>
                </motion.div>
              </CardHeader>
              <CardContent className="p-8 pt-2">
                <div className="relative">
                  <EnergyBar />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* GitHub Connection Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex justify-center"
          >
            <AnimatePresence mode="wait">
              {!isConnected ? (
                <motion.div
                  key="connect"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <GitHubConnectButton onConnect={handleConnect} />
                </motion.div>
              ) : (
                <motion.div
                  key="connected"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Button variant="outline" size="default" className="gap-2 border-primary/50 bg-background/90 backdrop-blur-md hover:bg-background/80 transition-colors">
                    <Github className="h-5 w-5" />
                    Connected to GitHub
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
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
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="h-full"
          >
            <Card className="retro-panel border-primary/20 h-full flex flex-col backdrop-blur-md bg-background/90 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all">
              <CardHeader className="p-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="retro-glow text-sm tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">TOP HACKERS</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto p-5 scrollbar-thin scrollbar-track-background/40 scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/30">
                <LeaderBoard />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}