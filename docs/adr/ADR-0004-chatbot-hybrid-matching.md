# ADR-0004 - Chatbot hibrido (knowledge + contexto dinamico)

- Estado: Accepted
- Fecha: 2026-04-29

## Contexto

Un chatbot solo basado en respuestas estaticas pierde valor cuando cambian noticias, retos, superheroes o delegaciones.

## Decision

Adoptar un enfoque hibrido:

1. Matching sobre knowledge base administrable (intents, phrases, canonical).
2. Enriquecimiento dinamico con datos vivos de dominio (news, challenges, superheroes, regions).
3. Backoffice admin para gobernanza, metricas y unresolved questions.

## Consecuencias

Positivas:

- Respuestas mas actuales.
- Mejor ciclo de mejora continua por metricas.

Negativas:

- Mayor complejidad funcional y de mantenimiento.
- Necesita calibracion recurrente de pesos y umbrales.
