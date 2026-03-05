import type { HomeCountryProject } from '../../../types/home.types';

const projectImageFallback = (
  <div className="who-we-are__image-placeholder" aria-hidden="true">
    <i className="bi bi-image" />
    <span>Imagen en actualización</span>
  </div>
);

type CountryProjectCardProps = {
  project: HomeCountryProject;
};

export const CountryProjectCard = ({ project }: CountryProjectCardProps) => (
  <article className="who-we-are__card h-100">
    <div className="who-we-are__image-wrap">
      {project.imageUrl ? (
        <img
          src={project.imageUrl}
          alt={project.imageAlt}
          className="who-we-are__image"
        />
      ) : (
        projectImageFallback
      )}
    </div>

    <div className="who-we-are__card-body">
      <span className="who-we-are__country">{project.countryLabel}</span>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
    </div>
  </article>
);
