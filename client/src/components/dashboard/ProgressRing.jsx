export default function ProgressRing({ percentage, label, strokeColor = 'stroke-accent' }) {
  const radius = 36
  const strokeWidth = 6
  const normalizedRadius = radius - strokeWidth / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-card rounded-card border border-border-subtle hover:scale-[1.02] transition-transform">
      <div className="relative h-20 w-20">
        <svg className="h-full w-full -rotate-90">
          {/* Background circle */}
          <circle
            className="stroke-border-subtle"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <circle
            className={`${strokeColor} transition-all duration-500 ease-out`}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-secondary font-bold text-text-primary">
          {percentage}%
        </span>
      </div>
      <p className="text-secondary text-text-secondary font-medium mt-3 text-center">{label}</p>
    </div>
  )
}
