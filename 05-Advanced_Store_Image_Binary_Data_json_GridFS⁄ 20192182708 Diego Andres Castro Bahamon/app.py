from flask import Flask, request, jsonify, send_file
from pymongo import MongoClient
from bson.objectid import ObjectId
import gridfs
import io
from datetime import datetime
from keys import MONGO_URI

#para tener logs de lo que se hace
import logging
logging.basicConfig(
    filename='servicio.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

app = Flask(__name__)


# Conexión a la base de datos
client = MongoClient(MONGO_URI)
db = client["ia_images"]
fs = gridfs.GridFS(db)
collection = db["images"]


try:
    db = client["ia_images"]  # Nombre de la base de datos que usarás
    db.list_collection_names()  # Esto lanza una consulta real
    print("✅ Conexión exitosa a MongoDB  (base de datos 'ia_images')")
except Exception as e:
    print("❌ Error al conectar con MongoDB :", e)
    

#SUbir imagne a bd ia_images 
@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({"error": "Falta archivo"}), 400

    file = request.files['file']
    filename = file.filename
    uploader = request.form.get('uploader', 'Desconocido')
    tags = request.form.get('tags', '').split(',')

    # Guardar imagen binaria
    image_id = fs.put(file, filename=filename)

    # Guardar metadata
    data = {
        "filename": filename,
        "upload_date": datetime.utcnow().isoformat(),
        "metadata": {
            "uploader": uploader,
            "tags": tags,
            "project": "Advanced Store"
        },
        "image_id": image_id
    }

    result = collection.insert_one(data)
    logging.info(f"Subida de imagen: {filename} por {uploader}, tags: {tags}")
    return jsonify({"message": "Guardado", "id": str(result.inserted_id)}), 201
    


#leer informacion de las imagenes
@app.route('/get/<doc_id>', methods=['GET'])
def get(doc_id):
    try:
        doc = collection.find_one({"_id": ObjectId(doc_id)})
        if not doc:
            return jsonify({"error": "No encontrado"}), 404

        image_file = fs.get(doc["image_id"])
        image_bytes = io.BytesIO(image_file.read())

        return send_file(image_bytes, mimetype='image/jpeg',
                         download_name=doc['filename'])
    except:
        return jsonify({"error": "ID inválido"}), 400


#lista ids + nombre

#editar o actualizar
@app.route('/update/<doc_id>', methods=['PUT'])
def update(doc_id):
    data = request.json
    update_fields = {}

    if "uploader" in data:
        update_fields["metadata.uploader"] = data["uploader"]
    if "tags" in data:
        update_fields["metadata.tags"] = data["tags"]

    result = collection.update_one(
        {"_id": ObjectId(doc_id)},
        {"$set": update_fields}
    )

    if result.modified_count == 0:
        return jsonify({"error": "Nada actualizado"}), 404

    return jsonify({"message": "Actualizado"}), 200


#eliminar la imagen
@app.route('/delete/<doc_id>', methods=['DELETE'])
def delete(doc_id):
    try:
        doc = collection.find_one({"_id": ObjectId(doc_id)})
        if not doc:
            return jsonify({"error": "No encontrado"}), 404

        fs.delete(doc["image_id"])
        collection.delete_one({"_id": ObjectId(doc_id)})

        return jsonify({"message": "Eliminado correctamente"}), 200
    except:
        return jsonify({"error": "ID inválido"}), 400


#definer el host o puerto
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6666, debug=False)
