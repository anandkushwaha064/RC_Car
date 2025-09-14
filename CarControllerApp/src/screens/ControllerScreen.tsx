import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Vibration, Platform, TextInput, Alert, ScrollView, Dimensions } from 'react-native';
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

// Custom Scrollable Speed Picker Component
interface SpeedPickerProps {
  value: number;
  onValueChange: (value: number) => void;
}

function SpeedPicker({ value, onValueChange }: SpeedPickerProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const itemHeight = 60;
  const paddingTop = itemHeight * 1.5; // Top padding height
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  
  useEffect(() => {
    // Scroll to current value when component mounts
    const timer = setTimeout(() => {
      if (scrollViewRef.current && !isUserScrolling) {
        const scrollY = paddingTop + (value * itemHeight);
        console.log(`Initial scroll to: ${scrollY} for value: ${value}`);
        scrollViewRef.current.scrollTo({ y: scrollY, animated: false });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [value, isUserScrolling]);

  const handleScrollBeginDrag = () => {
    setIsUserScrolling(true);
  };

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    // Account for top padding
    const adjustedScrollY = scrollY - paddingTop;
    const newValue = Math.round(adjustedScrollY / itemHeight);
    const clampedValue = Math.max(0, Math.min(9, newValue));
    
    console.log(`Scroll: ${scrollY}, Adjusted: ${adjustedScrollY}, Value: ${clampedValue}, Current: ${value}`);
    
    if (clampedValue !== value && clampedValue >= 0 && clampedValue <= 9) {
      onValueChange(clampedValue);
      triggerVibration(); // Haptic feedback when value changes
    }
  };

  const handleScrollEndDrag = () => {
    setIsUserScrolling(false);
  };

  const handleMomentumScrollEnd = (event: any) => {
    setIsUserScrolling(false);
    const scrollY = event.nativeEvent.contentOffset.y;
    // Account for top padding
    const adjustedScrollY = scrollY - paddingTop;
    const newValue = Math.round(adjustedScrollY / itemHeight);
    const clampedValue = Math.max(0, Math.min(9, newValue));
    
    // Snap to exact position
    if (scrollViewRef.current) {
      const targetY = paddingTop + (clampedValue * itemHeight);
      scrollViewRef.current.scrollTo({ y: targetY, animated: true });
    }
  };

  return (
    <View style={styles.speedPickerContainer}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.speedPickerScrollView}
        contentContainerStyle={styles.speedPickerContent}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        bounces={true}
        alwaysBounceVertical={true}
      >
        {/* Add padding items at top and bottom for better UX */}
        <View style={{ height: itemHeight * 1.5 }} />
        
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((speedValue) => (
          <View key={speedValue} style={styles.speedPickerItem}>
            <Text style={[
              styles.speedPickerText,
              speedValue === value ? styles.speedPickerTextActive : styles.speedPickerTextInactive
            ]}>
              {speedValue}
            </Text>
          </View>
        ))}
        
        {/* Add padding items at bottom */}
        <View style={{ height: itemHeight * 1.5 }} />
      </ScrollView>
      
      {/* Selection indicator */}
      <View style={styles.speedPickerIndicator} />
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
            <Text style={styles.speedLabel}>Speed Control</Text>
            <View style={styles.speedDisplay}>
              <Text style={styles.speedValue}>{speed}</Text>
              <Text style={styles.speedScale}>/ 9</Text>
            </View>
            
            {/* Scrollable Speed Picker */}
            <SpeedPicker
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
            <View style={styles.row}>
              <CustomButton title="Backlight ON (U)" onPress={() => send('U')} style={styles.secondaryButton} />
              <CustomButton title="Backlight OFF (u)" onPress={() => send('u')} style={styles.secondaryButton} />
              <CustomButton title="Horn (H)" onPress={() => send('H')} style={styles.hornButton} />
            </View>
          </View>

          {/* Movement Controls - Moved Down */}
          <View style={styles.movementSection}>
            <View style={styles.row}>
              <CustomButton title="Forward (F)" onPress={() => send('F')} style={styles.primaryButton} />
            </View>
            <View style={styles.row}>
              <CustomButton title="Left (L)" onPress={() => send('L')} style={styles.directionButton} />
              <CustomButton title="Stop (S)" onPress={() => send('S')} style={styles.stopButton} />
              <CustomButton title="Right (R)" onPress={() => send('R')} style={styles.directionButton} />
            </View>
            <View style={styles.row}>
              <CustomButton title="Back (B)" onPress={() => send('B')} style={styles.primaryButton} />
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
    flex: 1, 
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftPanel: {
    flex: 0.1,
  },
  rightPanel: {
    flex: 0.9,
    marginLeft: -350,
  },
  movementSection: {
    marginBottom: 15,
    width: '100%',
    
  },
  additionalSection: {
    marginTop: 20,
    marginBottom: 25,
    width: '100%',
  },
  row: { 
    flexDirection: 'row', 
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold',
    color: '#333',
    flex: 0.4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 10,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',

  },
  directionButton: {
    backgroundColor: '#2196F3',

  },
  stopButton: {
    backgroundColor: '#f44336',

  },
  secondaryButton: {
    backgroundColor: '#FF9800',

  },
  hornButton: {
    backgroundColor: '#9C27B0',

  },
  retryContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: '#2196F3',

  },
  serverInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    borderWidth: 1,
    borderColor: '#ddd',
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
    flex: 0.45,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    flex: 0.45,
  },
  speedContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 8,
    marginLeft: 30,
    marginTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '25%',
    height: '40%',
    elevation: 3,
  },
  speedLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  speedDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    // marginBottom: 10,
    height: 60,
  },
  speedValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  speedScale: {
    fontSize: 16,
    color: '#666',
    marginLeft: 2,
  },
  speedPickerContainer: {
    height: 150,
    marginTop: 10,
    marginBottom:4 ,
    position: 'relative',
  },
  speedPickerScrollView: {
    height: 100,
  },
  speedPickerContent: {
    paddingVertical: 0,
    
  },
  speedPickerItem: {
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedPickerText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  speedPickerTextActive: {
    color: '#4CAF50',
    fontSize: 40,
  },
  speedPickerTextInactive: {
    color: '#CCCCCC',
  },
  speedPickerIndicator: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    height: 60,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    pointerEvents: 'none',
  },
});
