import { useEffect, useState } from "react"

export function CommitHeatmap() {
  const [heatmapData, setHeatmapData] = useState<number[][]>([])

  useEffect(() => {
    // Generate random heatmap data for demonstration
    const generateHeatmapData = () => {
      const weeks = 52
      const days = 7
      const data: number[][] = []

      for (let i = 0; i < weeks; i++) {
        const weekData: number[] = []
        for (let j = 0; j < days; j++) {
          // Generate random commit count (0-10)
          const commitCount = Math.floor(Math.random() * 11)
          weekData.push(commitCount)
        }
        data.push(weekData)
      }

      return data
    }

    setHeatmapData(generateHeatmapData())
  }, [])

  // Function to determine cell color based on commit count
  const getCellColor = (count: number) => {
    if (count === 0) return "bg-muted"
    if (count < 3) return "bg-emerald-100 dark:bg-emerald-900"
    if (count < 6) return "bg-emerald-300 dark:bg-emerald-700"
    if (count < 9) return "bg-emerald-500 dark:bg-emerald-500"
    return "bg-emerald-700 dark:bg-emerald-300"
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const days = ["", "Mon", "", "Wed", "", "Fri", ""]

  return (
    <div className="w-full overflow-auto">
      <div className="flex flex-col gap-2">
        <div className="flex text-xs text-muted-foreground">
          <div className="w-8"></div>
          <div className="flex justify-between w-full px-1">
            {months.map((month, i) => (
              <div key={i} className="flex-1 text-center">
                {month}
              </div>
            ))}
          </div>
        </div>
        <div className="flex">
          <div className="flex flex-col justify-between pr-2 text-xs text-muted-foreground">
            {days.map((day, i) => (
              <div key={i} className="h-[17px]">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-flow-col gap-[3px]">
            {heatmapData.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-flow-row gap-[3px]">
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`h-[15px] w-[15px] rounded-sm ${getCellColor(day)}`}
                    title={`${day} commits on ${days[dayIndex] || "Sun"}`}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground mt-2">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="h-[10px] w-[10px] rounded-sm bg-muted"></div>
            <div className="h-[10px] w-[10px] rounded-sm bg-emerald-100 dark:bg-emerald-900"></div>
            <div className="h-[10px] w-[10px] rounded-sm bg-emerald-300 dark:bg-emerald-700"></div>
            <div className="h-[10px] w-[10px] rounded-sm bg-emerald-500"></div>
            <div className="h-[10px] w-[10px] rounded-sm bg-emerald-700 dark:bg-emerald-300"></div>
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
