from flask import current_app
from services.face_recognition import process_face_image
from utils.mongo import save_image_to_gridfs


def on_connect(client, userdata, flags, rc):
    print(f"[MQTT] Connected with result code {rc}")
    client.subscribe("camara/foto")
    client.subscribe("sensor/temperatura")


def on_message(client, userdata, msg):
    print(f"[MQTT] Topic: {msg.topic} | Payload size: {len(msg.payload)} bytes")
    if msg.topic == "camara/foto":
        image_id = save_image_to_gridfs(current_app, msg.payload)
        process_face_image(current_app, image_id)