from flask import Flask
from utils.mongo import init_mongo
from utils.config import Config
from mqtt.client import init_mqtt
from routes.images import images

def create_app():
    # Validar configuración antes de iniciar
    try:
        Config.validate_config()
    except EnvironmentError as e:
        print(f"Error de configuración: {e}")
        import sys
        sys.exit(1)

    app = Flask(__name__)
    app.config.from_object(Config)

    # Inicializar servicios
    init_mongo(app)
    init_mqtt(app)

    # Registrar blueprints
    app.register_blueprint(images)

    return app
