import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  Legend, CartesianGrid, AreaChart, Area
} from 'recharts'

export default function PaceChart({ courses = [] }) {
  const chartData = [
    { module: 'Mod 1: Arrays & Hashing', plannedPct: 100, actualPct: 100 },
    { module: 'Mod 2: Linked Lists & Stacks', plannedPct: 100, actualPct: 100 },
    { module: 'Mod 3: Trees & Binary Search', plannedPct: 100, actualPct: 85 },
    { module: 'Mod 4: Graph Algorithms (BFS/DFS)', plannedPct: 80, actualPct: 70 },
    { module: 'Mod 5: Dynamic Programming', plannedPct: 60, actualPct: 45 },
    { module: 'Mod 6: Advanced Tries & Segment Trees', plannedPct: 40, actualPct: 20 }
  ]

  return (
    <div className="p-5 rounded-2xl bg-surface/40 border border-white/10 space-y-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-text-primary text-sm">Syllabus Progress Visualization (Planned vs Actual)</h3>
          <p className="text-xs text-text-muted">Recharts module breakdown comparison across term calendar.</p>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-semantic-purple/15 text-semantic-purple text-[10px] font-bold border border-semantic-purple/30">
          Recharts Analytics
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="module" stroke="#8b8b9e" fontSize={10} tickLine={false} />
            <YAxis stroke="#8b8b9e" fontSize={10} unit="%" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0c0d14',
                borderColor: 'rgba(255,255,255,0.15)',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#fff'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar dataKey="plannedPct" name="Planned Target %" fill="#a855f7" radius={[6, 6, 0, 0]} />
            <Bar dataKey="actualPct" name="Actual Completed %" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
