import { Link } from 'react-router-dom';
import { SectionTitle } from '../../components/SectionTitle/SectionTitle';
import {
  HOME_COUNTRY_PROJECTS,
  HOME_JOIN_CLOSING_MESSAGE,
  HOME_JOIN_REASONS,
  HOME_JOIN_TEAM_INTRO,
  HOME_JOIN_TEAM_TITLE,
  SUPERHEROES_PREVIEW,
  SUPERHERO_IMAGES_BY_KEY,
  WHO_WE_ARE_INTRO,
  WHO_WE_ARE_SCOPE,
} from '../../content/home.content';
import { CountryProjectCard } from './parts/CountryProjectCard';
import { JoinTeamBlock } from './parts/JoinTeamBlock';
import { SuperheroPreviewCard } from './parts/SuperheroPreviewCard';
import './WhoWeAreSection.css';

export const WhoWeAreSection = () => {
  return (
    <section className="who-we-are section-padding">
      <div className="container">
        <SectionTitle title="¿Quiénes somos?" align="left" />

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
          {SUPERHEROES_PREVIEW.map((hero) => (
            <div className="col-12 col-sm-6 col-xl-3" key={hero.id}>
              <SuperheroPreviewCard
                hero={hero}
                imageSrc={SUPERHERO_IMAGES_BY_KEY[hero.imageKey]}
              />
            </div>
          ))}
        </div>

        <div className="text-center mt-4">
          <Link to="/superheroes" className="btn btn-brand-outline">
            Ver todos los superhéroes <i className="bi bi-arrow-right ms-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};
