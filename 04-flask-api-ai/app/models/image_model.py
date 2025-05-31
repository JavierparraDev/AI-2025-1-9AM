from bson.objectid import ObjectId
import datetime

class ImageModel:
    def __init__(self, app):
        """
        Inicializa el modelo con la aplicación Flask
        
        Args:
            app: Instancia de Flask
        """
        self.app = app
        self.fs = app.config['MONGO_FS']
        self.db = app.config['MONGO_DB']
    
    def save_image(self, image_data, filename, content_type, additional_metadata=None):
        """
        Guarda una imagen en GridFS
        
        Args:
            image_data: Bytes de la imagen
            filename: Nombre del archivo
            content_type: Tipo MIME del archivo
            additional_metadata: Metadatos adicionales (opcional)
            
        Returns:
            str: ID del archivo guardado
        """
        # Crear metadatos base
        metadata = {
            "filename": filename,
            "content_type": content_type,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        
        # Añadir metadatos adicionales si se proporcionaron
        if additional_metadata:
            metadata.update(additional_metadata)
        
        # Guardar la imagen en GridFS
        file_id = self.fs.put(
            image_data,
            filename=filename,
            content_type=content_type,
            metadata=metadata
        )
        
        return str(file_id)
    
    def get_image(self, file_id):
        """
        Recupera una imagen y sus metadatos de GridFS
        
        Args:
            file_id: ID del archivo a recuperar
            
        Returns:
            tuple: (datos de la imagen, metadatos)
        """
        # Validar el formato del ID
        if not ObjectId.is_valid(file_id):
            raise ValueError("ID de archivo inválido")
        
        # Obtener el archivo
        file = self.fs.get(ObjectId(file_id))
        
        # Extraer metadatos
        metadata = {
            "filename": file.filename,
            "content_type": file.content_type,
            **file.metadata
        }
        
        return file.read(), metadata
    
    def list_images(self, limit=10, skip=0):
        """
        Lista todas las imágenes con paginación
        
        Args:
            limit: Número máximo de resultados
            skip: Número de resultados a omitir
            
        Returns:
            tuple: (lista de imágenes, total de imágenes)
        """
        # Obtener archivos con paginación
        files = self.fs.find().sort("uploadDate", -1).skip(skip).limit(limit)
        total = self.db.fs.files.count_documents({})
        
        # Formatear resultados
        images = []
        for file in files:
            images.append({
                "file_id": str(file._id),
                "filename": file.filename,
                "content_type": file.content_type,
                "size": file.length,
                "upload_date": file.upload_date.isoformat() if hasattr(file, 'upload_date') else None,
                "metadata": file.metadata
            })
        
        return images, total
    
    def delete_image(self, file_id):
        """
        Elimina una imagen de GridFS
        
        Args:
            file_id: ID del archivo a eliminar
            
        Raises:
            ValueError: Si el ID no es válido
            FileNotFoundError: Si el archivo no existe
        """
        # Validar el formato del ID
        if not ObjectId.is_valid(file_id):
            raise ValueError("ID de archivo inválido")
        
        # Verificar si el archivo existe
        if not self.fs.exists(ObjectId(file_id)):
            raise FileNotFoundError("No se encontró la imagen")
        
        # Eliminar el archivo
        self.fs.delete(ObjectId(file_id))