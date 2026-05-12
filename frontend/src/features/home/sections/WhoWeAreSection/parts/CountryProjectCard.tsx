import type { HomeCountryProject } from "../../../types/home.types";

const getProjectImageFallback = (project: HomeCountryProject) => (
  <div className="who-we-are__image-placeholder" aria-hidden="true">
    <div className="who-we-are__image-placeholder-glow" />
    {project.imagePendingLabel ? (
      <span className="who-we-are__image-placeholder-badge">
        {project.imagePendingLabel}
      </span>
    ) : null}

    <div className="who-we-are__image-placeholder-icon">
      <i className="bi bi-camera" />
    </div>

    <div className="who-we-are__image-placeholder-copy">
      <strong>
        {project.imagePendingTitle || "Contenido visual en actualización"}
      </strong>
      <span>
        {project.imagePendingDescription ||
          "Estamos preparando la imagen de este proyecto para mostrarla aquí muy pronto."}
      </span>
    </div>
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
        getProjectImageFallback(project)
      )}
    </div>

    <div className="who-we-are__card-body">
      <span className="who-we-are__country">{project.countryLabel}</span>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
    </div>
  </article>
);
