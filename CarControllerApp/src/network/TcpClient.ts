// src/network/TcpClient.ts
import TcpSocket from 'react-native-tcp-socket';
import { Buffer } from 'buffer';


type StatusCallback = (connected: boolean) => void;

class TcpClient {
  private client: any = null;
  private host: string;
  private port: number;
  private onStatusChange: StatusCallback | null = null;
  private reconnectInterval: number = 3000; // 3 seconds
  private reconnectTimeout: NodeJS.Timeout | null = null;
  public isConnected = (): boolean => !!this.client;

  constructor(host: string, port: number, onStatusChange?: StatusCallback) {
    this.host = host;
    this.port = port;
    if (onStatusChange) this.onStatusChange = onStatusChange;
  }

  private setupClient = () => {
    this.client = TcpSocket.createConnection({ host: this.host, port: this.port, tls: false }, () => {
      console.log('✅ Connected to server');
      this.onStatusChange?.(true);
      this.sendCommand('HELLO_CONTROLLER');
    });

    this.client.on('data', (data: Buffer) => {
      console.log('Received from server:', data.toString());
    });

    this.client.on('error', (error: any) => {
      console.log('⚠️ TCP Error:', error);
      this.cleanupClient();
      this.scheduleReconnect();
    });

    this.client.on('close', () => {
      console.log('⚠️ Connection closed');
      this.cleanupClient();
      this.scheduleReconnect();
    });
  };

  public connect = () => {
    this.cleanupClient(); // ensure old client is cleared
    this.setupClient();
  };

  private cleanupClient = () => {
    if (this.client) {
      this.client.destroy();
      this.client = null;
    }
    this.onStatusChange?.(false);
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  };

  private scheduleReconnect = () => {
    if (!this.reconnectTimeout) {
      console.log(`🔄 Reconnecting in ${this.reconnectInterval / 1000}s...`);
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectTimeout = null;
        this.connect();
      }, this.reconnectInterval);
    }
  };

  public sendCommand = (command: string) => {
    if (this.client) {
      console.log('Sending command:', command);
      this.client.write(command + '\n');
    } else {
      console.log('Cannot send command, not connected');
    }
  };

  public disconnect = () => {
    this.cleanupClient();
  };
}

export default TcpClient;
