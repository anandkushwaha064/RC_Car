import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Vibration, Platform, TextInput, Alert, ScrollView, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import TcpClient from '../network/TcpClient';

// Simple storage implementation (you can replace with AsyncStorage later)
const SimpleStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      // For now, return null to use defaults
      // In a real app, you'd use AsyncStorage or another storage solution
      return null;
    } catch (error) {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      // For now, just log the values
      // In a real app, you'd save to AsyncStorage or another storage solution
      console.log(`Saving ${key}: ${value}`);
    } catch (error) {
      console.log('Storage error:', error);
    }
  }
};

// Vibration helper function with permission checking
const triggerVibration = async () => {
  try {
    if (Platform.OS === 'android') {
      // For Android, VIBRATE permission is usually granted by default
      // but we'll wrap it in a try-catch to handle any issues gracefully
      Vibration.vibrate(50);
    } else {
      // iOS doesn't require permission for vibration
      Vibration.vibrate(50);
    }
  } catch (error) {
    console.log('Vibration error:', error);
    // Silently fail - vibration is not critical for app functionality
  }
};

// Speed Slider Component using React Native Community Slider
interface SpeedSliderProps {
  value: number;
  onValueChange: (value: number) => void;
}

function SpeedSlider({ value, onValueChange }: SpeedSliderProps) {
  const handleValueChange = (val: number) => {
    const roundedValue = Math.round(val);
    if (roundedValue !== value) {
      onValueChange(roundedValue);
      triggerVibration();
    }
  };

  return (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderWrapper}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={9}
          step={1}
          value={value}
          minimumTrackTintColor="#4CAF50"
          maximumTrackTintColor="#E0E0E0"
          thumbTintColor="#4CAF50"
          onValueChange={handleValueChange}
        />
      </View>
    </View>
  );
}


// Custom Button Component with Press Effects
interface CustomButtonProps {
  title: string;
  onPress: () => void;
  style?: any;
  textStyle?: any;
}

function CustomButton({ title, onPress, style, textStyle }: CustomButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    // Haptic feedback with permission handling
    triggerVibration();
    
    // Scale down animation
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    // Scale back up animation
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.customButton, style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Round Directional Button Component
interface RoundDirectionButtonProps {
  direction: 'up' | 'down' | 'left' | 'right' | 'stop';
  onPress: () => void;
  style?: any;
}

function RoundDirectionButton({ direction, onPress, style }: RoundDirectionButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);
  const commandInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const startSendingCommands = () => {
    if (commandInterval.current) return; // Already sending commands
    
    // Send command immediately
    onPress();
    triggerVibration();
    
    // Set up continuous command sending
    commandInterval.current = setInterval(() => {
      onPress();
    }, 100); // Send command every 100ms while pressed
  };

  const stopSendingCommands = () => {
    if (commandInterval.current) {
      clearInterval(commandInterval.current);
      commandInterval.current = null;
    }
  };

  const handlePressIn = () => {
    setIsPressed(true);
    startSendingCommands();
    
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    stopSendingCommands();
    
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (commandInterval.current) {
        clearInterval(commandInterval.current);
      }
    };
  }, []);

  const getIcon = () => {
    switch (direction) {
      case 'up': return '↑';
      case 'down': return '↓';
      case 'left': return '←';
      case 'right': return '→';
      case 'stop': return '⏹';
      default: return '?';
    }
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.roundDirectionButton, style]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Text style={styles.roundButtonIcon}>{getIcon()}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ControllerScreen() {
  const [connected, setConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Connecting...');
  const [serverIp, setServerIp] = useState('192.168.1.40');
  const [serverPort, setServerPort] = useState('4210');
  const [showSettings, setShowSettings] = useState(false);
  const [tempIp, setTempIp] = useState('192.168.1.40');
  const [tempPort, setTempPort] = useState('4210');
  const [speed, setSpeed] = useState(5); // Default speed (0-9 scale)
  const tcpRef = useRef<TcpClient | null>(null);

  // Load saved settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Initialize TcpClient when server settings change
  useEffect(() => {
    if (serverIp && serverPort) {
      initializeConnection();
    }
  }, [serverIp, serverPort]);

  const loadSettings = async () => {
    try {
      const savedIp = await SimpleStorage.getItem('serverIp');
      const savedPort = await SimpleStorage.getItem('serverPort');
      
      if (savedIp) setServerIp(savedIp);
      if (savedPort) setServerPort(savedPort);
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const saveSettings = async (ip: string, port: string) => {
    try {
      await SimpleStorage.setItem('serverIp', ip);
      await SimpleStorage.setItem('serverPort', port);
      setServerIp(ip);
      setServerPort(port);
      setShowSettings(false);
    } catch (error) {
      console.log('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const initializeConnection = () => {
    if (tcpRef.current) {
      tcpRef.current.disconnect();
    }
    
    const port = parseInt(serverPort, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      Alert.alert('Invalid Port', 'Port must be a number between 1 and 65535');
      return;
    }

    tcpRef.current = new TcpClient(serverIp, port, setConnected);
    
    const connectWithStatus = async () => {
      setStatusMessage('Connecting...');
      if (tcpRef.current) {
        tcpRef.current.connect();
      }
    };
    connectWithStatus();
  };

  const handleSaveSettings = () => {
    const port = parseInt(tempPort, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      Alert.alert('Invalid Port', 'Port must be a number between 1 and 65535');
      return;
    }

    // Basic IP validation
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!ipRegex.test(tempIp) && !hostnameRegex.test(tempIp)) {
      Alert.alert('Invalid IP/Hostname', 'Please enter a valid IP address or hostname');
      return;
    }

    saveSettings(tempIp, tempPort);
  };

  // Watch connected state to show messages
  useEffect(() => {
    if (connected) {
      setStatusMessage('Connected to server ✅');
    } else {
      setStatusMessage('Server not reachable ❌');
    }
  }, [connected]);

  const send = (cmd: string) => {
    if (tcpRef.current && tcpRef.current.isConnected()) {
      tcpRef.current.sendCommand(cmd);
    } else {
      console.log('Cannot send command, server not connected');
    }
  };

  const sendSpeedCommand = (speedValue: number) => {
    if (tcpRef.current && tcpRef.current.isConnected()) {
      tcpRef.current.sendCommand(`${speedValue}`);
    } else {
      console.log('Cannot send speed command, server not connected');
    }
  };

  const handleRetryConnection = () => {
    setStatusMessage('Retrying connection...');
    if (tcpRef.current) {
      tcpRef.current.connect();
    }
  };

  const openSettings = () => {
    setTempIp(serverIp);
    setTempPort(serverPort);
    setShowSettings(true);
  };

  const cancelSettings = () => {
    setShowSettings(false);
  };

  return (
    <View style={styles.container}>
      {/* Header Section - All in One Row */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>Car Controller</Text>
        
        {/* Server Info */}
        <View style={styles.serverInfoContainer}>
          <Text style={styles.serverInfoText}>
            Server: {serverIp}:{serverPort}
          </Text>
          <TouchableOpacity onPress={openSettings} style={styles.settingsButton}>
            <Text style={styles.settingsButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Connection Status Indicator */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: connected ? 'green' : 'red' },
            ]}
          />
          <Text style={styles.statusText}>{statusMessage}</Text>
        </View>
      </View>

      {/* Main Content - Horizontal Layout */}
      <View style={styles.mainContent}>
        {/* Left Side - Speed Controller */}
        <View style={styles.leftPanel}>
          <View style={styles.speedContainer}>
            <Text style={styles.speedLabel}>Speed</Text>
            <View style={styles.speedDisplay}>
              <Text style={styles.speedValue}>{speed}</Text>
              <Text style={styles.speedScale}>/ 9</Text>
            </View>
            
            {/* Horizontal Speed Slider */}
            <SpeedSlider
              value={speed}
              onValueChange={(newSpeed) => {
                setSpeed(newSpeed);
                sendSpeedCommand(newSpeed);
              }}
            />
          </View>
        </View>

        {/* Right Side - Control Buttons */}
        <View style={styles.rightPanel}>
          {/* Light and Horn Controls - Moved Up */}
          <View style={styles.additionalSection}>
            {/* <View style={styles.row}> */}
              <CustomButton title="Backlight ON" onPress={() => send('U')} style={styles.secondaryButton} />
              <CustomButton title="Backlight OFF" onPress={() => send('u')} style={styles.secondaryButton} />
              <CustomButton title="Horn" onPress={() => send('H')} style={styles.hornButton} />
              <CustomButton title="Stop" onPress={() => send('S')} style={styles.stopButton} />
            {/* </View> */}
          </View>

          {/* Movement Controls - Round Directional Buttons */}
          <View style={styles.movementSection}>
            <View style={styles.directionButtonRow}>
              <RoundDirectionButton direction="up" onPress={() => send('F')} style={styles.forwardButton} />
            </View>
            <View style={styles.directionButtonRow}>
              <RoundDirectionButton direction="left" onPress={() => send('L')} style={styles.leftButton} />
              <RoundDirectionButton direction="right" onPress={() => send('R')} style={styles.rightButton} />
            </View>
            <View style={styles.directionButtonRow}>
              <RoundDirectionButton direction="down" onPress={() => send('B')} style={styles.backwardButton} />
            </View>
          </View>

          {/* Retry Button */}
          {!connected && (
            <View style={styles.retryContainer}>
              <CustomButton 
                title="Retry Connection" 
                onPress={handleRetryConnection} 
                style={styles.retryButton} 
              />
            </View>
          )}
        </View>
      </View>

      {/* Settings Modal */}
      {showSettings && (
        <View style={styles.settingsModal}>
          <View style={styles.settingsContent}>
            <Text style={styles.settingsTitle}>Server Settings</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>IP Address or Hostname:</Text>
              <TextInput
                style={styles.textInput}
                value={tempIp}
                onChangeText={setTempIp}
                placeholder="192.168.1.40"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Port:</Text>
              <TextInput
                style={styles.textInput}
                value={tempPort}
                onChangeText={setTempPort}
                placeholder="4210"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>

            <View style={styles.settingsButtons}>
              <CustomButton
                title="Cancel"
                onPress={cancelSettings}
                style={styles.cancelButton}
              />
              <CustomButton
                title="Save"
                onPress={handleSaveSettings}
                style={styles.saveButton}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: { 
    // flex: 1, 
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  headerSection: {
    height:'13%',
    width:'100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1%',
    paddingHorizontal: 5,
  },
  mainContent: {
    // flex: 1,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 10,
    backgroundColor: '#FAFAFA',
    height:'85%',
    width:'100%',
  },
  leftPanel: {
    // flex: 0.3,
    width: '10%',
    // borderWidth: 1,
    // borderColor: '#4CAF50',
    borderRadius: 10,
    padding: 5,
  },
  rightPanel: {
    // flex: 0.7,
    // marginLeft: -350,
    width: '88%',
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 10,
    padding: 5,
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  movementSection: {
    height:'100%',
    width: '55%',
    
    // marginBottom: 15,
    marginTop: '5%',
    // borderWidth: 1,
    // borderColor: '#E0E0E0',
  },
  additionalSection: {
    height:'100%',
    width: '35%',
    // borderWidth: 1,
    // borderColor: '#E0E0E0',
  },
  row: { 
    flexDirection: 'column', 
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold',
    color: '#333',
    flex: 0.5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '2%',
    paddingVertical: '1%',
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    // flex: 0.3,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: { 
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  customButton: {
    paddingHorizontal: '2%',
    paddingVertical: '5%',
    margin:'3%',
    borderRadius: 10,
    marginHorizontal: 10,
    width:'80%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#45A049',
  },
  directionButton: {
    backgroundColor: '#2196F3',
    borderColor: '#1976D2',
  },
  stopButton: {
    backgroundColor: '#f44336',
    borderColor: '#D32F2F',
  },
  secondaryButton: {
    backgroundColor: '#FF9800',
    borderColor: '#F57C00',
  },
  hornButton: {
    backgroundColor: '#9C27B0',
    borderColor: '#7B1FA2',
  },
  retryContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    borderColor: '#1976D2',
  },
  serverInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: '2%',
    paddingVertical: '0.4%',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#4CAF50',
    // flex: 0.,
  },
  serverInfoText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  settingsButton: {
    padding: 5,
  },
  settingsButtonText: {
    fontSize: 18,
  },
  settingsModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 3,
    borderColor: '#2196F3',
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  settingsButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#757575',
    borderColor: '#616161',
    flex: 0.45,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#45A049',
    flex: 0.45,
  },


  speedContainer: {
    width:'100%',
    height: '100%',
    // backgroundColor: 'white',
    // borderRadius: 10,
    padding: 10,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
    // borderWidth: 2,
    // borderColor: '#4CAF50',
    // justifyContent: 'space-between',
  },
  speedLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: '-40%',
    marginBottom: '0.5%',
    color: '#333',
  },
  speedDisplay: {
    marginTop: '-40%',
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 5,
    height: 30,
  },
  speedValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  speedScale: {
    fontSize: 16,
    color: '#666',
    marginLeft: 2,
  },
  // Speed Slider Styles (Vertical)
  sliderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '-11%',
    // marginBottom: 10,
    width: '100%',
    height: '90%',
    paddingVertical: '1%',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sliderWrapper: {
    width: '60%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: {
    width: 200,
    height: 80,
    transform: [{ rotate: '90deg' }],
  },
  // Round Directional Button Styles
  roundDirectionButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  roundButtonIcon: {
    fontSize: 60,
    fontWeight: 'bold',
    color: 'white',
  },
  directionButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 15,
  },
  forwardButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#45A049',
    marginRight:'1%',
    marginLeft:'55%'
  },
  backwardButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#45A049',
    marginTop:'-20%',
    marginLeft:'55%'
  },
  leftButton: {
    backgroundColor: '#2196F3',
    borderColor: '#1976D2',
    marginRight:'5%',
    marginLeft:'32%',
    marginTop:'-30%'
  },
  rightButton: {
    backgroundColor: '#2196F3',
    borderColor: '#1976D2',
    marginLeft:'7%',
    marginTop:'-48%'
  },
  stopRoundButton: {
    backgroundColor: '#f44336',
    borderColor: '#D32F2F',
  },
});
