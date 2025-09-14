import socket
import threading
import select
import time

HOST = "0.0.0.0"
PORT = 4210

node_mcu_conn = None
lock = threading.Lock()

def handle_client(conn, addr):
    global node_mcu_conn
    global previous_command
    previous_command = 'S\n'

    print(f"[NEW CONNECTION] {addr}")

    try:
        while True:
            
            # Use select to check if data is available without blocking
            ready, _, _ = select.select([conn], [], [], 0.5)  # 1 second timeout
            
            if ready:
                # Data is available, receive it
                data = conn.recv(1024)
                if not data:
                    break

                message = data.decode(errors="ignore").strip()
                if not message:
                    continue

                print(f"[MESSAGE from {addr}] {message}")

                if message == "HELLO_NODEMCU":
                    # Register NodeMCU
                    with lock:
                        node_mcu_conn = conn
                    print("[INFO] NodeMCU registered.")
                    continue

                if message == "HELLO_CONTROLLER":
                    conn.sendall(b"ACK_CONTROLLER\n")
                    print("[INFO] Controller connected.")
                    continue

                # Otherwise, it's a controller command
                with lock:
                    if node_mcu_conn:
                        try:
                            command = (message + "\n").encode()
                            if command!=previous_command:
                                node_mcu_conn.sendall(command)
                                previous_command = command
                            print(f"[FORWARDED to NodeMCU] {message}")
                        except Exception as e:
                            print("[ERROR] Could not send to NodeMCU:", e)
                            node_mcu_conn = None
                    else:
                        print("[WARNING] No NodeMCU connected, command ignored.")
            else:
                # No data available, check if we should send 'S' to NodeMCU
                with lock:
                    if node_mcu_conn and node_mcu_conn != conn:
                        try:
                            message = b"S\n"
                            if message!=previous_command:
                                node_mcu_conn.sendall(message)
                                previous_command = message
                                print("[INFO] Sent 'S' to NodeMCU (no data available)")
                        except Exception as e:
                            print("[ERROR] Could not send 'S' to NodeMCU:", e)
                            node_mcu_conn = None
                
                # Small delay to prevent excessive CPU usage
                time.sleep(0.1)

    except ConnectionResetError:
        print(f"[ERROR] Connection reset by {addr}")

    finally:
        conn.close()
        print(f"[DISCONNECTED] {addr}")


def start_server():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((HOST, PORT))
    server.listen(5)
    print(f"[LISTENING] Server running on {HOST}:{PORT}")

    while True:
        conn, addr = server.accept()
        thread = threading.Thread(target=handle_client, args=(conn, addr), daemon=True)
        thread.start()


if __name__ == "__main__":
    start_server()
