import socket
import threading

HOST = "0.0.0.0"
PORT = 4210

node_mcu_conn = None
lock = threading.Lock()

def handle_client(conn, addr):
    global node_mcu_conn

    print(f"[NEW CONNECTION] {addr}")

    try:
        while True:
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
                        node_mcu_conn.sendall((message + "\n").encode())
                        print(f"[FORWARDED to NodeMCU] {message}")
                    except Exception as e:
                        print("[ERROR] Could not send to NodeMCU:", e)
                        node_mcu_conn = None
                else:
                    print("[WARNING] No NodeMCU connected, command ignored.")

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
