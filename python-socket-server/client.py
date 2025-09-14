import socket
import keyboard
import time

SERVER_IP = "192.168.1.40"   # Python server IP
SERVER_PORT = 4210           # Same port as your server

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.settimeout(5)  # timeout so we don’t hang forever

try:
    sock.connect((SERVER_IP, SERVER_PORT))
    print("✅ Connected to server")

    # Identify this client as a controller
    sock.sendall(b"HELLO_CONTROLLER\n")

    # Wait for ACK from server
    response = sock.recv(1024).decode(errors="ignore").strip()
    if response == "ACK_CONTROLLER":
        print("✅ Server acknowledged controller")
    else:
        print(f"⚠️ Unexpected response: {response}")

except Exception as e:
    print("❌ Connection failed:", e)
    sock.close()


print("Press W/S/A/D for movement, F=Stop, B=Backlight ON, N=Backlight OFF, H=Horn, ESC to quit")

KEY_MAP = {
    "W": "F",  # Forward
    "S": "B",  # Back           
    "A": "L",  # Left
    "D": "R",  # Right
    "F": "S",  # Stop
    "B": "U",  # Backlight ON
    "N": "u",  # Backlight OFF
    "H": "H",  # Horn
    "1": "1",
    "2": "2",      
    "3": "3",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "8": "8",
    "9": "9",
    "0": "0"
}

last_command = None  # Track last command sent

try:
    while True:
        if keyboard.is_pressed("esc"):
            print("Exiting...")
            break

        # Default command
        command = "S"

        for key, mapped in KEY_MAP.items():
            if keyboard.is_pressed(key.lower()):
                command = mapped
                break

        # Send only if changed
        if command != last_command:
            try:
                sock.sendall((command + "\n").encode())
                print(f" => Sent: {command}")
                last_command = command
            except BrokenPipeError:
                print("Server connection lost!")
                break

        time.sleep(0.05)  # 20Hz loop

except KeyboardInterrupt:
    pass
finally:
    sock.close()
