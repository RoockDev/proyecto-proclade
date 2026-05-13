import { Injectable } from '@nestjs/common';
import { NewsStatus, SuperheroStatus } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { ChatbotCtaLink } from './types/chatbot.types';

type DynamicIntentReply = {
  answer: string;
  ctaLinks: ChatbotCtaLink[];
  suggestions: string[];
};

const formatRegionPhone = (value: string | null | undefined): string => {
  const digits = (value ?? '').replace(/\D+/g, '').slice(0, 9);

  if (digits.length !== 9) {
    return value ?? '';
  }

  return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
};

@Injectable()
export class ChatbotDynamicContextService {
  constructor(private readonly prisma: PrismaService) {}

  async buildIntentReply(
    intentCode: string | null,
    normalizedMessage?: string,
  ): Promise<DynamicIntentReply | null> {
    if (!intentCode) {
      return null;
    }

    const query = this.normalizeText(normalizedMessage ?? '');

    if (intentCode === 'SUPERHEROES') {
      return this.buildSuperheroesReply(query);
    }

    if (intentCode === 'NOTICIAS') {
      return this.buildNewsReply(query);
    }

    if (intentCode === 'RETOS_SOLIDARIOS') {
      return this.buildChallengesReply(query);
    }

    if (intentCode === 'COLABORAR' || intentCode === 'DONAR') {
      return this.buildCollaborationReply(query);
    }

    if (intentCode === 'BIBLIOTECAS_HUMANAS') {
      return this.buildHumanBooksReply(query);
    }

    if (intentCode === 'DELEGACIONES') {
      return this.buildRegionsReply(query);
    }

    if (intentCode === 'CONTACTO') {
      return this.buildContactReply(query);
    }

    return null;
  }

  private async buildSuperheroesReply(
    query: string,
  ): Promise<DynamicIntentReply> {
    const heroes = await this.prisma.superhero.findMany({
      where: {
        status: SuperheroStatus.PUBLISHED,
        deletedAt: null,
      },
      select: {
        name: true,
        country: true,
        quote: true,
        description: true,
        slug: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: 12,
    });

    if (heroes.length === 0) {
      return {
        answer:
          'Ahora mismo no hay superhéroes publicados en la web. En cuanto el equipo publique nuevos perfiles, aparecerán aquí automáticamente.',
        ctaLinks: [{ label: 'Ir a Superhéroes', to: '/superheroes' }],
        suggestions: ['¿Cómo colaborar sin donar?', '¿Cómo donar?'],
      };
    }

    const specificHero = this.findBestNamedMatch(query, heroes, (hero) => {
      return `${hero.name} ${hero.country ?? ''}`;
    });

    if (specificHero) {
      const quoteText = specificHero.item.quote
        ? `\n\nCita destacada: "${specificHero.item.quote}"`
        : '';
      const countryText = specificHero.item.country
        ? ` (${specificHero.item.country})`
        : '';

      return {
        answer: `${specificHero.item.name}${countryText}: ${specificHero.item.description}${quoteText}`,
        ctaLinks: [
          {
            label: `Ver ${specificHero.item.name}`,
            to: `/superheroes/${specificHero.item.slug}`,
          },
          {
            label: 'Ver todos los superhéroes',
            to: '/superheroes',
          },
        ],
        suggestions: [
          '¿Qué superhéroes hay?',
          '¿Cómo colaborar sin donar?',
          '¿Cómo donar?',
        ],
      };
    }

    if (this.isSpecificSuperheroQuery(query)) {
      return {
        answer:
          'No he encontrado un superhéroe con ese nombre. Si quieres, te muestro los superhéroes publicados para que elijas uno.',
        ctaLinks: [
          { label: 'Ver todos los superhéroes', to: '/superheroes' },
        ],
        suggestions: [
          '¿Qué superhéroes hay?',
          '¿Quiénes son los superhéroes PUCH?',
          'Superhéroes por país',
        ],
      };
    }

    const heroLines = heroes.map((hero) => {
      if (!hero.country) {
        return `- ${hero.name}`;
      }

      return `- ${hero.name} (${hero.country})`;
    });

    return {
      answer: `Actualmente hay ${heroes.length} superhéroes publicados:\n${heroLines.join(
        '\n',
      )}\n\nSi quieres, te puedo contar también cómo colaborar o donar para apoyar estos proyectos.`,
      ctaLinks: [{ label: 'Ver todos los superhéroes', to: '/superheroes' }],
      suggestions: [
        '¿Cómo colaborar sin donar?',
        '¿Cómo donar?',
        '¿Qué es Equipo PUCH?',
      ],
    };
  }

  private async buildNewsReply(query: string): Promise<DynamicIntentReply> {
    const news = await this.prisma.news.findMany({
      where: {
        status: NewsStatus.PUBLISHED,
        deletedAt: null,
      },
      select: {
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 10,
    });

    if (news.length === 0) {
      return {
        answer:
          'Ahora mismo no hay noticias publicadas. Cuando el equipo publique nuevas noticias en el panel admin, aparecerán en esta sección.',
        ctaLinks: [{ label: 'Ir a Noticias', to: '/noticias' }],
        suggestions: ['¿Qué es Equipo PUCH?', '¿Cómo colaborar sin donar?'],
      };
    }

    const specificNews = this.findBestNamedMatch(query, news, (item) => {
      return `${item.title} ${item.excerpt}`;
    });

    if (specificNews) {
      const publishedText = specificNews.item.publishedAt
        ? `Publicada el ${new Intl.DateTimeFormat('es-ES').format(
            specificNews.item.publishedAt,
          )}. `
        : '';

      return {
        answer: `${publishedText}${specificNews.item.excerpt}`,
        ctaLinks: [
          {
            label: `Leer noticia: ${specificNews.item.title}`,
            to: `/noticias/${specificNews.item.slug}`,
          },
          {
            label: 'Ver todas las noticias',
            to: '/noticias',
          },
        ],
        suggestions: [
          '¿Dónde ver noticias del proyecto?',
          '¿Qué tipo de noticias publican?',
        ],
      };
    }

    const newsLines = news.map((item) => `- ${item.title}`);

    return {
      answer: `Estas son las noticias más recientes (${news.length}):\n${newsLines.join(
        '\n',
      )}\n\nSi quieres, puedo ayudarte a ir a la sección de noticias para leerlas completas.`,
      ctaLinks: [{ label: 'Ver noticias', to: '/noticias' }],
      suggestions: [
        '¿Dónde ver noticias del proyecto?',
        '¿Qué tipo de noticias publican?',
      ],
    };
  }

  private async buildChallengesReply(
    query: string,
  ): Promise<DynamicIntentReply> {
    const challenges = await this.prisma.challenge.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      select: {
        title: true,
        description: true,
        currentAmount: true,
        targetAmount: true,
      },
      orderBy: [{ createdAt: 'desc' }],
      take: 10,
    });

    if (challenges.length === 0) {
      return {
        answer:
          'Ahora mismo no hay retos activos publicados. Cuando se active un nuevo reto desde admin, el chatbot lo detectará automáticamente.',
        ctaLinks: [{ label: 'Ir a Colabora', to: '/colabora' }],
        suggestions: ['¿Cómo donar?', '¿Cómo colaborar sin donar?'],
      };
    }

    const amountFormatter = new Intl.NumberFormat('es-ES');
    const specificChallenge = this.findBestNamedMatch(
      query,
      challenges,
      (challenge) => {
        return challenge.title;
      },
    );

    if (specificChallenge) {
      const targetAmount = Math.max(1, specificChallenge.item.targetAmount);
      const currentAmount = specificChallenge.item.currentAmount;
      const remaining = Math.max(0, targetAmount - currentAmount);
      const progress = Math.min(
        100,
        Math.round((currentAmount / targetAmount) * 100),
      );

      return {
        answer: `${specificChallenge.item.title}: ${specificChallenge.item.description}\n\nObjetivo: ${amountFormatter.format(
          targetAmount,
        )} EUR\nRecaudado: ${amountFormatter.format(
          currentAmount,
        )} EUR\nFaltan: ${amountFormatter.format(remaining)} EUR (${progress}%)`,
        ctaLinks: [{ label: 'Ir a Colabora', to: '/colabora' }],
        suggestions: [
          '¿Qué retos hay?',
          '¿Cómo donar?',
          'Ejemplos de impacto de una donación',
        ],
      };
    }

    if (this.isSpecificChallengeQuery(query)) {
      const challengeTitles = challenges
        .slice(0, 5)
        .map((challenge) => challenge.title)
        .join(', ');

      return {
        answer: `No he encontrado un reto activo con ese nombre o número. Retos disponibles ahora: ${challengeTitles}.`,
        ctaLinks: [{ label: 'Ir a Colabora', to: '/colabora' }],
        suggestions: [
          '¿Qué retos hay?',
          '¿Cómo donar?',
          'Ejemplos de impacto de una donación',
        ],
      };
    }

    const lines = challenges.map((challenge) => {
      const safeTarget = Math.max(1, challenge.targetAmount);
      const progress = Math.min(
        100,
        Math.round((challenge.currentAmount / safeTarget) * 100),
      );

      return `- ${challenge.title}: ${amountFormatter.format(
        challenge.currentAmount,
      )}/${amountFormatter.format(challenge.targetAmount)} EUR (${progress}%)`;
    });

    return {
      answer: `Actualmente hay ${challenges.length} retos activos:\n${lines.join(
        '\n',
      )}`,
      ctaLinks: [{ label: 'Ir a Colabora', to: '/colabora' }],
      suggestions: ['¿Cómo donar?', 'Ejemplos de impacto de una donación'],
    };
  }

  private async buildCollaborationReply(
    query: string,
  ): Promise<DynamicIntentReply> {
    if (query.includes('delegacion')) {
      const regionReply = await this.buildRegionsReply(query);

      return {
        ...regionReply,
        suggestions: [
          ...regionReply.suggestions,
          '¿Cómo colaborar sin donar?',
          '¿Cómo donar?',
        ].slice(0, 5),
      };
    }

    const activeChallenges = await this.prisma.challenge.count({
      where: {
        isActive: true,
        deletedAt: null,
      },
    });

    return {
      answer:
        activeChallenges > 0
          ? `Puedes colaborar de varias formas: donar en PROCLADE, difundir el proyecto y participar en acciones solidarias. Ahora mismo hay ${activeChallenges} retos activos en curso.`
          : 'Puedes colaborar de varias formas: donar en PROCLADE, difundir el proyecto y participar en acciones solidarias. Si quieres voluntariado o una colaboración personalizada, puedes escribir a info@fundacionproclade.org.',
      ctaLinks: [
        {
          label: 'Ir a donar en PROCLADE',
          to: 'https://www.fundacionproclade.org/dona/',
        },
        { label: 'Ir a Colabora', to: '/colabora' },
      ],
      suggestions: [
        '¿Cómo donar?',
        'Formulario de colaboración',
        '¿Cómo contactar?',
      ],
    };
  }

  private async buildHumanBooksReply(
    query: string,
  ): Promise<DynamicIntentReply> {
    if (query.includes('delegacion')) {
      return this.buildRegionsReply(query);
    }

    const books = await this.prisma.humanBook.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        title: true,
      },
      orderBy: [{ createdAt: 'desc' }],
      take: 4,
    });

    if (books.length === 0) {
      return {
        answer:
          'El proyecto de Bibliotecas Humanas está activo conceptualmente, pero ahora mismo no hay libros humanos publicados en la plataforma.',
        ctaLinks: [
          {
            label: 'Ver delegaciones PROCLADE',
            to: 'https://www.fundacionproclade.org/delegaciones/',
          },
        ],
        suggestions: [
          '¿Qué son las bibliotecas humanas?',
          '¿Qué son los libros humanos?',
        ],
      };
    }

    const lines = books.map((book) => `- ${book.title}`);

    return {
      answer: `Estos son algunos libros humanos disponibles (${books.length}):\n${lines.join(
        '\n',
      )}`,
      ctaLinks: [
        {
          label: 'Ver delegaciones PROCLADE',
          to: 'https://www.fundacionproclade.org/delegaciones/',
        },
      ],
      suggestions: ['¿Qué son las bibliotecas humanas?', 'Delegaciones'],
    };
  }

  private async buildRegionsReply(query: string): Promise<DynamicIntentReply> {
    const regions = await this.prisma.region.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        name: true,
        address: true,
        email: true,
        phone: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    if (regions.length === 0) {
      return {
        answer:
          'Ahora mismo no hay delegaciones activas registradas en plataforma.',
        ctaLinks: [
          {
            label: 'Delegaciones PROCLADE',
            to: 'https://www.fundacionproclade.org/delegaciones/',
          },
        ],
        suggestions: ['¿Cómo contactar?', '¿Qué son las bibliotecas humanas?'],
      };
    }

    const specificRegion = this.findBestNamedMatch(query, regions, (region) => {
      return region.name;
    });

    if (specificRegion) {
      const phoneLine = specificRegion.item.phone
        ? `\nTeléfono: ${formatRegionPhone(specificRegion.item.phone)}`
        : '';

      return {
        answer: `Delegación ${specificRegion.item.name}:\nDirección: ${specificRegion.item.address}${phoneLine}\nCorreo: ${specificRegion.item.email}`,
        ctaLinks: [
          {
            label: `Escribir a ${specificRegion.item.email}`,
            to: `mailto:${specificRegion.item.email}`,
          },
        ],
        suggestions: ['¿Qué delegaciones hay?', '¿Cómo contactar?'],
      };
    }

    if (this.isSpecificRegionQuery(query)) {
      return {
        answer:
          'No he encontrado una delegación con ese nombre. Si quieres, te enseño el listado de delegaciones activas.',
        ctaLinks: [
          {
            label: 'Delegaciones PROCLADE',
            to: 'https://www.fundacionproclade.org/delegaciones/',
          },
        ],
        suggestions: [
          '¿Qué delegaciones hay?',
          'Delegación Madrid',
          'Delegación Ciudad Real',
        ],
      };
    }

    const regionNames = regions.map((region) => `- ${region.name}`);

    return {
      answer: `Actualmente hay ${regions.length} delegaciones activas:\n${regionNames.join(
        '\n',
      )}`,
      ctaLinks: [
        {
          label: 'Delegaciones PROCLADE',
          to: 'https://www.fundacionproclade.org/delegaciones/',
        },
      ],
      suggestions: [
        'Delegación Madrid',
        'Delegación Ciudad Real',
        '¿Cómo contactar?',
      ],
    };
  }

  private async buildContactReply(query: string): Promise<DynamicIntentReply> {
    if (query.includes('delegacion')) {
      return this.buildRegionsReply(query);
    }

    return {
      answer:
        'Puedes contactar con Fundación PROCLADE por correo en info@fundacionproclade.org, por teléfono en 913 14 78 71 o en C. del Conde de Serrallo, 15, Tetuán, 28029 Madrid.',
      ctaLinks: [
        {
          label: 'Escribir a info@fundacionproclade.org',
          to: 'mailto:info@fundacionproclade.org',
        },
        {
          label: 'Llamar al 913 14 78 71',
          to: 'tel:+34913147871',
        },
      ],
      suggestions: ['¿Qué delegaciones hay?', 'Quiero solicitar información'],
    };
  }

  private normalizeText(text: string) {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 ]+/g, ' ')
      .replace(/\s+/g, ' ');
  }

  private tokenize(text: string) {
    return text.split(' ').filter((token) => token.length > 1);
  }

  private findBestNamedMatch<T>(
    query: string,
    items: T[],
    getText: (item: T) => string,
  ) {
    if (!query || query.length < 3) {
      return null;
    }

    const queryTokens = new Set(this.tokenize(query));
    let bestScore = 0;
    let bestItem: T | null = null;

    for (const item of items) {
      const normalizedItemText = this.normalizeText(getText(item));
      const itemTokens = this.tokenize(normalizedItemText);
      const queryNumbers = this.extractNumbers(query);
      const itemNumbers = this.extractNumbers(normalizedItemText);
      const hasNumericMismatch =
        queryNumbers.length > 0 &&
        itemNumbers.length > 0 &&
        !queryNumbers.some((value) => itemNumbers.includes(value));

      if (
        normalizedItemText.includes(query) ||
        query.includes(normalizedItemText)
      ) {
        if (!hasNumericMismatch) {
          return {
            item,
            score: 1,
          };
        }
      }

      const overlapCount = itemTokens.reduce((accumulator, itemToken) => {
        let bestTokenSimilarity = 0;

        for (const queryToken of queryTokens) {
          const similarity =
            queryToken === itemToken
              ? 1
              : this.levenshteinSimilarity(queryToken, itemToken);
          bestTokenSimilarity = Math.max(bestTokenSimilarity, similarity);
        }

        if (bestTokenSimilarity >= 0.83) {
          return accumulator + bestTokenSimilarity;
        }

        return accumulator;
      }, 0);
      const baseScore = overlapCount / Math.max(1, itemTokens.length);

      let score = baseScore;

      if (queryNumbers.length > 0 && itemNumbers.length > 0) {
        score += queryNumbers.some((value) => itemNumbers.includes(value))
          ? 0.35
          : -0.4;
      }

      if (hasNumericMismatch) {
        score = 0;
      }

      if (score > bestScore) {
        bestScore = score;
        bestItem = item;
      }
    }

    if (!bestItem || bestScore < 0.34) {
      return null;
    }

    return {
      item: bestItem,
      score: bestScore,
    };
  }

  private isSpecificChallengeQuery(query: string) {
    if (!query.includes('reto')) {
      return false;
    }

    if (this.isExplicitListQuery(query)) {
      return false;
    }

    return this.hasSpecificEntityHint(query, /\breto(s)?\b/g);
  }

  private isSpecificSuperheroQuery(query: string) {
    if (!/\bsuperh\w*/.test(query)) {
      return false;
    }

    if (this.isExplicitListQuery(query)) {
      return false;
    }

    return this.hasSpecificEntityHint(query, /\bsuperh\w*/g);
  }

  private isSpecificRegionQuery(query: string) {
    if (!/\bdeleg\w*/.test(query)) {
      return false;
    }

    if (this.isExplicitListQuery(query)) {
      return false;
    }

    return this.hasSpecificEntityHint(query, /\bdeleg\w*/g);
  }

  private isExplicitListQuery(query: string) {
    return /\b(lista|listado|muestrame|mostrar|todos|todas|cuales|cual es|que hay|que retos hay|que superheroes hay|que delegaciones hay|informacion sobre los|informacion sobre las|acerca de los|acerca de las|sobre los|sobre las|por pais)\b/.test(
      query,
    );
  }

  private hasSpecificEntityHint(query: string, domainRegex: RegExp) {
    const cleaned = query.replace(domainRegex, ' ').replace(/\s+/g, ' ').trim();

    if (cleaned.length === 0) {
      return false;
    }

    if (/\d+/.test(cleaned)) {
      return true;
    }

    const genericTokens = new Set([
      'quiero',
      'saber',
      'acerca',
      'sobre',
      'informacion',
      'info',
      'datos',
      'del',
      'de',
      'la',
      'las',
      'los',
      'el',
      'que',
      'cuales',
      'cual',
      'me',
      'puedes',
      'podrias',
      'dame',
      'mostrar',
      'muestrame',
      'listar',
      'lista',
      'todos',
      'todas',
      'hay',
      'existen',
      'conocer',
      'algo',
      'por',
      'pais',
      'de',
    ]);

    const meaningfulTokens = this.tokenize(cleaned).filter((token) => {
      return token.length >= 3 && !genericTokens.has(token);
    });

    return meaningfulTokens.length > 0;
  }

  private extractNumbers(text: string) {
    const matches = text.match(/\d+/g);

    if (!matches) {
      return [];
    }

    return matches.map((value) => Number(value));
  }

  private levenshteinSimilarity(source: string, target: string) {
    const distance = this.levenshteinDistance(source, target);
    const maxLength = Math.max(source.length, target.length);

    if (maxLength === 0) {
      return 1;
    }

    return 1 - distance / maxLength;
  }

  private levenshteinDistance(source: string, target: string) {
    if (source === target) {
      return 0;
    }

    if (source.length === 0) {
      return target.length;
    }

    if (target.length === 0) {
      return source.length;
    }

    const previousRow = new Array(target.length + 1)
      .fill(0)
      .map((_, index) => index);
    const currentRow = new Array(target.length + 1).fill(0);

    for (let sourceIndex = 1; sourceIndex <= source.length; sourceIndex += 1) {
      currentRow[0] = sourceIndex;

      for (
        let targetIndex = 1;
        targetIndex <= target.length;
        targetIndex += 1
      ) {
        const substitutionCost =
          source[sourceIndex - 1] === target[targetIndex - 1] ? 0 : 1;

        currentRow[targetIndex] = Math.min(
          previousRow[targetIndex] + 1,
          currentRow[targetIndex - 1] + 1,
          previousRow[targetIndex - 1] + substitutionCost,
        );
      }

      for (let index = 0; index < previousRow.length; index += 1) {
        previousRow[index] = currentRow[index];
      }
    }

    return previousRow[target.length];
  }
}
