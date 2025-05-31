from app.utils.mongo import get_image_from_gridfs

def process_face_image(app, image_id):
    image_data = get_image_from_gridfs(app, image_id)
    # Simulamos inferencia
    print("[AI] Procesando imagen desde MongoDB... (simulado)")
    # TODO: añadir modelo de reconocimiento facial
    # Publicar resultado al topic MQTT (por ejemplo 'autenticacion/respuesta')