import './AdminTopbar.css';

type AdminTopbarProps = {
  title: string;
  context: string;
};

export const AdminTopbar = ({ title, context }: AdminTopbarProps) => {
  return (
    <header className="admin-topbar">
      <h1 className="admin-topbar__title">{title}</h1>
      <p className="admin-topbar__context mb-0">{context}</p>
    </header>
  );
};
