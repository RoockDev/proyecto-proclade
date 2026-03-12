import './DashboardActivity.css';

type DashboardActivityProps = {
  items: string[];
};

export const DashboardActivity = ({ items }: DashboardActivityProps) => (
  <div className="dashboard-activity">
    <h2>Actividad reciente</h2>
    <ul>
      {items.map((item) => (
        <li key={item}>
          <span />
          <p>{item}</p>
        </li>
      ))}
    </ul>
  </div>
);
