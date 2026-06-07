export interface StatsBarProps {
  wpm: number;
  accuracy: number;
  timeRemaining?: number;
}

interface StatSpec {
  key: string;
  value: string;
  label: string;
  valueClass: string;
}

function buildStats(
  wpm: number,
  accuracy: number,
  timeRemaining: number | undefined,
): StatSpec[] {
  const stats: StatSpec[] = [
    {
      key: "wpm",
      value: `${Math.max(0, Math.round(wpm))}`,
      label: "wpm",
      valueClass: "stat-value",
    },
    {
      key: "accuracy",
      value: `${Math.max(0, Math.round(accuracy))}%`,
      label: "acc",
      valueClass: "stat-value",
    },
  ];

  if (timeRemaining !== undefined) {
    stats.push({
      key: "timer",
      value: `${Math.max(0, Math.ceil(timeRemaining))}`,
      label: "time",
      valueClass: "stat-value stat-value-accent",
    });
  }

  return stats;
}

export function StatsBar({
  wpm,
  accuracy,
  timeRemaining,
}: StatsBarProps): JSX.Element {
  const stats = buildStats(wpm, accuracy, timeRemaining);

  return (
    <div className="stats-bar" role="group" aria-label="Live stats">
      {stats.map((stat, i) => (
        <div key={stat.key} className="stats-bar-item">
          {i > 0 && <span className="stats-bar-divider" aria-hidden="true" />}
          <div className="stat">
            <div className={stat.valueClass}>{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
