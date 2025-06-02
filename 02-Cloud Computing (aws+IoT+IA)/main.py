import paho.mqtt.client as mqtt
import requests
import boto3
import json

# === CONFIGURACIÓN MQTT ===
BROKER = "127.0.0.1"  # Cambia por la IP real de tu broker Mosquitto
PORT = 1883
TOPIC_SUBSCRIBE = "sensor/temp"
TOPIC_VENTILADOR = "climate/fan/set"
TOPIC_BOMBILLO = "climate/light/set"
TOPIC_NOTIFICATION = "notifications/mobile"
API_DB = "http://localhost:5000/api/data"  # API Flask de Yefer

# === CONFIGURACIÓN AWS LAMBDA ===
lambda_client = boto3.client('lambda', region_name='us-east-1')  # Cambia región si es necesario
LAMBDA_NAME = "TempAlert"  # Cambia por el nombre real de tu función Lambda

# === FUNCIONES AWS ===
def invocar_lambda(temp, autorizado=True):
    payload = {
        'temp': temp,
        'autorizado': autorizado
    }

    try:
        response = lambda_client.invoke(
            FunctionName=LAMBDA_NAME,
            InvocationType='RequestResponse',
            Payload=json.dumps(payload)
        )
        # Decodificar correctamente la respuesta
        result = json.loads(response['Payload'].read().decode('utf-8'))
        print("🧠 Respuesta Lambda:", result)
        return result
    except Exception as e:
        print("❌ Error al invocar Lambda:", e)
        return {"accion": "error", "acceso": "desconocido"}

# === CALLBACKS MQTT ===
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Conectado a Mosquitto con código:", rc)
        client.subscribe(TOPIC_SUBSCRIBE)
    else:
        print(f"❌ Falló la conexión, código: {rc}")

def on_message(client, userdata, msg):
    payload = msg.payload.decode()
    topic = msg.topic
    print(f"[📩 {topic}] => {payload}")

    if topic == TOPIC_SUBSCRIBE:
        try:
            temp = float(payload)
            procesar_temp(temp, client)
        except ValueError:
            print("❌ Error: Payload no es número.")

# === LÓGICA DE TEMPERATURA CON LAMBDA ===
def procesar_temp(temp, client):
    print(f"🌡️ Temperatura: {temp}°C")

    # Guardar en BD
    try:
        response = requests.post(API_DB, json={"temp": temp})
        response.raise_for_status()
        print("🗂️ Enviado a API Flask")
    except Exception as e:
        print(f"⚠️ No se pudo enviar a la API: {e}")

    # Lógica con Lambda
    respuesta = invocar_lambda(temp, autorizado=True)

    accion = respuesta.get("accion", "nada")

    # ACTUAR SEGÚN RESPUESTA DE LAMBDA
    if accion == "Encender ventilador":
        client.publish(TOPIC_VENTILADOR, "ON")
        client.publish(TOPIC_BOMBILLO, "OFF")
        client.publish(TOPIC_NOTIFICATION, "🔥 Alta temperatura. Ventilador encendido.")
        print("💨 Ventilador: ON")

    elif accion == "Encender bombillo":
        client.publish(TOPIC_BOMBILLO, "ON")
        client.publish(TOPIC_VENTILADOR, "OFF")
        client.publish(TOPIC_NOTIFICATION, "❄️ Temperatura baja. Bombillo encendido.")
        print("💡 Bombillo: ON")

    else:
        client.publish(TOPIC_BOMBILLO, "OFF")
        client.publish(TOPIC_VENTILADOR, "OFF")
        print("🌤️ Temperatura normal o error. Todo apagado.")

# === INICIAR MQTT ===
def main():
    # Crear cliente MQTT con versión de callback compatible
    try:
        client = mqtt.Client(client_id="", callback_api_version=mqtt.CallbackAPIVersion.VERSION1)
    except AttributeError:
        # Si la versión de paho no soporta callback_api_version, crear cliente normal
        client = mqtt.Client()

    client.on_connect = on_connect
    client.on_message = on_message

    print(f"🔌 Conectando a broker MQTT {BROKER}:{PORT}...")
    client.connect(BROKER, PORT, 60)

    # Usar loop_start para no bloquear el hilo principal
    client.loop_start()

    try:
        while True:
            # Aquí puedes hacer otras tareas si quieres
            pass
    except KeyboardInterrupt:
        print("🛑 Deteniendo cliente MQTT...")
    finally:
        client.loop_stop()
        client.disconnect()
        print("Desconectado.")

if __name__ == "__main__":
    main()
