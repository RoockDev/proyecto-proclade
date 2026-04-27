import { getVisibleFaqs } from '../../constants/quickFaq';
import './QuickFaq.css';

type QuickFaqProps = {
  disabled: boolean;
  onSelect: (message: string) => void;
};

export function QuickFaq({ disabled, onSelect }: QuickFaqProps) {
  const faqs = getVisibleFaqs();

  if (faqs.length === 0) {
    return null;
  }

  return (
    <section className="quick-faq" aria-label="Preguntas frecuentes">
      <p className="quick-faq__title">Preguntas frecuentes</p>
      <div className="quick-faq__chips" role="list">
        {faqs.map((faq) => (
          <button
            key={faq.id}
            type="button"
            role="listitem"
            className="quick-faq__chip"
            disabled={disabled}
            onClick={() => onSelect(faq.message)}
          >
            {faq.label}
          </button>
        ))}
      </div>
    </section>
  );
}
