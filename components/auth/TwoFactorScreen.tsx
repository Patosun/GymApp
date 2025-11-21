import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, commonStyles } from '../../constants/theme';
import { useAppStore } from '../../store/appStore';

const { width } = Dimensions.get('window');

export default function TwoFactorScreen() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  
  const { verify2FA, auth, setRequires2FA } = useAppStore();

  useEffect(() => {
    // Focus en el primer input al montar
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleCodeChange = (value: string, index: number) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus al siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit cuando se complete el código
    if (index === 5 && value) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    // Backspace navigation
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const fullCode = otpCode || code.join('');
    
    if (fullCode.length !== 6) {
      Alert.alert('Error', 'Por favor ingresa el código completo de 6 dígitos');
      return;
    }

    setIsLoading(true);
    try {
      const success = await verify2FA(fullCode);
      
      if (!success) {
        Alert.alert('Error', 'Código inválido o expirado');
        // Limpiar código
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error de verificación');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setRequires2FA(false);
  };

  const handleResendCode = () => {
    // Aquí podrías implementar la lógica para reenviar el código
    Alert.alert('Información', 'El código se ha reenviado a tu dispositivo configurado');
  };

  return (
    <SafeAreaView style={commonStyles.safeContainer}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Verificación 2FA</Text>
          <Text style={styles.subtitle}>
            Ingresa el código de 6 dígitos{'\n'}
            desde tu app de autenticación
          </Text>
        </View>

        {/* Code Input */}
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.codeInput,
                digit ? styles.codeInputFilled : {},
                isLoading && styles.inputDisabled
              ]}
              value={digit}
              onChangeText={(value) => handleCodeChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              editable={!isLoading}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.verifyButton, isLoading && styles.buttonDisabled]}
            onPress={() => handleVerify()}
            disabled={isLoading || code.join('').length !== 6}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.text} size="small" />
            ) : (
              <Text style={styles.verifyButtonText}>Verificar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResendCode}
            disabled={isLoading}
          >
            <Text style={styles.resendButtonText}>
              ¿No recibiste el código? Reenviar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            disabled={isLoading}
          >
            <Text style={styles.backButtonText}>Volver al login</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.infoText}>
            🔐 Tu cuenta está protegida con{'\n'}
            autenticación de dos factores
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: spacing['3xl'],
  },
  title: {
    fontSize: typography['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.base,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: spacing.xl,
    marginVertical: spacing['2xl'],
  },
  codeInput: {
    width: (width - (spacing.lg * 2) - (spacing.xl * 2) - (spacing.sm * 5)) / 6,
    height: 56,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    color: colors.text,
    fontSize: typography['2xl'],
    fontWeight: typography.weights.bold,
  },
  codeInputFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceVariant,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  actions: {
    flex: 1,
    justifyContent: 'center',
    maxHeight: 200,
  },
  verifyButton: {
    ...commonStyles.button,
    ...commonStyles.buttonPrimary,
    marginBottom: spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: colors.text,
    fontSize: typography.base,
    fontWeight: typography.weights.semibold,
  },
  resendButton: {
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  resendButtonText: {
    color: colors.primary,
    fontSize: typography.sm,
    fontWeight: typography.weights.medium,
  },
  backButton: {
    alignItems: 'center',
    padding: spacing.md,
  },
  backButtonText: {
    color: colors.textSecondary,
    fontSize: typography.sm,
  },
  info: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  infoText: {
    color: colors.textTertiary,
    fontSize: typography.xs,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.xs,
  },
});