from flask import Blueprint, request, jsonify, current_app
from controllers.image_controller import ImageController

images = Blueprint('images', __name__)

@images.route('/api/upload', methods=['POST'])
def upload():
    """Endpoint para subir una imagen"""
    controller = ImageController(current_app)
    return controller.upload_image(request)

@images.route('/api/image/<file_id>', methods=['GET'])
def get_image(file_id):
    """Endpoint para obtener una imagen por su ID"""
    controller = ImageController(current_app)
    return controller.get_image(file_id)

@images.route('/api/images', methods=['GET'])
def list_images():
    """Endpoint para listar todas las imágenes"""
    controller = ImageController(current_app)
    return controller.list_images(request)

@images.route('/api/image/<file_id>', methods=['DELETE'])
def delete_image(file_id):
    """Endpoint para eliminar una imagen por su ID"""
    controller = ImageController(current_app)
    return controller.delete_image(file_id)
