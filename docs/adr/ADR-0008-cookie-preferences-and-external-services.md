# ADR-0008 - Preferencias de cookies y gateo de servicios externos

- Estado: Accepted
- Fecha: 2026-05-15

## Contexto

La plataforma usa servicios externos como Google Maps y mantiene almacenamiento local de preferencias. Hacía falta una capa mínima de control de servicios externos y consentimiento funcional sin introducir un CMP complejo.

## Decisión

Implementar en frontend:

1. preferencias guardadas en `localStorage`
2. modal de configuración accesible desde el footer
3. categorías:
   - `necessary`
   - `externalServices`
   - `analytics`
4. bloqueo de Google Maps hasta aceptar `externalServices`

## Consecuencias

### Positivas

- mejor alineación con requisitos de privacidad
- comportamiento controlado de servicios externos
- base simple para futuras ampliaciones

### Negativas

- parte del control está en cliente y no reemplaza una revisión legal completa
- la CSP sigue permitiendo ciertos orígenes externos aunque el frontend gatee su uso
