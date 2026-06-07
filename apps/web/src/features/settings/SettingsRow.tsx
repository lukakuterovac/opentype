import type { ReactNode } from "react";

export interface SettingsRowProps {
  name: string;
  description?: string;
  control: ReactNode;
}

export function SettingsRow({
  name,
  description,
  control,
}: SettingsRowProps): JSX.Element {
  return (
    <div className="settings-row">
      <div className="settings-row-label">
        <div className="settings-row-name">{name}</div>
        {description && (
          <div className="settings-row-description">{description}</div>
        )}
      </div>
      <div className="settings-row-control">{control}</div>
    </div>
  );
}
