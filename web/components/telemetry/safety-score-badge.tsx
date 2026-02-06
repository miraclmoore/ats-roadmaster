'use client';

export interface SafetyScoreBadgeProps {
  score: number | null;
  size?: 'sm' | 'md' | 'lg';
  showStar?: boolean;
}

const sizeClasses = {
  sm: {
    text: 'text-lg',
    star: 'text-sm',
  },
  md: {
    text: 'text-2xl',
    star: 'text-lg',
  },
  lg: {
    text: 'text-4xl',
    star: 'text-2xl',
  },
};

export function SafetyScoreBadge({ score, size = 'md', showStar = true }: SafetyScoreBadgeProps) {
  if (score === null || score === undefined) {
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <span className={`${sizeClasses[size].text} font-bold tabular-nums`}>—</span>
      </div>
    );
  }

  // Color coding based on score
  const getScoreColor = (s: number): string => {
    if (s >= 90) return 'text-[rgb(var(--profit))]'; // Green: 90-100
    if (s >= 70) return 'text-[rgb(var(--fuel))]';   // Amber: 70-89
    return 'text-[rgb(var(--damage))]';               // Red: 0-69
  };

  const getScoreLabel = (s: number): string => {
    if (s >= 90) return 'Excellent';
    if (s >= 80) return 'Good';
    if (s >= 70) return 'Fair';
    if (s >= 60) return 'Poor';
    return 'Critical';
  };

  const roundedScore = Math.round(score);
  const shouldShowStar = showStar && roundedScore >= 90;
  const colorClass = getScoreColor(roundedScore);

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <span className={`${sizeClasses[size].text} font-bold tabular-nums`}>
          {roundedScore}
        </span>
        {shouldShowStar && (
          <span className={sizeClasses[size].star} aria-label="Excellent score">
            ⭐
          </span>
        )}
      </div>
      {size !== 'sm' && (
        <span className="text-sm text-muted-foreground">
          {getScoreLabel(roundedScore)}
        </span>
      )}
    </div>
  );
}

export interface SafetyScoreBreakdownProps {
  score: number;
  className?: string;
}

export function SafetyScoreBreakdown({ score, className = '' }: SafetyScoreBreakdownProps) {
  // For breakdown display, we'd need the individual components
  // This is a simplified version showing just the overall score with explanation

  const getScoreDetails = (s: number) => {
    if (s >= 90) {
      return {
        category: 'Excellent Driver',
        description: 'Outstanding safety, compliance, and efficiency',
        tips: [],
      };
    }
    if (s >= 80) {
      return {
        category: 'Good Driver',
        description: 'Strong performance with minor areas for improvement',
        tips: ['Maintain consistent speed control', 'Monitor fuel economy'],
      };
    }
    if (s >= 70) {
      return {
        category: 'Fair Driver',
        description: 'Room for improvement in safety or efficiency',
        tips: ['Reduce speeding incidents', 'Improve fuel economy', 'Minimize cargo damage'],
      };
    }
    if (s >= 60) {
      return {
        category: 'Needs Improvement',
        description: 'Significant issues with safety, compliance, or efficiency',
        tips: ['Avoid speeding', 'Deliver on time', 'Drive more efficiently'],
      };
    }
    return {
      category: 'Critical Performance',
      description: 'Serious safety and compliance concerns',
      tips: ['Immediate improvement required in all areas', 'Review driving practices'],
    };
  };

  const details = getScoreDetails(score);

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-1">{details.category}</h4>
        <p className="text-sm text-muted-foreground">{details.description}</p>
      </div>

      {details.tips.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold text-foreground mb-1">Improvement Tips:</h5>
          <ul className="text-xs text-muted-foreground space-y-1">
            {details.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-xs text-muted-foreground pt-2 border-t border-border">
        <p>Score factors: Safety (40%), Compliance (30%), Efficiency (30%)</p>
      </div>
    </div>
  );
}
