import json
import paho.mqtt.client as mqtt
from utils import encode_image

image_b64 = encode_image("i.jpg")
payload = json.dumps({"image": image_b64})

client = mqtt.Client()
client.connect("localhost", 1883, 60)
client.publish("imagen/entrada", payload)
print("📤 Imagen enviada")