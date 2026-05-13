import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  getPublicChallenges,
  type PublicChallenge,
} from '../../features/challenges/api/challenges.api';
import { sendContactForm } from '../../features/colabora/api/colabora.api';
import { ChallengeDetailModal } from './components/ChallengeDetailModal';
import './ColaboraPage.css';

const euroFormat = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

export const ColaboraPage = () => {
  const [challenges, setChallenges] = useState<PublicChallenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<
    (PublicChallenge & { progress: number; remaining: number }) | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    void getPublicChallenges()
      .then((response) => {
        if (response.success && response.data) {
          setChallenges(response.data);
        }
      })
      .catch(() => setChallenges([]));
  }, []);

  const challengeCards = useMemo(
    () =>
      challenges.map((challenge) => {
        const progress = Math.min(
          100,
          Math.round((challenge.currentAmount / challenge.targetAmount) * 100),
        );
        const remaining = Math.max(0, challenge.targetAmount - challenge.currentAmount);
        return {
          ...challenge,
          progress,
          remaining,
        };
      }),
    [challenges],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsSuccess(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const data = {
      nombre: formData.get('nombre') as string,
      apellidos: formData.get('apellidos') as string,
      email: formData.get('email') as string,
      telefono: formData.get('telefono') as string || undefined,
      mensaje: formData.get('mensaje') as string || undefined,
    };

    try {
      const response = await sendContactForm(data);
      console.log('Colabora response:', response);
      if (response.success) {
        setMessage('Mensaje enviado correctamente. ¡Gracias por contactar!');
        setIsSuccess(true);
        form.reset();
      } else {
        setMessage(response.message || 'Error al enviar el mensaje. Inténtalo de nuevo.');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Colabora submit error:', error);
      setMessage('Error al enviar el mensaje. Inténtalo de nuevo.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="colabora-page">
      <header className="colabora-page__hero">
        <div className="colabora-page__container">
          <span className="colabora-page__eyebrow">Únete al cambio</span>
          <h1>Colabora</h1>
          <p>
            Hay muchas formas de unirte al Equipo PUCH. Elige la tuya y ayúdanos a construir
            un mundo sin hambre.
          </p>
        </div>
      </header>

      <div className="colabora-page__block">
        <div className="colabora-page__container">
          <h2>Retos activos</h2>
          <p className="colabora-page__section-intro">
            Cada reto convierte una aportación concreta en apoyo directo para proyectos
            reales. Sigue su avance y descubre cuánto falta para completarlos.
          </p>
          <div className="colabora-page__challenges">
            {challengeCards.length ? (
              challengeCards.map((challenge) => (
                <article key={challenge.id} className="colabora-page__challenge-card">
                  <span className="colabora-page__challenge-badge">Reto activo</span>
                  <h3>{challenge.title}</h3>
                  <p className="colabora-page__challenge-description">
                    {challenge.description}
                  </p>
                  <div className="colabora-page__amounts">
                    <span>{euroFormat.format(challenge.currentAmount)}</span>
                    <span>Meta: {euroFormat.format(challenge.targetAmount)}</span>
                  </div>
                  <div className="colabora-page__progress-track">
                    <div style={{ width: `${challenge.progress}%` }} />
                  </div>
                  <small>
                    Faltan {euroFormat.format(challenge.remaining)} - {challenge.progress}%
                    completado
                  </small>
                  <button
                    type="button"
                    className="colabora-page__challenge-link"
                    onClick={() => setSelectedChallenge(challenge)}
                  >
                    Ver detalles del reto <i className="bi bi-arrow-right" />
                  </button>
                </article>
              ))
            ) : (
              <p className="colabora-page__empty">No hay retos activos en este momento.</p>
            )}
          </div>
        </div>
      </div>

      <div className="colabora-page__block">
        <div className="colabora-page__container">
          <h2>¿Cómo participar?</h2>
          <p className="colabora-page__section-intro">
            Queremos ponértelo fácil: déjanos tus datos, cuéntanos cómo quieres sumar y
            coordinamos contigo la mejor forma de colaborar.
          </p>
          <div className="colabora-page__steps">
            <article className="colabora-page__step-card">
              <span>1</span>
              <h3>Cuéntanos tu idea</h3>
              <p>Rellena el formulario de contacto y cuéntanos cómo quieres ayudar.</p>
            </article>
            <article className="colabora-page__step-card">
              <span>2</span>
              <h3>Te acompañamos</h3>
              <p>Nuestro equipo te contactará para coordinar tu participación.</p>
            </article>
            <article className="colabora-page__step-card">
              <span>3</span>
              <h3>Empieza a sumar</h3>
              <p>Empieza a cambiar vidas. Cada acción suma.</p>
            </article>
          </div>
        </div>
      </div>

      <div className="colabora-page__block">
        <div className="colabora-page__container colabora-page__form-wrap">
          <h2>Formulario de contacto</h2>
          <p className="colabora-page__section-intro">
            Escríbenos y te responderemos para orientar tu colaboración, resolver dudas o
            ayudarte a elegir la mejor forma de participar.
          </p>
          <form className="colabora-page__form-card" onSubmit={handleSubmit}>
            <div className="colabora-page__form-grid">
              <label>
                Nombre *
                <input type="text" name="nombre" placeholder="Tu nombre" required />
              </label>
              <label>
                Apellidos *
                <input type="text" name="apellidos" placeholder="Tus apellidos" required />
              </label>
            </div>
            <label>
              Correo electrónico *
              <input type="email" name="email" placeholder="tu@email.com" required />
            </label>
            <label>
              Teléfono
              <input type="tel" name="telefono" placeholder="+34 600 000 000" />
            </label>
            <label>
              Mensaje (opcional)
              <textarea name="mensaje" rows={4} placeholder="Cuéntanos cómo te gustaría colaborar..." />
            </label>
            <small>
              * Este formulario se envía a info@fundacionproclade.org y te
              responderemos usando los datos que nos facilites.
            </small>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar'}
            </button>
            {message && (
              <p
                className={`colabora-page__form-feedback ${
                  isSuccess === true
                    ? 'colabora-page__form-feedback--success'
                    : 'colabora-page__form-feedback--error'
                }`}
              >
                {message}
              </p>
            )}
          </form>
        </div>
      </div>

      <div className="colabora-page__donation">
        <div className="colabora-page__container">
          <h2>¿Prefieres donar directamente?</h2>
          <p>Tu donación ayuda a financiar proyectos contra el hambre en España y en el mundo.</p>
          <a
            href="https://www.fundacionproclade.org/colabora/"
            target="_blank"
            rel="noreferrer"
          >
            Ir a la página de donación
          </a>
        </div>
      </div>

      {selectedChallenge && (
        <ChallengeDetailModal
          challenge={selectedChallenge}
          euroFormat={euroFormat}
          onClose={() => setSelectedChallenge(null)}
        />
      )}
    </section>
  );
};
