# Documentación técnica automatizada

Este directorio centraliza la documentación viva del proyecto.

## Objetivo

Mantener trazabilidad técnica por Historia de Usuario (HU) sin depender de herramientas de pago.

## Estructura

- `docs/CHANGELOG.md`: índice global de cambios documentados por HU/PR.
- `docs/hu/`: documentos individuales por HU o PR.
- `docs/hu/HU-template.md`: plantilla base para revisiones manuales.

## Flujo automático

1. Se mergea una PR a `dev`.
2. El workflow `.github/workflows/docs-auto.yml` genera/actualiza documentación.
3. El bot abre una PR con título `docs(auto): ...` hacia `dev`.
4. El equipo revisa formato, claridad, riesgos y mergea.

## Reglas de revisión mínima

- No incluir secretos ni datos sensibles.
- Verificar que la HU/PR enlazada es correcta.
- Confirmar que `decisions` y `risks` tienen contenido útil.
- Si falta contexto funcional, completar manualmente sobre la plantilla.

## Bootstrap histórico

El workflow manual `.github/workflows/docs-bootstrap.yml` permite generar documentación de PRs ya mergeadas a `dev`.

## Mantenimiento

- Si cambia el formato de salida, actualizar también `HU-template.md`.
- Si cambia el modelo de ramas, revisar filtros de workflows.
