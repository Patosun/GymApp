import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions, BarCodeScanningResult } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import { useAppStore } from '../../store/appStore';
import { apiService } from '../../services/apiService';

const { width, height } = Dimensions.get('window');
const SCANNER_SIZE = width * 0.7;

interface QRScannerProps {
  onClose: () => void;
  onScanSuccess: (data: string) => void;
}

export default function QRScanner({ onClose, onScanSuccess }: QRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [scannedData, setScannedData] = useState<string | null>(null);
  
  const scanAnimation = useRef(new Animated.Value(0)).current;
  const { user } = useAppStore();

  useEffect(() => {
    // Animación del scanner
    const scannerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    if (isScanning) {
      scannerAnimation.start();
    } else {
      scannerAnimation.stop();
    }

    return () => scannerAnimation.stop();
  }, [isScanning]);

  const handleBarCodeScanned = ({ data }: BarCodeScanningResult) => {
    if (!isScanning || scannedData) return;

    setIsScanning(false);
    setScannedData(data);

    // Procesar el QR escaneado
    processCheckIn(data);
  };

  const processCheckIn = async (qrData: string) => {
    try {
      console.log('QR escaneado:', qrData);
      console.log('Usuario completo:', user);
      console.log('user.qrCode:', user?.qrCode);
      console.log('user.member?.qrCode:', user?.member?.qrCode);
      
      // Verificar que el usuario tenga un QR code
      const userQR = user?.qrCode || user?.member?.qrCode;
      if (!userQR) {
        console.log('❌ Usuario sin QR code:', { user });
        throw new Error('Tu perfil no tiene un código QR asignado. Contacta al administrador.');
      }
      
      // El QR del admin contiene la información del branch
      // Parsear el QR para extraer el branchId
      let branchId;
      
      try {
        // Intentar parsear como JSON primero (si es un QR del admin con estructura JSON)
        const qrContent = JSON.parse(qrData);
        branchId = qrContent.branchId || qrContent.branch_id;
      } catch (e) {
        // Si no es JSON, asumir que es el branchId directamente
        branchId = qrData;
      }

      if (!branchId) {
        throw new Error('QR inválido: No se pudo determinar la sucursal');
      }

      console.log('Realizando check-in con:', { qrCode: userQRCode, branchId });

      // Realizar check-in usando el QR del miembro y branchId del QR escaneado
      const response = await apiService.createCheckIn({
        qrCode: userQRCode,
        branchId: branchId
      });

      console.log('Check-in exitoso:', response);

      Alert.alert(
        '¡Check-in exitoso! ✅',
        `Bienvenido al gimnasio\nSucursal: ${response.data?.branch?.name || branchId}\nHora: ${new Date(response.data?.checkInTime || new Date()).toLocaleTimeString()}`,
        [
          {
            text: 'Perfecto',
            onPress: () => {
              onScanSuccess(`checkin_success_${response.data?.id || Date.now()}`);
              onClose();
            },
          },
        ]
      );

    } catch (error: any) {
      console.error('Error en check-in:', error);
      
      let errorMessage = 'No se pudo realizar el check-in';
      
      if (error.response?.status === 404) {
        errorMessage = 'Endpoint no encontrado. Verifica la configuración del servidor.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert(
        'Error de Check-in',
        errorMessage,
        [
          {
            text: 'Reintentar',
            onPress: () => {
              setScannedData(null);
              setIsScanning(true);
            },
          },
          { text: 'Cerrar', onPress: onClose },
        ]
      );
    }
  };

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Solicitando permisos de cámara...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <Text style={styles.permissionTitle}>Permiso de Cámara</Text>
          <Text style={styles.permissionText}>
            Necesitamos acceso a tu cámara para escanear códigos QR y realizar check-ins.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Permitir Cámara</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const scannerTranslateY = scanAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCANNER_SIZE - 4],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
        barCodeScannerSettings={{
          barCodeTypes: ['qr'],
        }}
      />
      
      {/* Overlay Content */}
      <View style={styles.overlay}>
        {/* Header */}
        <SafeAreaView style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Escanear QR</Text>
          <View style={styles.placeholder} />
        </SafeAreaView>

        {/* Scanner Overlay */}
        <View style={styles.scannerContainer}>
          <View style={styles.scannerFrame}>
            {/* Corner borders */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            {/* Scanning line */}
            {isScanning && (
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [{ translateY: scannerTranslateY }],
                  },
                ]}
              />
            )}
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>
            {isScanning ? 'Escanea el QR de la sucursal' : 'Procesando check-in...'}
          </Text>
          <Text style={styles.instructionsText}>
            {isScanning 
              ? 'Apunta tu cámara al código QR que generó el administrador'
              : 'Verificando datos y registrando tu entrada'
            }
          </Text>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <View style={styles.userInfo}>
            <Text style={styles.userInfoText}>
              Check-in como: {user?.fullName}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  permissionContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  permissionTitle: {
    fontSize: typography['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.base,
    marginBottom: spacing['2xl'],
  },
  permissionButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing.md,
  },
  permissionButtonText: {
    color: colors.text,
    fontSize: typography.base,
    fontWeight: typography.weights.semibold,
  },
  cancelButton: {
    padding: spacing.md,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: typography.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: typography.lg,
    fontWeight: typography.weights.bold,
  },
  headerTitle: {
    color: 'white',
    fontSize: typography.lg,
    fontWeight: typography.weights.bold,
  },
  placeholder: {
    width: 40,
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.primary,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.primary,
    opacity: 0.8,
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['2xl'],
  },
  instructionsTitle: {
    color: 'white',
    fontSize: typography.lg,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  instructionsText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: typography.base,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.base,
  },
  bottomActions: {
    padding: spacing.lg,
  },
  userInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  userInfoText: {
    color: 'white',
    fontSize: typography.sm,
    fontWeight: typography.weights.medium,
  },
});