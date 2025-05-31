import paho.mqtt.client as mqtt
import threading
from mqtt.handler import on_connect, on_message

mqtt_client = mqtt.Client()

def init_mqtt(app):
    def start():
        mqtt_client.on_connect = on_connect
        mqtt_client.on_message = on_message
        mqtt_client.connect(app.config['MQTT_BROKER'], app.config['MQTT_PORT'], 60)
        mqtt_client.loop_forever()

    thread = threading.Thread(target=start)
    thread.daemon = True
    thread.start()