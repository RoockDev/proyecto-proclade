import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSuperheroesList } from '../../../superheroes/api/superheroes.api';
import type { SuperheroItem } from '../../../superheroes/types/superheroes.types';
import { SectionTitle } from '../../components/SectionTitle/SectionTitle';
import {
  HOME_COUNTRY_PROJECTS,
  HOME_JOIN_CLOSING_MESSAGE,
  HOME_JOIN_REASONS,
  HOME_JOIN_TEAM_INTRO,
  HOME_JOIN_TEAM_TITLE,
  WHO_WE_ARE_INTRO,
  WHO_WE_ARE_SCOPE,
} from '../../content/home.content';
import { CountryProjectCard } from './parts/CountryProjectCard';
import { JoinTeamBlock } from './parts/JoinTeamBlock';
import { SuperheroPreviewCard } from './parts/SuperheroPreviewCard';
import './WhoWeAreSection.css';

const HOME_SUPERHEROES_LIMIT = 4;

export const WhoWeAreSection = () => {
  const [superheroes, setSuperheroes] = useState<SuperheroItem[]>([]);
  const [isLoadingSuperheroes, setIsLoadingSuperheroes] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadSuperheroes = async () => {
      try {
        setIsLoadingSuperheroes(true);
        const response = await getSuperheroesList(1, HOME_SUPERHEROES_LIMIT);

        if (!isMounted) {
          return;
        }

        if (!response.success || !response.data) {
          setSuperheroes([]);
          return;
        }

        setSuperheroes(response.data.items);
      } catch {
        if (!isMounted) {
          return;
        }

        setSuperheroes([]);
      } finally {
        if (isMounted) {
          setIsLoadingSuperheroes(false);
        }
      }
    };

    void loadSuperheroes();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="who-we-are section-padding reveal-up reveal-delay-3">
      <div className="container">
        <SectionTitle title="¿Quiénes somos?" align="center" />

        <div className="who-we-are__intro">
          <p>{WHO_WE_ARE_INTRO}</p>
          <p>{WHO_WE_ARE_SCOPE}</p>
        </div>

        <div className="row g-4 who-we-are__projects">
          {HOME_COUNTRY_PROJECTS.map((project) => (
            <div className="col-12 col-lg-4" key={project.id}>
              <CountryProjectCard project={project} />
            </div>
          ))}
        </div>

        <JoinTeamBlock
          title={HOME_JOIN_TEAM_TITLE}
          intro={HOME_JOIN_TEAM_INTRO}
          reasons={HOME_JOIN_REASONS}
          closingMessage={HOME_JOIN_CLOSING_MESSAGE}
        />

        <div className="who-we-are__superheroes-head">
          <h3>Superhéroes del Equipo PUCH</h3>
          <p>
            Testimonios visuales de personas que impulsan el cambio desde sus
            comunidades.
          </p>
        </div>

        <div className="row g-4">
          {isLoadingSuperheroes ? (
            <div className="col-12">
              <div className="who-we-are__superheroes-state" role="status" aria-live="polite">
                <div className="spinner-border text-secondary" role="presentation" />
                <p>Cargando superhéroes...</p>
              </div>
            </div>
          ) : superheroes.length === 0 ? (
            <div className="col-12">
              <div className="who-we-are__superheroes-state who-we-are__superheroes-state--empty">
                <i className="bi bi-people" aria-hidden="true" />
                <p>Todavía no hay superhéroes publicados.</p>
              </div>
            </div>
          ) : (
            superheroes.map((hero) => (
              <div className="col-12 col-sm-6 col-xl-3" key={hero.id}>
                <SuperheroPreviewCard hero={hero} />
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-4">
          <Link to="/superheroes?page=1" className="btn btn-brand-gradient">
            Ver todos los superhéroes <i className="bi bi-arrow-right ms-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};
