# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado con
[SemVer](https://semver.org/lang/es/).

## [No publicado]

## [0.1.0] - 2026-10-13

### Agregado

- `accept` con la sintaxis del input (extensiones, MIME y comodines), validado también al soltar.
- `validateFiles`: tipo, tamaño, duplicados, validador propio y número máximo, con códigos de rechazo.
- `createDropzone`: acumulación o reemplazo, rechazos del último lote, estado de arrastre sin parpadeo
  y veredicto previo (`accept`, `reject`, `unknown`).
- Vistas previas con `URL.createObjectURL`, creadas bajo demanda y revocadas al quitar o desmontar.
- `describeAccept` en es-MX: «PNG, JPG o PDF».
- `useDropzone` con prop getters, ARIA y atributos `data-*`; archivos controlados.
