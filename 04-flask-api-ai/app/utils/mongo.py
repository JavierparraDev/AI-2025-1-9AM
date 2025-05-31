"""
Módulo para manejar la conexión a la base de datos MongoDB.
Este módulo se encarga de cargar las variables de entorno,
establecer la conexión a MongoDB y configurar GridFS.
"""

from pymongo import MongoClient
import gridfs
import sys

def get_database_connection():
    """
    Establece la conexión a la base de datos MongoDB utilizando
    las variables de entorno del archivo .env.
    
    Returns:
        tuple: (client, db, fs) donde:
            - client: Instancia de MongoClient
            - db: Base de datos MongoDB
            - fs: Instancia de GridFS para manejar archivos
    """
    from app.utils.config import Config
    
    # Obtener variables de entorno a través de Config
    database_url = Config.MONGO_URI
    database_name = Config.MONGODB_DB
    
    try:
        # Establecer conexión a MongoDB
        print(f"Conectando a la base de datos: {database_url}, DB: {database_name}")
        client = MongoClient(database_url)
        
        # Verificar la conexión
        client.admin.command('ping')
        print("Conexión a MongoDB establecida correctamente")
        
        # Obtener la base de datos
        db = client[database_name]
        
        # Configurar GridFS
        fs = gridfs.GridFS(db)
        
        return client, db, fs
    
    except Exception as e:
        print(f"Error al conectar a la base de datos: {str(e)}")
        sys.exit(1)

def init_mongo(app):
    """Inicializa la conexión a MongoDB y configura GridFS"""
    client, db, fs = get_database_connection()
    app.config['MONGO_CLIENT'] = client
    app.config['MONGO_DB'] = db
    app.config['MONGO_FS'] = fs

def close_connection(client):
    """
    Cierra la conexión a la base de datos MongoDB.
    
    Args:
        client: Instancia de MongoClient a cerrar
    """
    if client:
        client.close()
        print("Conexión a MongoDB cerrada correctamente")
