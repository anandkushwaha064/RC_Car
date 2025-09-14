import socket
import keyboard
import time

TCP_IP = "192.168.10.8"  # NodeMCU IP
TCP_PORT = 4210

# Create TCP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect((TCP_IP, TCP_PORT))

print("Press W/S/A/D for movement, L=Stop, B=Backlight ON, N=Backlight OFF, ESC to quit")

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

        # Default to STOP unless a key is pressed
        command = "S"

        for key, mapped in KEY_MAP.items():
            if keyboard.is_pressed(key.lower()):
                command = mapped
                break

        # Only send if command changes (avoid spamming same value)
        if command != last_command:
            sock.sendall((command + "\n").encode())
            print(f" => Sent: {command}")
            last_command = command

        time.sleep(0.05)  # small throttle (20 times/sec)


except KeyboardInterrupt:
    pass
finally:
    sock.close()


