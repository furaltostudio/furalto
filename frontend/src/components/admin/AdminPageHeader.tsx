import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function AdminPageHeader({ title, description, actions }: AdminPageHeaderProps) {
  return (
    <div className="admin-page-header">
      <div>
        <p className="admin-page-kicker">Studio</p>
        <h2 className="admin-page-title">{title}</h2>
        {description ? <p className="admin-page-description">{description}</p> : null}
      </div>
      {actions ? <div className="admin-page-actions">{actions}</div> : null}
    </div>
  );
}
