# Guia para configurar el envio de correos de Equipo PUCH

Documento para Fundacion PROCLADE

Fecha: 12 de mayo de 2026

## 1. Objetivo

La web de Equipo PUCH incluye un formulario en la pagina **Colabora**. Cuando una persona completa ese formulario, la aplicacion debe enviar un correo a:

```env
info@fundacionproclade.org
```

Para que ese envio funcione de verdad, la aplicacion necesita conectarse a un servidor de correo mediante SMTP. Sin esa configuracion, el formulario no podra entregar correos reales.

## 2. Resumen rapido

La cuenta que se utilizara para enviar y recibir los mensajes sera:

```env
info@fundacionproclade.org
```

La configuracion recomendada para la aplicacion es:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@fundacionproclade.org
SMTP_PASS=CLAVE_DE_APLICACION_O_CLAVE_SMTP
MAIL_FROM=info@fundacionproclade.org
CONTACT_FORM_TO=info@fundacionproclade.org
```

El unico valor que no debe aparecer en documentacion publica ni en el repositorio es:

```env
SMTP_PASS
```

## 3. Que significa cada campo

| Variable | Valor recomendado | Para que sirve |
| --- | --- | --- |
| `SMTP_HOST` | `smtp.gmail.com` | Servidor SMTP que permite enviar correos. |
| `SMTP_PORT` | `587` | Puerto de envio con TLS. |
| `SMTP_USER` | `info@fundacionproclade.org` | Cuenta que se autentica contra el servidor SMTP. |
| `SMTP_PASS` | Clave de aplicacion o clave SMTP | Clave privada que autoriza a la web a enviar correos. |
| `MAIL_FROM` | `info@fundacionproclade.org` | Remitente visible del correo. |
| `CONTACT_FORM_TO` | `info@fundacionproclade.org` | Destinatario que recibe los mensajes del formulario. |

## 4. Requisitos previos

Antes de empezar, la persona que configure el correo debe tener:

1. Acceso a la cuenta `info@fundacionproclade.org`.
2. Permiso para activar verificacion en dos pasos o para solicitarlo al administrador de Google Workspace.
3. Acceso al servidor o entorno donde este desplegada la aplicacion.
4. Acceso al archivo de variables del backend o al panel de variables de entorno del hosting.
5. Posibilidad de reiniciar el backend despues de cambiar la configuracion.

## 5. Opcion recomendada si la cuenta usa Google Workspace o Gmail

Si `info@fundacionproclade.org` esta gestionada con Google Workspace o Gmail, lo mas sencillo es usar el servidor SMTP de Gmail con una **clave de aplicacion**.

### Paso 1 - Activar la verificacion en dos pasos

1. Entrar en la cuenta `info@fundacionproclade.org`.
2. Abrir la pagina de seguridad de la cuenta de Google.
3. Activar **Verificacion en dos pasos**.
4. Completar el proceso con el metodo que indique Google.

Sin verificacion en dos pasos, normalmente Google no permite crear claves de aplicacion.

### Paso 2 - Crear una clave de aplicacion

1. Entrar en la pagina de claves de aplicacion de Google:
   `https://myaccount.google.com/apppasswords`
2. Iniciar sesion con `info@fundacionproclade.org`.
3. Crear una nueva clave de aplicacion para la web o para correo SMTP.
4. Google mostrara una clave de 16 caracteres.
5. Guardar esa clave en un gestor seguro de contrasenas.

Importante: Google solo muestra esta clave una vez. Si se pierde, no se puede consultar de nuevo; habra que crear otra.

### Paso 3 - Poner los valores en el backend

En el entorno del backend hay que configurar:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@fundacionproclade.org
SMTP_PASS=PEGAR_AQUI_LA_CLAVE_DE_APLICACION
MAIL_FROM=info@fundacionproclade.org
CONTACT_FORM_TO=info@fundacionproclade.org
```

Si el proyecto se ejecuta con Docker en local, estos valores van en:

```text
backend/.env
```

Si el proyecto esta desplegado en un servidor o hosting, estos valores deben configurarse en el panel de variables de entorno del backend.

### Paso 4 - Reiniciar el backend

Despues de modificar las variables hay que reiniciar el backend para que lea la nueva configuracion.

En Docker:

```bash
docker compose restart backend
```

Si se quiere reconstruir todo el proyecto:

```bash
docker compose up --build -d
```

## 6. Si no aparece la opcion de claves de aplicacion

Puede ocurrir que Google no muestre la opcion de crear claves de aplicacion. Las causas habituales son:

1. La verificacion en dos pasos no esta activada.
2. La cuenta pertenece a una organizacion y el administrador ha bloqueado las claves de aplicacion.
3. La cuenta usa proteccion avanzada.
4. La verificacion en dos pasos esta configurada solo con llaves de seguridad.

En ese caso, el administrador de Google Workspace debe habilitar una forma de envio SMTP para la cuenta o facilitar credenciales SMTP alternativas.

## 7. Alternativa con otro proveedor de correo

Si `info@fundacionproclade.org` no usa Google Workspace, se debe pedir al proveedor de correo estos datos:

```text
Servidor SMTP
Puerto SMTP
Usuario SMTP
Contrasena SMTP o clave de aplicacion
Tipo de seguridad: TLS o STARTTLS
```

Luego se rellenan las variables asi:

```env
SMTP_HOST=SERVIDOR_SMTP_DEL_PROVEEDOR
SMTP_PORT=PUERTO_DEL_PROVEEDOR
SMTP_USER=info@fundacionproclade.org
SMTP_PASS=CLAVE_SMTP_DEL_PROVEEDOR
MAIL_FROM=info@fundacionproclade.org
CONTACT_FORM_TO=info@fundacionproclade.org
```

Si el proveedor indica puerto `465`, puede requerir SSL directo. En ese caso conviene que el equipo tecnico revise la configuracion del backend antes de desplegar.

## 8. Como probar que funciona

### Prueba desde la web

1. Abrir la web.
2. Entrar en la seccion **Colabora**.
3. Rellenar el formulario con un nombre, apellidos, correo y mensaje.
4. Enviar el formulario.
5. Comprobar que la web muestra mensaje de exito.
6. Revisar la bandeja de entrada de `info@fundacionproclade.org`.
7. Revisar tambien las carpetas de spam o promociones si no aparece en la entrada principal.

### Prueba desde los logs

Si el equipo tecnico tiene acceso a Docker:

```bash
docker compose logs --tail=100 backend
```

Cuando el envio funciona, debe aparecer un mensaje similar a:

```text
Email de contacto enviado desde correo-del-visitante@example.com
```

Si falta configuracion SMTP, aparecera un error indicando que SMTP no esta configurado.

## 9. Errores frecuentes

| Error | Causa probable | Solucion |
| --- | --- | --- |
| El formulario dice que no se pudo enviar | Falta `SMTP_PASS` o algun dato SMTP es incorrecto | Revisar las variables SMTP y reiniciar backend. |
| Google dice "password incorrect" | Se esta usando la contrasena normal de la cuenta | Crear y usar una clave de aplicacion. |
| No aparece la clave de aplicacion | Google Workspace la tiene bloqueada o falta verificacion en dos pasos | Revisar seguridad de la cuenta o pedirlo al administrador. |
| El correo llega a spam | El dominio o remitente no esta bien validado | Revisar SPF, DKIM y DMARC con el proveedor de correo. |
| No llega ningun correo pero no hay error visible | El servidor antiguo sigue levantado sin las variables nuevas | Reiniciar backend o redesplegar. |
| El remitente aparece raro | `MAIL_FROM` no coincide con la cuenta autenticada | Usar `MAIL_FROM=info@fundacionproclade.org`. |

## 10. Seguridad y mantenimiento

1. No compartir `SMTP_PASS` por correo, chat o documentos publicos.
2. No subir `backend/.env` al repositorio.
3. Guardar la clave en un gestor de contrasenas.
4. Regenerar la clave si se sospecha que alguien no autorizado la ha visto.
5. Si se cambia la contrasena principal de la cuenta Google, puede ser necesario crear una nueva clave de aplicacion.
6. Usar siempre `info@fundacionproclade.org` como cuenta emisora para mantener trazabilidad.

## 11. Checklist final

Antes de dar la funcionalidad por terminada, comprobar:

```text
[ ] La cuenta info@fundacionproclade.org tiene acceso confirmado.
[ ] La verificacion en dos pasos esta activada, si se usa Google.
[ ] Existe una clave de aplicacion o clave SMTP valida.
[ ] El backend tiene SMTP_HOST configurado.
[ ] El backend tiene SMTP_PORT configurado.
[ ] El backend tiene SMTP_USER=info@fundacionproclade.org.
[ ] El backend tiene SMTP_PASS configurado.
[ ] El backend tiene MAIL_FROM=info@fundacionproclade.org.
[ ] El backend tiene CONTACT_FORM_TO=info@fundacionproclade.org.
[ ] El backend se ha reiniciado despues del cambio.
[ ] Se ha enviado una prueba desde el formulario Colabora.
[ ] El correo de prueba ha llegado a info@fundacionproclade.org.
```

## 12. Referencias oficiales

- Google Account Help - App passwords:
  `https://support.google.com/accounts/answer/185833`
- Google Workspace Admin Help - Enviar correo desde aplicaciones con Gmail SMTP:
  `https://support.google.com/a/answer/176600`
- Google Workspace Admin Help - SMTP relay:
  `https://support.google.com/a/answer/2956491`

