import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FolderHeart, Loader2, Sparkles } from 'lucide-react'

const KITS = [
  { id: 'Google', name: 'Google Prep Kit', desc: '3 core questions (DP, Graphs, Arrays) key for Google rounds.', tags: ['DP', 'Graphs', 'Arrays'] },
  { id: 'Amazon', name: 'Amazon Prep Kit', desc: '3 essential problems (Course Schedule, LRU Cache, Rotting Oranges).', tags: ['Graphs', 'Linked Lists', 'Design'] },
  { id: 'TCS', name: 'TCS/Infosys Kit', desc: '3 foundational questions (Strings, Easy DP, Arrays) frequently tested in OAs.', tags: ['Strings', 'DP', 'Arrays'] },
]

export default function CompanyKits({ onImport }) {
  const [loadingKit, setLoadingKit] = useState(null)

  const handleImport = async (kitId) => {
    setLoadingKit(kitId)
    try {
      await onImport(kitId)
    } finally {
      setLoadingKit(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <FolderHeart className="h-5 w-5 text-accent-light" />
        <h3 className="text-card-title font-semibold text-text-primary">Company Prep Kits</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {KITS.map((kit) => (
          <Card key={kit.id} className="relative bg-card overflow-hidden transition-all hover:scale-[1.01]">
            <CardContent className="p-4 flex flex-col justify-between h-full gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-body font-bold text-text-primary">{kit.name}</h4>
                  <Sparkles className="h-4 w-4 text-semantic-yellow" />
                </div>
                <p className="text-secondary text-text-secondary text-xs">{kit.desc}</p>
                <div className="flex gap-1.5 flex-wrap">
                  {kit.tags.map((t) => (
                    <span key={t} className="text-[10px] bg-hover text-text-muted px-2 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <Button
                onClick={() => handleImport(kit.id)}
                disabled={loadingKit !== null}
                className="w-full text-xs py-1.5 h-auto flex items-center justify-center gap-1.5"
                variant="outline"
              >
                {loadingKit === kit.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  'Import Kit'
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
