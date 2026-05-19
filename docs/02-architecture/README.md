# 02 - Arquitectura

## Contenido

- [02.1 - C4 Context](./02.1-c4-context.md)
- [02.2 - C4 Container](./02.2-c4-container.md)
- [02.3 - C4 Component (backend)](./02.3-c4-component-backend.md)
- [02.4 - Flujos runtime clave](./02.4-runtime-flows.md)
- [02.5 - Decisiones arquitectónicas vigentes](./02.5-architecture-decisions.md)

## Principios vigentes

1. Un único punto de entrada público por Nginx.
2. Backend modular por dominio.
3. Frontend organizado por feature.
4. Contrato de respuesta HTTP unificado.
5. Seguridad real aplicada en backend, no solo en el router del frontend.
6. Persistencia local simple para uploads, con sus limitaciones documentadas.
7. Operación local basada en Docker Compose como camino principal.
