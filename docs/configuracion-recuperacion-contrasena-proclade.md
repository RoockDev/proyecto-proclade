# Guia para configurar correos de recuperacion de contrasena

Documento para Fundacion PROCLADE

Fecha: 12 de mayo de 2026

## 1. Objetivo

La web de Equipo PUCH permite que un usuario solicite un enlace para recuperar su contrasena desde la pantalla de login.

Cuando el usuario introduce su correo, la aplicacion genera un enlace unico y lo envia a ese usuario. El cliente puede configurar desde que cuenta sale ese correo.

## 2. Idea clave

En recuperacion de contrasena no existe un destinatario fijo como en el formulario Colabora.

El destinatario siempre es el usuario que solicita recuperar la contrasena.

Lo que se configura es:

```env
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
MAIL_FROM
FRONTEND_URL
RESET_PASSWORD_TTL_MINUTES
```

Si se quiere que los correos salgan desde `info@fundacionproclade.org`, entonces `SMTP_USER` y `MAIL_FROM` deben apuntar a esa cuenta.

## 3. Configuracion recomendada

Si el correo esta gestionado con Google Workspace o Gmail:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@fundacionproclade.org
SMTP_PASS=CLAVE_DE_APLICACION_O_CLAVE_SMTP
MAIL_FROM=info@fundacionproclade.org
FRONTEND_URL=https://dominio-publico-de-la-web
RESET_PASSWORD_TTL_MINUTES=30
```

Si el cliente decide usar otra cuenta remitente, por ejemplo `no-reply@fundacionproclade.org`, debe cambiar:

```env
SMTP_USER=no-reply@fundacionproclade.org
MAIL_FROM=no-reply@fundacionproclade.org
SMTP_PASS=CLAVE_DE_ESE_BUZON
```

## 4. Que significa cada variable

| Variable | Ejemplo | Para que sirve |
| --- | --- | --- |
| `SMTP_HOST` | `smtp.gmail.com` | Servidor SMTP que envia los correos. |
| `SMTP_PORT` | `587` | Puerto de envio con TLS. |
| `SMTP_USER` | `info@fundacionproclade.org` | Cuenta que inicia sesion en el servidor SMTP. |
| `SMTP_PASS` | Clave de aplicacion o clave SMTP | Clave privada de la cuenta remitente. |
| `MAIL_FROM` | `info@fundacionproclade.org` | Remitente visible para el usuario. |
| `FRONTEND_URL` | `https://equipo-puch.org` | URL base que se usa para crear el enlace de recuperacion. |
| `RESET_PASSWORD_TTL_MINUTES` | `30` | Minutos durante los que el enlace es valido. |

## 5. Importancia de FRONTEND_URL

El enlace se construye asi:

```text
FRONTEND_URL/auth/reset-password?token=TOKEN_GENERADO
```

Por ejemplo, si `FRONTEND_URL` es:

```env
FRONTEND_URL=https://equipo-puch.org
```

El usuario recibira un enlace parecido a:

```text
https://equipo-puch.org/auth/reset-password?token=...
```

Si `FRONTEND_URL` esta mal, el correo puede llegar, pero el boton llevara a una pagina incorrecta.

Recomendaciones:

1. Usar la URL publica real de la web.
2. No usar `localhost` en produccion.
3. No poner una barra final si no es necesario.
4. Usar `https://` cuando la web este publicada con certificado SSL.

## 6. Como generar la clave SMTP si usan Google Workspace

Si la cuenta remitente es de Google Workspace o Gmail, lo habitual es usar una clave de aplicacion.

### Paso 1 - Activar verificacion en dos pasos

1. Entrar en la cuenta remitente, por ejemplo `info@fundacionproclade.org`.
2. Abrir la configuracion de seguridad de Google.
3. Activar Verificacion en dos pasos.
4. Completar el proceso indicado por Google.

### Paso 2 - Crear la clave de aplicacion

1. Entrar en `https://myaccount.google.com/apppasswords`.
2. Iniciar sesion con la cuenta remitente.
3. Crear una clave para la aplicacion web o para correo SMTP.
4. Copiar la clave de 16 caracteres.
5. Guardarla en un gestor seguro de contrasenas.

Google solo muestra la clave una vez. Si se pierde, hay que generar otra.

## 7. Como configurar el backend

Si se ejecuta con Docker en local, las variables se ponen en:

```text
backend/.env
```

Si la aplicacion esta desplegada en un hosting o servidor, las variables se configuran en el panel del backend.

Ejemplo para produccion:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@fundacionproclade.org
SMTP_PASS=PEGAR_AQUI_LA_CLAVE_DE_APLICACION
MAIL_FROM=info@fundacionproclade.org
FRONTEND_URL=https://dominio-publico-de-la-web
RESET_PASSWORD_TTL_MINUTES=30
```

Despues de cambiar estos valores, hay que reiniciar el backend.

Con Docker:

```bash
docker compose restart backend
```

## 8. Como probar la recuperacion de contrasena

1. Abrir la web.
2. Entrar en Login.
3. Pulsar "Olvidaste tu contrasena".
4. Escribir el correo de un usuario que exista en la aplicacion.
5. Enviar la solicitud.
6. Revisar la bandeja de entrada de ese usuario.
7. Abrir el enlace recibido.
8. Crear una nueva contrasena.
9. Volver al login e iniciar sesion con la nueva contrasena.

El sistema muestra un mensaje generico aunque el correo no exista. Esto es intencionado para no revelar que cuentas estan registradas.

## 9. Como revisar logs

Si el envio funciona, el backend mostrara algo parecido a:

```text
Email de recuperacion enviado a usuario@example.com
Token de recuperacion generado para: usuario@example.com
```

Si falla el envio:

```text
Error al enviar email de recuperacion a usuario@example.com
No se pudo enviar el email de recuperacion a usuario@example.com
```

Comando Docker:

```bash
docker compose logs --tail=100 backend
```

## 10. Errores frecuentes

| Error | Causa probable | Solucion |
| --- | --- | --- |
| El correo no llega | `SMTP_PASS` vacia o incorrecta | Revisar clave SMTP y reiniciar backend. |
| El enlace abre localhost | `FRONTEND_URL` esta en `http://localhost` | Cambiar a la URL publica real. |
| Google dice password incorrect | Se usa la contrasena normal de la cuenta | Usar una clave de aplicacion. |
| No aparece clave de aplicacion | Falta verificacion en dos pasos o Google Workspace lo bloquea | Revisar seguridad o pedirlo al administrador. |
| El enlace ha expirado | Paso el tiempo definido en `RESET_PASSWORD_TTL_MINUTES` | Solicitar otro enlace. |
| El correo llega a spam | Dominio o remitente no validado | Revisar SPF, DKIM y DMARC. |
| El usuario no recibe nada y no hay error visible | Se escribio un correo no registrado | Probar con un usuario existente. |

## 11. Seguridad

1. No compartir `SMTP_PASS` por correo, chat o documentos publicos.
2. No subir `backend/.env` al repositorio.
3. Usar una cuenta corporativa controlada por Fundacion PROCLADE.
4. Regenerar la clave si se sospecha que alguien no autorizado la ha visto.
5. Mantener `RESET_PASSWORD_TTL_MINUTES` en un valor razonable, por ejemplo 30 minutos.
6. Usar siempre `https://` en `FRONTEND_URL` cuando la web este publicada.

## 12. Checklist final

```text
[ ] La cuenta remitente existe y se puede acceder a ella.
[ ] La cuenta remitente tiene permiso para enviar por SMTP.
[ ] Existe una clave de aplicacion o clave SMTP valida.
[ ] SMTP_HOST esta configurado.
[ ] SMTP_PORT esta configurado.
[ ] SMTP_USER apunta a la cuenta remitente.
[ ] SMTP_PASS esta configurado.
[ ] MAIL_FROM coincide con la cuenta remitente.
[ ] FRONTEND_URL apunta a la URL publica real de la web.
[ ] RESET_PASSWORD_TTL_MINUTES tiene un valor definido.
[ ] El backend se ha reiniciado despues de cambiar variables.
[ ] Se ha probado con un usuario existente.
[ ] El enlace recibido abre la web correcta.
[ ] El usuario puede cambiar la contrasena e iniciar sesion.
```

## 13. Referencias oficiales

- Google Account Help - App passwords:
  `https://support.google.com/accounts/answer/185833`
- Google Workspace Admin Help - Enviar correo desde aplicaciones con Gmail SMTP:
  `https://support.google.com/a/answer/176600`
- Google Workspace Admin Help - SMTP relay:
  `https://support.google.com/a/answer/2956491`

