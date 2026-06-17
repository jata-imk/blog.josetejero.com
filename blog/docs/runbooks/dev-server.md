# Runbook: servidor de desarrollo (para QA / gate visual)

> Regla de oro: **ningún agente levanta un servidor bloqueante dentro de su heartbeat.** El servidor
> es *infraestructura*: corre por separado y los agentes solo consumen la URL. Esto evita que, en
> Windows (sin `tmux` para desacoplar), un `next dev` colgado mate el grupo de procesos y tire el
> control plane de Paperclip.

## Quién levanta el servidor

> ⭐ **UNA VEZ POR SESIÓN, NO POR TAREA.** El board (José) levanta el server **al inicio de la
> sesión de trabajo y lo deja corriendo**. A partir de ahí TODO sigue automático: Engineer codea,
> Frontend implementa y captura, QA valida — todos pegan a `http://localhost:3000` **sin bloquearse**.
> No es una intervención por cada captura; es prender y olvidar.

**El board (José)**, en su propia terminal (o un proceso persistente). **Nunca** el QA ni el
Frontend dentro de una tarea.

```bash
cd blog
pnpm dev          # ⭐ recomendado en desarrollo: HMR refleja los cambios al instante,
                  #    así QA/Frontend siempre capturan lo último sin reconstruir.
# si con `dev` aún hay presión de RAM (16 GB justos):
pnpm build && pnpm start   # más ligero, pero es una foto estática: reconstruir tras cada cambio.
```
Queda sirviendo en `http://localhost:3000` (admin de Payload en `/admin`). Déjalo abierto toda la sesión.

## Qué hacen los agentes (QA **y** Frontend)
- Asumen el server **ya corriendo** en `http://localhost:3000` y solo apuntan ahí (Playwright en
  **headless**, una sola instancia de Chrome). Capturas a `1440x900` y `390x844`. **Flujo normal: cero bloqueo.**
- **Plan B (red de seguridad), solo si la URL NO responde:** NO intentes levantar el server. Marca la
  tarea `blocked` con "necesito el dev server corriendo en :3000" y devuélvela al board. Esto es la
  excepción, no el flujo de cada tarea.

## Por qué (contexto del fallo de 2026-06)
Con 16 GB, cuando el QA arrancaba `next dev` + Chrome dentro del heartbeat, el control plane de
Paperclip se caía: combinación de (1) cascada de *process-group kill* al colgarse/matarse el server
en primer plano, y (2) presión de RAM (next dev + Chrome + Postgres + Paperclip + runtime del agente).
Desacoplar el server resuelve ambas.

## Recuperación si Paperclip se cayó
```bash
npx paperclipai doctor --repair
```

## Reducir memoria
- `pnpm build && pnpm start` en vez de `pnpm dev` para las pruebas.
- Playwright **headless**, sin perfil pesado.
- Menos agentes en paralelo mientras se toman capturas.
- Cerrar ventanas de Chrome ajenas durante el gate visual.
