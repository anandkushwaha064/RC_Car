#include <ESP8266WiFi.h>

const char* ssid = "Airtel";
const char* password = "Eer#427&^!.#$";

WiFiServer server(4210);

void setup() {
  Serial.begin(115200);      // USB serial for debug
  Serial1.begin(9600);       // TX pin (GPIO2) for Arduino (you can pick another UART pin if needed)

  WiFi.begin(ssid, password);

  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected! IP: ");
  Serial.println(WiFi.localIP());

  server.begin();
  Serial.println("TCP server started...");
}

void loop() {
  WiFiClient client = server.available(); 
  if (client) {
    Serial.println("Client connected.");
    while (client.connected()) {
      if (client.available()) {
        char c = client.read();
        if (c > 0 && c != '\n') {    // ignore newline
          Serial.printf("Received: %c\n", c);

          // Forward single char to Arduino
          Serial1.write(c);
        }
      }
      yield();
    }
    client.stop();
    Serial.println("Client disconnected.");
  }
}
