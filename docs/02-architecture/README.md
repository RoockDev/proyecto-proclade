# 02 - Arquitectura

## Contenido

- [02.1 - C4 Context](./02.1-c4-context.md)
- [02.2 - C4 Container](./02.2-c4-container.md)
- [02.3 - C4 Component (Backend)](./02.3-c4-component-backend.md)
- [02.4 - Flujos Runtime Clave](./02.4-runtime-flows.md)
- [02.5 - Decisiones Arquitectonicas Actuales](./02.5-architecture-decisions.md)

## Principios aplicados

1. Arquitectura modular por dominio (backend) y por feature (frontend).
2. Contrato de respuesta API unificado para todo el sistema.
3. Seguridad por JWT + roles en capa backend.
4. Persistencia con Prisma y reglas de negocio en servicios.
5. Operacion local unificada por Docker Compose + Nginx.
