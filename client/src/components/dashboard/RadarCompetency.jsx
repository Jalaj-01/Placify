import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award } from 'lucide-react'

export default function RadarCompetency({ topics }) {
  // Aggregate stats for 6 dimensions
  const getSubjectStats = (subjectKey, matchFn) => {
    const list = topics.filter(matchFn)
    if (!list.length) return 0
    const completed = list.filter((t) => t.status === 'Done').length
    return Math.round((completed / list.length) * 100)
  }

  const data = [
    { subject: 'DSA', value: getSubjectStats('DSA', (t) => t.subject === 'DSA') },
    { subject: 'OS', value: getSubjectStats('OS', (t) => t.subject === 'OS') },
    { subject: 'DBMS', value: getSubjectStats('DBMS', (t) => t.subject === 'DBMS') },
    { subject: 'CN', value: getSubjectStats('CN', (t) => t.subject === 'CN') },
    { subject: 'OOPS', value: getSubjectStats('OOPS', (t) => t.subject === 'OOPS') },
    { subject: 'Aptitude', value: getSubjectStats('Aptitude', (t) => t.subject.startsWith('Aptitude-')) },
  ]

  return (
    <Card className="border border-border-subtle bg-card">
      <CardHeader className="pb-3 border-b border-border-subtle flex flex-row items-center gap-2">
        <Award className="h-5 w-5 text-accent-light shrink-0" />
        <CardTitle className="text-card-title font-semibold">Competency Index</CardTitle>
      </CardHeader>
      <CardContent className="p-5 flex items-center justify-center">
        <div className="h-[260px] w-full max-w-[360px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#8b8b9e', fontSize: 11, fontWeight: 500 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: '#4a4a5e', fontSize: 9 }}
                axisLine={false}
              />
              <Radar
                name="Completion"
                dataKey="value"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
