import Dashboard from "./components/dashboard";
import { ThemeProvider } from "./components/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background text-foreground">
        <Dashboard />
      </div>
    </ThemeProvider>
  );
}

export default App;
