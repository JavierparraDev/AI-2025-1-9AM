from flask import jsonify, send_file, Response
from io import BytesIO
from bson.objectid import ObjectId
import json
from app.models.image_model import ImageModel

class ImageController:
    def __init__(self, app):
        self.app = app
        self.model = ImageModel(app)
    
    def upload_image(self, request) -> tuple[Response, int]:
        """
        Procesa la solicitud de carga de imagen
        
        Args:
            request: Objeto request de Flask
            
        Returns:
            tuple: (respuesta JSON, código de estado)
        """
        # Verificar si se envió una imagen
        if 'image' not in request.files:
            return jsonify({"error": "No se envió ninguna imagen"}), 400

        image = request.files['image']
        
        # Verificar si el archivo tiene nombre
        if image.filename == '':
            return jsonify({"error": "El archivo no tiene nombre"}), 400
        
        # Obtener metadatos adicionales si se proporcionaron
        additional_metadata = {}
        if 'metadata' in request.form:
            try:
                additional_metadata = json.loads(request.form['metadata'])
            except json.JSONDecodeError:
                return jsonify({"error": "El formato del JSON de metadatos es inválido"}), 400
        
        try:
            # Usar el modelo para guardar la imagen
            file_id = self.model.save_image(
                image.read(),
                filename=image.filename,
                content_type=image.content_type,
                additional_metadata=additional_metadata
            )
            
            return jsonify({
                "status": "success",
                "message": "Imagen almacenada exitosamente",
                "file_id": file_id
            }), 201
        except Exception as e:
            return jsonify({
                "status": "error",
                "message": f"Error al guardar la imagen: {str(e)}"
            }), 500
    
    def get_image(self, file_id) -> tuple[Response, int]:
        """
        Obtiene una imagen por su ID
        
        Args:
            file_id: ID de la imagen a obtener
            
        Returns:
            tuple: (respuesta, código de estado)
        """
        try:
            # Usar el modelo para obtener la imagen y sus metadatos
            image_data, metadata = self.model.get_image(file_id)
            
            # Enviar el archivo
            return send_file(
                BytesIO(image_data),
                mimetype=metadata.get('content_type', 'image/jpeg'),
                download_name=metadata.get('filename', 'image.jpg'),
                as_attachment=False
            )
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            return jsonify({
                "status": "error",
                "message": f"Error al obtener la imagen: {str(e)}"
            }), 404
    
    def list_images(self, request) -> tuple[Response, int]:
        """
        Lista todas las imágenes con paginación
        
        Args:
            request: Objeto request de Flask
            
        Returns:
            tuple: (respuesta JSON, código de estado)
        """
        try:
            # Obtener parámetros de paginación
            limit = int(request.args.get('limit', 10))
            skip = int(request.args.get('skip', 0))
            
            # Validar parámetros
            if limit < 1 or limit > 100:
                limit = 10
            if skip < 0:
                skip = 0
            
            # Usar el modelo para listar las imágenes
            images, total = self.model.list_images(limit, skip)
            
            return jsonify({
                "status": "success",
                "total": total,
                "limit": limit,
                "skip": skip,
                "data": images
            }), 200
        except Exception as e:
            return jsonify({
                "status": "error",
                "message": f"Error al listar las imágenes: {str(e)}"
            }), 500
    
    def delete_image(self, file_id) -> tuple[Response, int]:
        """
        Elimina una imagen por su ID
        
        Args:
            file_id: ID de la imagen a eliminar
            
        Returns:
            tuple: (respuesta JSON, código de estado)
        """
        try:
            # Usar el modelo para eliminar la imagen
            self.model.delete_image(file_id)
            
            return jsonify({
                "status": "success",
                "message": "Imagen eliminada exitosamente",
                "file_id": file_id
            }), 200
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except FileNotFoundError:
            return jsonify({"error": "No se encontró la imagen"}), 404
        except Exception as e:
            return jsonify({
                "status": "error",
                "message": f"Error al eliminar la imagen: {str(e)}"
            }), 500