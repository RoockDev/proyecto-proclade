import { ChatbotDynamicContextService } from './chatbot-dynamic-context.service';

describe('ChatbotDynamicContextService', () => {
  const createService = () => {
    const prismaMock = {
      superhero: {
        findMany: jest.fn(),
      },
      news: {
        findMany: jest.fn(),
      },
      challenge: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      humanBook: {
        findMany: jest.fn(),
      },
      region: {
        findMany: jest.fn(),
      },
    };

    const service = new ChatbotDynamicContextService(prismaMock as never);

    return { service, prismaMock };
  };

  it('construye respuesta dinamica con superheroes publicados', async () => {
    const { service, prismaMock } = createService();
    prismaMock.superhero.findMany.mockResolvedValue([
      { name: 'Superheroe India', country: 'India' },
      { name: 'Superheroe Burkina Faso', country: 'Burkina Faso' },
    ]);

    const reply = await service.buildIntentReply('SUPERHEROES');

    expect(reply).not.toBeNull();
    expect(reply?.answer).toContain('2 superheroes publicados');
    expect(reply?.answer).toContain('Superheroe India (India)');
    expect(reply?.ctaLinks[0]?.to).toBe('/superheroes');
  });

  it('construye respuesta dinamica de retos con progreso', async () => {
    const { service, prismaMock } = createService();
    prismaMock.challenge.findMany.mockResolvedValue([
      {
        title: 'Reto 1',
        currentAmount: 150,
        targetAmount: 300,
      },
    ]);

    const reply = await service.buildIntentReply('RETOS_SOLIDARIOS');

    expect(reply).not.toBeNull();
    expect(reply?.answer).toContain('Reto 1');
    expect(reply?.answer).toContain('50%');
  });

  it('responde con detalle de un reto concreto cuando se menciona en la pregunta', async () => {
    const { service, prismaMock } = createService();
    prismaMock.challenge.findMany.mockResolvedValue([
      {
        title: 'Reto 2',
        description: 'Impulso de huertas comunitarias',
        currentAmount: 300,
        targetAmount: 1000,
      },
    ]);

    const reply = await service.buildIntentReply(
      'RETOS_SOLIDARIOS',
      'quiero informacion del reto 2',
    );

    expect(reply).not.toBeNull();
    expect(reply?.answer).toContain('Reto 2');
    expect(reply?.answer).toContain('Faltan');
  });

  it('resuelve una delegacion concreta con direccion y correo', async () => {
    const { service, prismaMock } = createService();
    prismaMock.region.findMany.mockResolvedValue([
      {
        name: 'Ciudad Real',
        address: 'Calle Mayor 10',
        email: 'ciudadreal@proclade.org',
      },
    ]);

    const reply = await service.buildIntentReply(
      'DELEGACIONES',
      'delegacion ciudad real',
    );

    expect(reply).not.toBeNull();
    expect(reply?.answer).toContain('Ciudad Real');
    expect(reply?.answer).toContain('Calle Mayor 10');
    expect(reply?.answer).toContain('ciudadreal@proclade.org');
  });

  it('resuelve una delegacion concreta aunque venga con typo leve', async () => {
    const { service, prismaMock } = createService();
    prismaMock.region.findMany.mockResolvedValue([
      {
        name: 'Ciudad Real',
        address: 'Calle Mayor 10',
        email: 'ciudadreal@proclade.org',
      },
    ]);

    const reply = await service.buildIntentReply(
      'DELEGACIONES',
      'delegacion cidad real',
    );

    expect(reply).not.toBeNull();
    expect(reply?.answer).toContain('Ciudad Real');
    expect(reply?.answer).toContain('Calle Mayor 10');
  });

  it('responde con detalle de un superheroe concreto cuando lo mencionan', async () => {
    const { service, prismaMock } = createService();
    prismaMock.superhero.findMany.mockResolvedValue([
      {
        name: 'Super Slash',
        country: 'Noruega',
        quote: 'No hay cambio pequeno',
        description: 'Lidera acciones de sensibilizacion local.',
        slug: 'super-slash',
      },
    ]);

    const reply = await service.buildIntentReply(
      'SUPERHEROES',
      'quiero informacion de super slash',
    );

    expect(reply).not.toBeNull();
    expect(reply?.answer).toContain('Super Slash');
    expect(reply?.answer).toContain('Lidera acciones');
    expect(reply?.ctaLinks[0]?.to).toContain('/superheroes/super-slash');
  });

  it('responde con detalle de una noticia concreta cuando se menciona', async () => {
    const { service, prismaMock } = createService();
    prismaMock.news.findMany.mockResolvedValue([
      {
        title: 'Reto 2 supera el 50%',
        slug: 'reto-2-supera-50',
        excerpt: 'El reto 2 ya ha superado la mitad del objetivo.',
        publishedAt: new Date('2026-03-28T00:00:00.000Z'),
      },
    ]);

    const reply = await service.buildIntentReply(
      'NOTICIAS',
      'quiero saber sobre reto 2 supera el 50',
    );

    expect(reply).not.toBeNull();
    expect(reply?.answer).toContain('ha superado la mitad');
    expect(reply?.ctaLinks[0]?.to).toContain('/noticias/reto-2-supera-50');
  });

  it('responde que no existe un reto cuando piden uno no disponible', async () => {
    const { service, prismaMock } = createService();
    prismaMock.challenge.findMany.mockResolvedValue([
      {
        title: 'Reto 1',
        description: 'Reto base',
        currentAmount: 100,
        targetAmount: 500,
      },
    ]);

    const reply = await service.buildIntentReply(
      'RETOS_SOLIDARIOS',
      'dame informacion sobre el reto 23',
    );

    expect(reply).not.toBeNull();
    expect(reply?.answer.toLowerCase()).toContain(
      'no he encontrado un reto activo',
    );
    expect(reply?.answer).toContain('Reto 1');
  });

  it('responde que no existe un superheroe cuando el nombre no coincide', async () => {
    const { service, prismaMock } = createService();
    prismaMock.superhero.findMany.mockResolvedValue([
      {
        name: 'Super Slash',
        country: 'Noruega',
        quote: null,
        description: 'Heroe de referencia',
        slug: 'super-slash',
      },
    ]);

    const reply = await service.buildIntentReply(
      'SUPERHEROES',
      'dame informacion del superheroe inexistente',
    );

    expect(reply).not.toBeNull();
    expect(reply?.answer.toLowerCase()).toContain(
      'no he encontrado un superheroe',
    );
    expect(reply?.ctaLinks[0]?.to).toBe('/superheroes');
  });

  it('lista superheroes cuando la consulta es general', async () => {
    const { service, prismaMock } = createService();
    prismaMock.superhero.findMany.mockResolvedValue([
      {
        name: 'Super Slash',
        country: 'Noruega',
        quote: null,
        description: 'Heroe de referencia',
        slug: 'super-slash',
      },
    ]);

    const reply = await service.buildIntentReply(
      'SUPERHEROES',
      'quiero informacion sobre los superheroes',
    );

    expect(reply).not.toBeNull();
    expect(reply?.answer.toLowerCase()).toContain('superheroes publicados');
    expect(reply?.answer.toLowerCase()).not.toContain(
      'no he encontrado un superheroe',
    );
  });

  it('lista superheroes por pais cuando se pide ese tipo de vista', async () => {
    const { service, prismaMock } = createService();
    prismaMock.superhero.findMany.mockResolvedValue([
      {
        name: 'Super Slash',
        country: 'Noruega',
        quote: null,
        description: 'Heroe de referencia',
        slug: 'super-slash',
      },
    ]);

    const reply = await service.buildIntentReply(
      'SUPERHEROES',
      'superheroes por pais',
    );

    expect(reply).not.toBeNull();
    expect(reply?.answer.toLowerCase()).toContain('superheroes publicados');
    expect(reply?.answer).toContain('(Noruega)');
  });

  it('lista delegaciones cuando la consulta es general', async () => {
    const { service, prismaMock } = createService();
    prismaMock.region.findMany.mockResolvedValue([
      {
        name: 'Ciudad Real',
        address: 'Calle Mayor 10',
        email: 'ciudadreal@proclade.org',
      },
    ]);

    const reply = await service.buildIntentReply(
      'DELEGACIONES',
      'quiero saber acerca de las delegaciones',
    );

    expect(reply).not.toBeNull();
    expect(reply?.answer.toLowerCase()).toContain('delegaciones activas');
    expect(reply?.answer.toLowerCase()).not.toContain(
      'no he encontrado una delegacion',
    );
  });
});
