import requests

# Replace with the IP address shown by your ESP32-CAM
ESP32_CAM_URL = 'http://192.168.211.106/capture'

# Save location
filename = 'esp32_image.jpg'

# Capture and save image
response = requests.get(ESP32_CAM_URL)

if response.status_code == 200:
    with open(filename, 'wb') as f:
        f.write(response.content)
    print(f"Image saved to {filename}")
else:
    print("Failed to capture image")
