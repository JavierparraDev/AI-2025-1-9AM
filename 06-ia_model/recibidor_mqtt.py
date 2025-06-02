import face_recognition
import base64
import json
import paho.mqtt.client as mqtt
from utils import decode_image
from ultralytics import YOLO

# Carga rostro autorizado
known_image = face_recognition.load_image_file("prueba.jpg")
known_encoding = face_recognition.face_encodings(known_image)[0]

# Carga modelo YOLOv8 (asegúrate de haber descargado yolov8n.pt o usa yolov8s.pt)
model = YOLO("yolov8n.pt")

def on_connect(client, userdata, flags, rc):
    print("✅ Conectado a MQTT")
    client.subscribe("imagen/entrada")

def on_message(client, userdata, msg):
    print("📥 Imagen recibida")
    data = json.loads(msg.payload.decode())
    image = decode_image(data['image'])

    # 1) Reconocimiento facial
    faces = face_recognition.face_encodings(image)
    if faces:
        match = face_recognition.compare_faces([known_encoding], faces[0])[0]
        if match:
            print("🔐 AUTORIZADO ✅")
        else:
            print("❌ DENEGADO: Rostro no autorizado")
    else:
        print("🚫 No se detectó rostro")

    # 2) Detección de objetos con YOLOv8
    results = model(image)
    detected = []
    for r in results:
        for box in r.boxes:
            cls = int(box.cls[0])
            label = model.names[cls]
            conf = float(box.conf[0])
            if label in ['person', 'dog']:
                detected.append((label, conf))

    if detected:
        for label, conf in detected:
            print(f"🟢 Detectado: {label} ({conf:.2f})")
    else:
        print("⚠️ No se detectaron personas ni perros")

    # Opcional: mostrar imagen con cajas
    # results[0].show()

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.connect("localhost", 1883, 60)
client.loop_forever()
