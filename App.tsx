import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Components
import LoginScreen from './components/auth/LoginScreen';
import TwoFactorScreen from './components/auth/TwoFactorScreen';
import MemberDashboard from './components/dashboard/MemberDashboard';
import TrainerDashboard from './components/dashboard/TrainerDashboard';
import QRScanner from './components/scanner/QRScanner';

// Store & Types
import { useAppStore } from './store/appStore';
import { colors } from './constants/theme';

export default function App() {
  const [showQRScanner, setShowQRScanner] = useState(false);
  
  const { 
    isAuthenticated, 
    requires2FA, 
    user, 
    isLoading 
  } = useAppStore();

  // Funciones para el QR Scanner
  const handleOpenQRScanner = () => {
    setShowQRScanner(true);
  };

  const handleCloseQRScanner = () => {
    setShowQRScanner(false);
  };

  const handleQRScanSuccess = (data: string) => {
    console.log('QR Scan successful:', data);
    // Aquí podrías procesar el resultado del escaneo
    setShowQRScanner(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <StatusBar style="light" backgroundColor={colors.background} />
          {/* Podrías agregar un splash screen aquí */}
        </View>
      </SafeAreaProvider>
    );
  }

  // QR Scanner Modal
  if (showQRScanner) {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <StatusBar style="light" backgroundColor="transparent" translucent />
          <QRScanner 
            onClose={handleCloseQRScanner}
            onScanSuccess={handleQRScanSuccess}
          />
        </View>
      </SafeAreaProvider>
    );
  }

  // Authentication Flow
  if (!isAuthenticated) {
    if (requires2FA) {
      return (
        <SafeAreaProvider>
          <View style={styles.container}>
            <StatusBar style="light" backgroundColor={colors.background} />
            <TwoFactorScreen />
          </View>
        </SafeAreaProvider>
      );
    }

    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <StatusBar style="light" backgroundColor={colors.background} />
          <LoginScreen />
        </View>
      </SafeAreaProvider>
    );
  }

  // Authenticated - Show appropriate dashboard based on user role
  const isTrainer = user?.role === 'TRAINER' || user?.role === 'ADMIN';

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor={colors.background} />
        {isTrainer ? (
          <TrainerDashboard />
        ) : (
          <MemberDashboard />
        )}
        
        {/* Floating QR Scanner Button for Members */}
        {!isTrainer && (
          <View style={styles.floatingButton}>
            {/* El botón QR se implementaría aquí o en el MemberDashboard */}
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    // Estilo para botón flotante si se necesita
  },
});