---

# Binarizacion de imágenes Gridfs + Mongodb

---

### 1. **Importaciones**

```python
from flask import Flask, request, jsonify, send_file
from pymongo import MongoClient
from bson.objectid import ObjectId
import gridfs
import io
from datetime import datetime
from keys import MONGO_URI
```

- `Flask`: framework para crear una API REST.
    
- `request`: para manejar datos que llegan en las solicitudes HTTP.
    
- `jsonify`: para responder en formato JSON.
    
- `send_file`: para enviar archivos (aquí imágenes).
    
- `MongoClient`: para conectar a MongoDB.
    
- `ObjectId`: para convertir strings en IDs válidos de MongoDB.
    
- `gridfs`: para guardar y recuperar archivos grandes dentro de MongoDB.
    
- `io`: para manipular datos en memoria (como archivos temporales).
    
- `datetime`: para manejar fechas.
    
- `MONGO_URI`: la cadena de conexión secreta para MongoDB, la cargas de un archivo externo `keys.py`.
    

---

### 2. **Configuración de logs**

```python
import logging
logging.basicConfig(
    filename='servicio.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
```

- Configuras un archivo de registro llamado `servicio.log`.
    
- Guardará todas las acciones importantes con fecha, nivel (INFO, ERROR) y mensaje.
    
- Esto te sirve para luego revisar qué pasó en el servidor.
    

---

### 3. **Crear la app Flask**

```python
app = Flask(__name__)
```

- Inicializas la aplicación Flask, que recibirá y responderá a las peticiones HTTP.
    

---

### 4. **Conexión a MongoDB y GridFS**

```python
client = MongoClient(MONGO_URI)  # conecta al servidor MongoDB con la URI
db = client["ia_images"]         # selecciona la base de datos 'ia_images'
fs = gridfs.GridFS(db)           # instancia GridFS para guardar archivos grandes (imágenes)
collection = db["images"]        # colección para guardar metadatos de las imágenes
```

- `MongoClient`: crea la conexión a MongoDB.
    
- `db`: selecciona la base de datos.
    
- `fs`: GridFS te permite guardar archivos binarios (imágenes) en MongoDB.
    
- `collection`: aquí se guardan los datos (nombre archivo, tags, uploader, etc).
    

---

### 5. **Probar la conexión**

```python
try:
    db = client["ia_images"]
    db.list_collection_names()
    print("✅ Conexión exitosa a MongoDB Atlas (base de datos 'ia_images')")
except Exception as e:
    print("❌ Error al conectar con MongoDB Atlas:", e)
```

- Haces una consulta simple para probar que la base de datos responde.
    
- Si funciona, imprime mensaje exitoso.
    
- Si falla, imprime el error.
    

---

### 6. **Ruta `/upload` para subir imagen (POST)**

```python
@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({"error": "Falta archivo"}), 400
```

- Si en la solicitud no hay archivo bajo la clave `'file'`, responde con error 400 (Bad Request).
    

```python
    file = request.files['file']
    filename = file.filename
    uploader = request.form.get('uploader', 'Desconocido')
    tags = request.form.get('tags', '').split(',')
```

- Obtiene el archivo enviado.
    
- Extrae el nombre del archivo.
    
- Obtiene el nombre de quien sube (campo opcional, default 'Desconocido').
    
- Obtiene las etiquetas (tags) como string separado por comas y lo convierte en lista.
    

```python
    image_id = fs.put(file, filename=filename)
```

- Guarda el archivo en GridFS.
    
- `image_id` es el ID interno que Mongo genera para ese archivo binario.
    

```python
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
```

- Prepara un diccionario con los datos que quieres guardar:
    
    - Nombre del archivo.
        
    - Fecha y hora actual UTC.
        
    - Metadata con uploader, tags y un nombre fijo de proyecto.
        
    - El ID del archivo en GridFS.
        

```python
    result = collection.insert_one(data)
    logging.info(f"Subida de imagen: {filename} por {uploader}, tags: {tags}")
    return jsonify({"message": "Guardado", "id": str(result.inserted_id)}), 201
```

- Inserta este documento en la colección.
    
- Guarda en el log la subida.
    
- Devuelve un JSON con mensaje de éxito y el ID generado para el documento (no el de la imagen, sino el del documento metadata).
    
- Código HTTP 201 indica creación exitosa.
    

---

### 7. **Ruta `/get/<doc_id>` para obtener imagen (GET)**

```python
@app.route('/get/<doc_id>', methods=['GET'])
def get(doc_id):
    try:
        doc = collection.find_one({"_id": ObjectId(doc_id)})
        if not doc:
            return jsonify({"error": "No encontrado"}), 404
```

- Convierte `doc_id` a tipo ObjectId para buscar el documento.
    
- Si no existe, responde error 404 (no encontrado).
    

```python
        image_file = fs.get(doc["image_id"])
        image_bytes = io.BytesIO(image_file.read())
```

- Obtiene el archivo guardado en GridFS usando el `image_id` que está en el documento.
    
- Lee el archivo y lo pone en un buffer en memoria para poder enviarlo.
    

```python
        return send_file(image_bytes, mimetype='image/jpeg',
                         download_name=doc['filename'])
```

- Envía la imagen al cliente con el tipo MIME `image/jpeg` (puedes ajustar según tipo real).
    
- Le pone como nombre para descarga el nombre original del archivo.
    

```python
    except:
        return jsonify({"error": "ID inválido"}), 400
```

- Si falla la conversión o no es un ID válido, devuelve error 400.
    

---

### 8. **Ruta `/update/<doc_id>` para actualizar metadata (PUT)**

```python
@app.route('/update/<doc_id>', methods=['PUT'])
def update(doc_id):
    data = request.json
    update_fields = {}
```

- Recibe datos JSON en el cuerpo con los campos a actualizar.
    
- Prepara un diccionario vacío donde se guardarán los cambios.
    

```python
    if "uploader" in data:
        update_fields["metadata.uploader"] = data["uploader"]
    if "tags" in data:
        update_fields["metadata.tags"] = data["tags"]
```

- Solo actualiza si vienen `uploader` o `tags` en la petición.
    

```python
    result = collection.update_one(
        {"_id": ObjectId(doc_id)},
        {"$set": update_fields}
    )
```

- Busca el documento con `_id` igual a `doc_id`.
    
- Actualiza solo los campos que se definieron en `update_fields`.
    

```python
    if result.modified_count == 0:
        return jsonify({"error": "Nada actualizado"}), 404

    return jsonify({"message": "Actualizado"}), 200
```

- Si no actualizó nada (documento no existe o mismos datos), devuelve error 404.
    
- Si actualizó, devuelve mensaje de éxito.
    

---

### 9. **Ruta `/delete/<doc_id>` para borrar imagen y datos (DELETE)**

```python
@app.route('/delete/<doc_id>', methods=['DELETE'])
def delete(doc_id):
    try:
        doc = collection.find_one({"_id": ObjectId(doc_id)})
        if not doc:
            return jsonify({"error": "No encontrado"}), 404
```

- Busca documento con el ID.
    
- Si no lo encuentra, error 404.
    

```python
        fs.delete(doc["image_id"])
        collection.delete_one({"_id": ObjectId(doc_id)})
```

- Borra el archivo en GridFS usando el ID del archivo.
    
- Borra el documento de metadatos en la colección.
    

```python
        return jsonify({"message": "Eliminado correctamente"}), 200
    except:
        return jsonify({"error": "ID inválido"}), 400
```

- Devuelve mensaje de éxito si todo salió bien.
    
- Si falla (ID inválido, etc), error 400.
    

---

### 10. **Ejecutar la app**
Si quieres te ayudo a armar pruebas con curl o Postman para cada uno. ¿Quieres?
```python
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6666, debug=False)
```

- Inicia la app para que escuche en todas las IPs en el puerto 6666.
    
- `debug=False` para no mostrar errores en el navegador (modo producción).
    

---

# Resumen de lo que hace cada endpoint

|Endpoint|Método|Qué recibe|Qué hace|Respuesta|
|---|---|---|---|---|
|`/upload`|POST|Archivo en `file`, y datos opcionales|Guarda imagen en GridFS y metadata en colección|JSON con mensaje y ID creado|
|`/get/<doc_id>`|GET|ID del documento en URL|Recupera metadata y archivo para enviar imagen|Imagen JPEG o error|
|`/update/<doc_id>`|PUT|JSON con campos `uploader` y/o `tags`|Actualiza metadata de la imagen|JSON con mensaje éxito o error|
|`/delete/<doc_id>`|DELETE|ID del documento en URL|Borra imagen y metadata|JSON con mensaje éxito o error|

---

### Endpoint: `POST http://localhost:5000/upload`

1. En Postman, selecciona método `POST`
    
2. En la URL pon:
    
    ```
    http://localhost:5000/upload
    ```
    
3. Ve a pestaña **Body**
    
4. Selecciona **form-data**
    
5. Agrega los siguientes campos:
    

|Key|Type|Value|
|---|---|---|
|file|File|Selecciona una imagen|
|uploader|Text|Diego Andres|
|tags|Text|raspberry,ai,store|

6. Haz clic en **Send**
    

📦 Respuesta esperada:

```json
{
  "message": "Guardado",
  "id": "6650423ab1209cf72c7d5d44"
}
```

---

### 🔵 Para **GET** (ver imagen):

- Método: `GET`
    
- URL:
    
    ```
    http://localhost:5000/get/6650423ab1209cf72c7d5d44
    ```
    

⬇️ Te descarga o muestra la imagen.

---

### ✏️ Para **UPDATE**:

- Método: `PUT`
    
- URL:
    
    ```
    http://localhost:5000/update/6650423ab1209cf72c7d5d44
    ```
    
- Body → `raw` → JSON → `application/json`:
    

```json
{
  "uploader": "Pepe Sand",
  "tags": ["iot", "final", "universidad"]
}
```

---

### 🗑️ Para **DELETE**:

- Método: `DELETE`
    
- URL:
    
    ```
    http://localhost:5000/delete/6650423ab1209cf72c7d5d44
    ```
    

---

## ¿Cómo hacer ingreso de datos desde **Postman**?

### 🟢 Endpoint: `POST http://localhost:6666/upload`

1. En Postman, selecciona método `POST`
    
2. En la URL pon:
    
    ```
    http://localhost:6666/upload
    ```
    
3. Ve a pestaña **Body**
    
4. Selecciona **form-data**
    
5. Agrega los siguientes campos:
    

|Key|Type|Value|
|---|---|---|
|file|File|Selecciona una imagen|
|uploader|Text|Diego Andres|
|tags|Text|raspberry,ai,store|

6. Haz clic en **Send**
    

📦 Respuesta esperada:

```json
{
  "message": "Guardado",
  "id": "6650423ab1209cf72c7d5d44"
}
```

---

### 🔵 Para **GET** (ver imagen):

- Método: `GET`
    
- URL:
    
    ```
    http://localhost:6666/get/6650423ab1209cf72c7d5d44
    ```
    

⬇️ Te descarga o muestra la imagen.

---

### ✏️ Para **UPDATE**:

- Método: `PUT`
    
- URL:
    
    ```
    http://localhost:6666/update/6650423ab1209cf72c7d5d44
    ```
    
- Body → `raw` → JSON → `application/json`:
    

```json
{
  "uploader": "Pepe Sand",
  "tags": ["iot", "final", "universidad"]
}
```

---

### 🗑️ Para **DELETE**:

- Método: `DELETE`
    
- URL:
    
    ```
    http://localhost:6666/delete/6650423ab1209cf72c7d5d44
    ```
    

    
## ✅ **Desde FastAPI (cliente o microservicio)**

En FastAPI puedes usar `httpx` o `requests` para hacer la conexión.

```python
from fastapi import FastAPI, UploadFile, Form
import requests

app = FastAPI()

@app.post("/reenviar/")
async def reenviar(file: UploadFile, uploader: str = Form(...), tags: str = Form(...)):
    files = {'file': (file.filename, await file.read(), file.content_type)}
    data = {'uploader': uploader, 'tags': tags}

    response = requests.post("http://localhost:6666/upload", files=files, data=data)

    return {
        "status": response.status_code,
        "response": response.json()
    }

```

## ✅ **Conectarlo desde otro Flask (como cliente)**

Desde otro servidor Flask puedes hacer peticiones HTTP con `requests`:

```python
import requests

url = "http://localhost:5000/upload"
files = {'file': open('foto.jpg', 'rb')}
data = {'uploader': 'Otro Backend', 'tags': 'api,client'}

response = requests.post(url, files=files, data=data)

if response.status_code == 201:
    print("✅ Imagen enviada al otro servicio:", response.json())
else:
    print("❌ Error:", response.text)

```

## ✅ **Integrar desde React (Frontend en JS)**

En React usarías `fetch` o `axios` para conectarte al backend Flask.

### 📦 Subir imagen desde un formulario React

```jsx
import React, { useState } from 'react';
import axios from 'axios';

function UploadImage() {
  const [file, setFile] = useState(null);
  const [uploader, setUploader] = useState("Diego Andres");
  const [tags, setTags] = useState("iot,ai");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploader", uploader);
    formData.append("tags", tags);

    try {
      const res = await axios.post("http://localhost:5000/upload", formData);
      console.log("Imagen subida:", res.data);
    } catch (err) {
      console.error("Error al subir imagen", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <input type="text" value={uploader} onChange={(e) => setUploader(e.target.value)} />
      <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} />
      <button type="submit">Subir Imagen</button>
    </form>
  );
}

export default UploadImage;

```

