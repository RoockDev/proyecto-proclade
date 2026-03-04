import './SectionTitle.css';

type SectionTitleProps = {
  title: string;
  description?: string;
  align?: 'center' | 'left';
};

export const SectionTitle = ({
  title,
  description,
  align = 'center',
}: SectionTitleProps) => (
  <div className={`section-title section-title--${align}`}>
    <h2>{title}</h2>
    {description && <p>{description}</p>}
  </div>
);
