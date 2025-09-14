#include <ESP8266WiFi.h>

const char* ssid = "Cybernet";
const char* password = "Ott6JqYlB@ds34#";

const char* host = "192.168.1.40";   // <-- Replace with your Python server IP
const uint16_t port = 4210;

WiFiClient client;

void setup() {
  Serial.begin(115200);     // USB serial debug
  Serial1.begin(9600);      // TX to Arduino

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected! IP: ");
  Serial.println(WiFi.localIP());

  connectToServer();
}

void loop() {
  // If disconnected, try to reconnect
  if (!client.connected()) {
    Serial.println("Disconnected. Reconnecting...");
    connectToServer();
    delay(2000);
    return;
  }

  // Read data from server
  while (client.available()) {
    char c = client.read();
    if (c > 0 && c != '\n') {
      Serial.printf("Received from server: %c\n", c);
      Serial1.write(c);  // Forward to Arduino
    }
  }

  yield();
}

void connectToServer() {
  Serial.printf("Connecting to server %s:%d...\n", host, port);

  if (client.connect(host, port)) {
    Serial.println("Connected to server.");
    client.println("HELLO_NODEMCU");   // identify itself
  } else {
    Serial.println("Connection failed. Retrying...");
  }
}
