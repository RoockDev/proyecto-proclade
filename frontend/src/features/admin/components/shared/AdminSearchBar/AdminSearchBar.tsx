import './AdminSearchBar.css';

type AdminSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export const AdminSearchBar = ({
  value,
  onChange,
  placeholder = 'Buscar...',
}: AdminSearchBarProps) => {
  return (
    <label className="admin-search-bar">
      <i className="bi bi-search" aria-hidden="true" />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
};
