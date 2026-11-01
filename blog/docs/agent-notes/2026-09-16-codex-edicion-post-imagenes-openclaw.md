# Edición del borrador de generación de imágenes con OpenClaw

Actualización posterior: José pidió rehacer la captura en horizontal 16:9 y aumentar el desenfoque. Se generó `image-generation-action-list-blur-16x9.png` mediante la herramienta integrada, se subió como Media 62 y se sustituyó únicamente la referencia a Media 61 en el cuerpo actual. Las versiones anteriores se conservan. Se confirmó estado draft, GET 200 y decodificación de la imagen. Prompt y verificación guardados en `output/entrada-imagenes/` de la raíz del workspace.

Se editó el post 39 en el CMS de producción mediante la sesión de navegador que José abrió con Playwright. Permanece en estado `draft` y sin fecha de publicación. No se cambiaron código de la aplicación, título, portada, slug, autor ni relaciones del post.

El texto pasa de 2,415 a 1,820 palabras contando prompts y comandos. La reorganización sigue una tarea concreta: interpretar capturas del rediseño del blog, generar composiciones, editar, guardar y preparar una publicación. Las secciones duplicadas de generación y edición se incorporaron al mini laboratorio. Se retiraron las recomendaciones comerciales para explicar principal y fallbacks con un ejemplo neutral.

Se añadió un diagrama SVG de selección de modelo (Media 60) y se sustituyó la captura de proveedores por la proporcionada por José, editada con fondo desenfocado mediante la herramienta integrada de imágenes (Media 61). Se conservó el diagrama anterior del recorrido canal → agente → proveedor (Media 56). La captura anterior sigue almacenada, pero el post ya no la referencia.

Los ejemplos llevan prompts para ambas mitades claro/oscuro, collage del Taller del Cuaderno y una ciudad de papel que emerge de una libreta. Quedan marcadores para que José añada sus capturas reales; no se inventaron resultados ni se publicaron contenidos en redes. El cierre enlaza al artículo existente sobre publicación social.

Se guardaron el documento original, el Markdown revisado, el payload Lexical, las imágenes y el prompt de edición en `../output/entrada-imagenes/` respecto a la raíz de `blog/`. La conversión utiliza el importador existente, sin nodos descartados. La escritura compara primero la fecha de modificación para evitar sobrescribir ediciones simultáneas.

Verificación: lectura posterior del documento guardado; estado draft; encabezados y marcadores; enlaces; imágenes descargadas con GET 200 y decodificadas por el navegador. HEAD devuelve 404 en el endpoint de archivos incluso para imágenes existentes, así que no es un control válido aquí. No se ejecutaron builds ni pruebas de aplicación porque no cambió código.
