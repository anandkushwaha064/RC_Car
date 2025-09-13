import socket
import keyboard
import time

TCP_IP = "192.168.1.3"  # NodeMCU IP
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

try:
    while True:
        if keyboard.is_pressed("esc"):
            print("Exiting...")
            break

        event = keyboard.read_event()
        command = "S"
        if event.event_type == keyboard.KEY_DOWN:
            key = event.name.upper()
            if key in KEY_MAP:
                command = KEY_MAP[key]
                sock.sendall((command + "\n").encode())
                print(f" => Sent: {command}")
                continue
            
        # sock.sendall((command + "\n").encode())
        # print(f"Sent: {command}")           

except KeyboardInterrupt:
    pass
finally:
    sock.close()


