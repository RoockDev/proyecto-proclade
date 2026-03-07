# ADR-0001 - Contrato de respuesta API unificado

- Estado: Accepted
- Fecha: 2026-03-06

## Contexto

El frontend necesita un contrato estable y predecible para evitar handling ad-hoc por endpoint.

## Decision

Adoptar contrato unico para todas las respuestas HTTP:

```ts
{
  success: boolean;
  message: string;
  data: T | null;
}
```

Implementado con interceptor global y exception filter global.

## Consecuencias

Positivas:

- Menor complejidad en frontend.
- Errores consistentes.

Negativas:

- Requiere disciplina para no devolver payloads crudos fuera del flujo estandar.
