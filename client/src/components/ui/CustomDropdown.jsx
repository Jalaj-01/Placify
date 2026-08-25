import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CustomDropdown({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option...',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  icon: TriggerIcon,
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  renderCustomTrigger = null,
  renderCustomOption = null,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const selectedOption = options.find((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return opt.value === value || opt.id === value
    }
    return opt === value
  })

  const getLabel = (opt) => {
    if (!opt) return ''
    if (typeof opt === 'object') return opt.label || opt.title || opt.name || String(opt.value)
    return String(opt)
  }

  const getValue = (opt) => {
    if (!opt) return ''
    if (typeof opt === 'object') return opt.value !== undefined ? opt.value : opt.id
    return opt
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
    md: 'px-3 py-1.5 text-xs rounded-xl gap-2',
    lg: 'px-4 py-2.5 text-sm rounded-xl gap-2.5',
  }

  return (
    <div ref={dropdownRef} className={cn('relative inline-block text-left', className)}>
      {/* Trigger Button */}
      {renderCustomTrigger ? (
        renderCustomTrigger({ isOpen, setIsOpen, selectedOption, toggle: () => setIsOpen(!isOpen) })
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            'flex items-center justify-between font-semibold border transition-all select-none',
            'bg-card text-text-primary border-border-subtle hover:border-accent/40 hover:bg-surface/80',
            'focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent shadow-xs',
            isOpen && 'border-accent ring-2 ring-accent/20 bg-surface',
            disabled && 'opacity-50 cursor-not-allowed',
            sizeClasses[size],
            buttonClassName
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {TriggerIcon && <TriggerIcon className="h-4 w-4 text-accent shrink-0" />}
            {selectedOption && typeof selectedOption === 'object' && selectedOption.icon && (
              <selectedOption.icon className="h-3.5 w-3.5 text-accent shrink-0" />
            )}
            <span className="truncate">
              {selectedOption ? getLabel(selectedOption) : placeholder}
            </span>
            {selectedOption && typeof selectedOption === 'object' && selectedOption.badge && (
              <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold rounded bg-accent/15 text-accent border border-accent/20">
                {selectedOption.badge}
              </span>
            )}
          </div>
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 text-text-muted transition-transform duration-200 shrink-0 ml-1.5',
              isOpen && 'rotate-180 text-accent'
            )}
          />
        </button>
      )}

      {/* Floating Options Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute left-0 mt-1.5 min-w-[12rem] w-full max-h-64 overflow-y-auto rounded-2xl p-1.5 z-50',
            'bg-card border border-border-subtle shadow-2xl backdrop-blur-xl',
            'animate-in fade-in zoom-in-95 duration-150 scrollbar-thin',
            menuClassName
          )}
          style={{ minWidth: 'max-content' }}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-text-muted text-center">No options available</div>
          ) : (
            options.map((option, idx) => {
              const optVal = getValue(option)
              const optLabel = getLabel(option)
              const isSelected = optVal === value
              const hasSublabel = typeof option === 'object' && option.sublabel
              const hasBadge = typeof option === 'object' && option.badge
              const OptIcon = typeof option === 'object' ? option.icon : null

              if (renderCustomOption) {
                return (
                  <div
                    key={optVal || idx}
                    onClick={() => {
                      onChange(optVal, option)
                      setIsOpen(false)
                    }}
                  >
                    {renderCustomOption({ option, isSelected, optVal, optLabel })}
                  </div>
                )
              }

              return (
                <button
                  key={optVal || idx}
                  type="button"
                  onClick={() => {
                    onChange(optVal, option)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-3 transition-colors cursor-pointer',
                    isSelected
                      ? 'bg-accent/15 text-accent font-bold shadow-xs'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface/80'
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {OptIcon && <OptIcon className="h-4 w-4 text-accent shrink-0" />}
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className={cn('truncate', isSelected && 'font-bold text-text-primary')}>
                          {optLabel}
                        </span>
                        {hasBadge && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-accent/20 text-accent border border-accent/25">
                            {hasBadge}
                          </span>
                        )}
                      </div>
                      {hasSublabel && (
                        <span className="text-[10px] text-text-muted block truncate mt-0.5">
                          {option.sublabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && <Check className="h-3.5 w-3.5 text-accent shrink-0" />}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
