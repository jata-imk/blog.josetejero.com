# Runbook: hardening básico del VPS (SSH)

> Aplicado el 2026-07-09 sobre el VPS de OVH (Debian 12, hostname `srv.josetejero.com`).
> Complementa a [deploy.md](./deploy.md) y [ci-cd.md](./ci-cd.md) — el usuario de deploy del
> pipeline opera bajo estas reglas.

## Estado final

- **Login por contraseña: deshabilitado** para todos los usuarios vía SSH.
- **Login de root por SSH: deshabilitado** (ni con llave). Root solo vía `sudo` o consola KVM.
- **Acceso exclusivo por llave SSH** (`PubkeyAuthentication`).
- La **consola KVM de OVH** (panel OVH → VPS → KVM) queda como acceso de rescate: es login
  *local* (equivale a monitor+teclado físicos), no pasa por SSH, y sí acepta la contraseña
  Linux del usuario.

## Usuarios del sistema

| Usuario | Sudo | Docker | Llave SSH | Rol |
|---|---|---|---|---|
| `root` | — | — | no | Sin acceso directo; solo `sudo`/KVM |
| `debian` | ✅ | ✅ | ✅ | Admin principal (también lo usará el pipeline CI/CD) |
| `karyme` | ✅ | ❌ | ✅ | Admin secundario de respaldo |
| `jose_tejero_blog` | ❌ | ❌ | no | Usuario de sitio creado por CloudPanel: aísla/posee los archivos del vhost. No borrar. Sin llaves = nadie puede entrar como él (OK). |
| `sync` y resto | — | — | — | Cuentas de servicio del sistema (`nologin`), no tocar |

Convención: **una llave por persona/máquina** — cada línea de `authorized_keys` es un acceso
individual revocable borrando esa línea. Las llaves privadas nunca salen de la máquina donde se
generaron; solo viajan las `.pub`.

## Configuración aplicada

Archivo: `/etc/ssh/sshd_config.d/00-hardening.conf`

```
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
```

> **Por qué `00-`:** en sshd, cuando una opción aparece varias veces **gana la primera leída**, y
> los archivos de `sshd_config.d/` se leen antes que `sshd_config`, en orden alfabético. La imagen
> de OVH trae `/etc/ssh/sshd_config.d/50-cloud-init.conf` con `PasswordAuthentication yes`; el
> prefijo `00-` garantiza que nuestro archivo se lea antes y gane. Editar solo `sshd_config` NO
> funciona por esto mismo.

## Procedimiento (para reproducir o auditar)

1. **Prerequisito anti-bloqueo**: un usuario no-root con sudo y llave SSH **probada** (`debian`),
   y el rescate KVM verificado (login local con la contraseña Linux del usuario).
2. Crear `/etc/ssh/sshd_config.d/00-hardening.conf` con el contenido de arriba.
3. Validar sin aplicar: `sudo sshd -t` (silencio = OK) y confirmar la config efectiva:
   ```bash
   sudo sshd -T | grep -E "^(permitrootlogin|passwordauthentication|kbdinteractiveauthentication|pubkeyauthentication)"
   ```
   Debe dar `no / no / no / yes`.
4. `sudo systemctl restart ssh` — **sin cerrar la sesión actual**.
5. Probar desde una terminal nueva:
   ```bash
   ssh -i ~/.ssh/vps-ovh-blog debian@IP          # debe entrar
   ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no debian@IP  # debe fallar: Permission denied (publickey)
   ssh root@IP                                    # debe fallar
   ```

## Operaciones frecuentes

**Añadir la llave de una persona/máquina nueva** (desde cualquier admin con sudo):

```bash
echo 'ssh-ed25519 AAAA... línea pública completa' | sudo tee -a /home/USUARIO/.ssh/authorized_keys
```

Si el usuario no tiene `.ssh`, crearla antes con permisos estrictos (sshd rechaza llaves si los
permisos son laxos):

```bash
sudo mkdir -p /home/USUARIO/.ssh && sudo chmod 700 /home/USUARIO/.ssh
sudo touch /home/USUARIO/.ssh/authorized_keys && sudo chmod 600 /home/USUARIO/.ssh/authorized_keys
sudo chown -R USUARIO:USUARIO /home/USUARIO/.ssh
```

**Revocar un acceso**: borrar su línea de `authorized_keys` (`sudo nano ...`). No hace falta
reiniciar nada.

**Cambiar la passphrase de una llave** (en la PC del dueño, no toca el servidor):

```bash
ssh-keygen -p -f ~/.ssh/nombre-de-la-llave
```

## Gotchas aprendidos

- **KVM y teclado**: la consola web (noVNC) asume layout US; los caracteres especiales de una
  contraseña llegan corrompidos con teclado latinoamericano. La contraseña del usuario de rescate
  debe ser **solo letras y números** (larga para compensar). El prompt `srv.josetejero.com login:`
  muestra el *hostname*, no un usuario — ahí se escribe `debian`.
- **La contraseña Linux sigue existiendo** aunque SSH no la acepte: la usan `sudo` y el login
  local por KVM. Mantenerla fuerte y guardada en el gestor de contraseñas.
- **Termius duplica llaves**: su función "add key to host" añade la pública aunque ya exista en
  `authorized_keys`. Inofensivo (sshd ignora duplicados), pero conviene dejar una sola línea.
- El pipeline CI/CD (ver [ci-cd.md](./ci-cd.md)) usará una **llave dedicada** (`blog-deploy`)
  añadida al `authorized_keys` de `debian` — nunca una llave personal.
