import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';
import { useAppStore } from '../../store/appStore';
import { ClassService } from '../../services/classService';
import { Class, Member } from '../../types/api';

const { width } = Dimensions.get('window');

interface ClassStats {
  totalStudents: number;
  averageAttendance: number;
  upcomingClasses: number;
  completedToday: number;
}

export default function TrainerDashboard() {
  const [myClasses, setMyClasses] = useState<Class[]>([]);
  const [stats, setStats] = useState<ClassStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { user, logout } = useAppStore();

  useEffect(() => {
    loadTrainerData();
  }, []);

  const loadTrainerData = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      // Cargar clases del entrenador
      const allClasses = await ClassService.getClasses();
      // Filtrar solo las clases de este entrenador
      const trainerClasses = allClasses.filter(
        c => c.instructor.toLowerCase().includes(user?.fullName?.toLowerCase() || '')
      );
      setMyClasses(trainerClasses.slice(0, 5)); // Mostrar las próximas 5

      // Calcular estadísticas
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockStats: ClassStats = {
        totalStudents: 45,
        averageAttendance: 85,
        upcomingClasses: trainerClasses.filter(c => new Date(c.dateTime) > new Date()).length,
        completedToday: trainerClasses.filter(c => {
          const classDate = new Date(c.dateTime);
          classDate.setHours(0, 0, 0, 0);
          return classDate.getTime() === today.getTime() && new Date(c.dateTime) < new Date();
        }).length,
      };
      setStats(mockStats);

    } catch (error) {
      console.error('Error loading trainer data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadTrainerData(true);
  };

  const handleStartClass = (classItem: Class) => {
    Alert.alert(
      'Iniciar Clase',
      `¿Deseas iniciar la clase "${classItem.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Iniciar',
          onPress: () => {
            Alert.alert('¡Clase iniciada!', 'Los estudiantes pueden hacer check-in ahora');
          },
        },
      ]
    );
  };

  const handleEndClass = (classItem: Class) => {
    Alert.alert(
      'Finalizar Clase',
      `¿Deseas finalizar la clase "${classItem.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          onPress: () => {
            Alert.alert('Clase finalizada', 'Asistencia registrada correctamente');
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isClassActive = (classItem: Class) => {
    const now = new Date();
    const classStart = new Date(classItem.dateTime);
    const classEnd = new Date(classStart.getTime() + 60 * 60 * 1000); // Asume 1 hora de duración
    
    return now >= classStart && now <= classEnd;
  };

  const isClassUpcoming = (classItem: Class) => {
    const now = new Date();
    const classStart = new Date(classItem.dateTime);
    const timeDiff = classStart.getTime() - now.getTime();
    
    return timeDiff > 0 && timeDiff <= 30 * 60 * 1000; // Próximos 30 minutos
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>¡Hola, Coach {user?.fullName?.split(' ')[0]}!</Text>
            <Text style={styles.subtitle}>Listos para entrenar hoy</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={logout}>
            <View style={styles.profileIcon}>
              <Text style={styles.profileInitial}>
                {user?.fullName?.charAt(0).toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, styles.statCardPrimary]}>
                <Text style={styles.statNumber}>{stats.totalStudents}</Text>
                <Text style={styles.statLabel}>Estudiantes activos</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.upcomingClasses}</Text>
                <Text style={styles.statLabel}>Clases pendientes</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statPercentage}>{stats.averageAttendance}%</Text>
                <Text style={styles.statLabel}>Asistencia promedio</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.completedToday}</Text>
                <Text style={styles.statLabel}>Clases hoy</Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Acciones rápidas</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, styles.actionButtonPrimary]}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionText}>Ver Asistencia</Text>
              <Text style={styles.actionSubtext}>Revisar reportes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>👥</Text>
              <Text style={styles.actionText}>Mis Estudiantes</Text>
              <Text style={styles.actionSubtext}>Lista completa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📝</Text>
              <Text style={styles.actionText}>Nueva Clase</Text>
              <Text style={styles.actionSubtext}>Crear sesión</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* My Classes */}
        <View style={styles.classesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mis clases</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          
          {myClasses.length > 0 ? (
            <View style={styles.classList}>
              {myClasses.map((classItem) => {
                const isActive = isClassActive(classItem);
                const isUpcoming = isClassUpcoming(classItem);
                
                return (
                  <View key={classItem.id} style={[
                    styles.classCard,
                    isActive && styles.classCardActive,
                    isUpcoming && styles.classCardUpcoming,
                  ]}>
                    <View style={styles.classHeader}>
                      <View style={styles.classInfo}>
                        <Text style={styles.className}>{classItem.name}</Text>
                        <View style={styles.classDetails}>
                          <Text style={styles.classDate}>
                            📅 {formatDate(classItem.dateTime)}
                          </Text>
                          <Text style={styles.classTime}>
                            🕐 {formatTime(classItem.dateTime)}
                          </Text>
                        </View>
                      </View>
                      
                      {isActive && (
                        <View style={styles.liveIndicator}>
                          <Text style={styles.liveText}>🔴 EN VIVO</Text>
                        </View>
                      )}
                      
                      {isUpcoming && (
                        <View style={styles.upcomingIndicator}>
                          <Text style={styles.upcomingText}>⏰ PRÓXIMA</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.classStats}>
                      <View style={styles.attendanceInfo}>
                        <Text style={styles.attendanceText}>
                          👥 {classItem.currentAttendees}/{classItem.capacity} estudiantes
                        </Text>
                        <View style={styles.capacityBar}>
                          <View 
                            style={[
                              styles.capacityFill,
                              { width: `${(classItem.currentAttendees / classItem.capacity) * 100}%` }
                            ]} 
                          />
                        </View>
                      </View>
                    </View>

                    <View style={styles.classActions}>
                      {isActive ? (
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.endButton]}
                          onPress={() => handleEndClass(classItem)}
                        >
                          <Text style={styles.endButtonText}>Finalizar Clase</Text>
                        </TouchableOpacity>
                      ) : isUpcoming ? (
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.startButton]}
                          onPress={() => handleStartClass(classItem)}
                        >
                          <Text style={styles.startButtonText}>Iniciar Clase</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity style={[styles.actionButton, styles.viewButton]}>
                          <Text style={styles.viewButtonText}>Ver Detalles</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyText}>No tienes clases programadas</Text>
              <Text style={styles.emptySubtext}>
                Las nuevas clases aparecerán aquí
              </Text>
            </View>
          )}
        </View>

        {/* Tips for Trainers */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Consejo para entrenadores</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>💪</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Motivación constante</Text>
              <Text style={styles.tipText}>
                Mantén a tus estudiantes motivados con feedback positivo y 
                ajustes personalizados durante la clase.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: typography['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  profileButton: {
    marginLeft: spacing.md,
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: typography.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  statsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginRight: spacing.md,
    ...shadows.md,
  },
  statCardPrimary: {
    backgroundColor: colors.success,
  },
  statNumber: {
    fontSize: typography['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statPercentage: {
    fontSize: typography['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  quickActions: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginRight: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  actionText: {
    fontSize: typography.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  actionSubtext: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  classesSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAllText: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  classList: {
    gap: spacing.md,
  },
  classCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  classCardActive: {
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  classCardUpcoming: {
    backgroundColor: colors.warning,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: typography.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  classDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  classDate: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  classTime: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  liveIndicator: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  liveText: {
    color: colors.text,
    fontSize: typography.xs,
    fontWeight: typography.weights.bold,
  },
  upcomingIndicator: {
    backgroundColor: colors.warning,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  upcomingText: {
    color: colors.text,
    fontSize: typography.xs,
    fontWeight: typography.weights.bold,
  },
  classStats: {
    marginBottom: spacing.md,
  },
  attendanceInfo: {},
  attendanceText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  capacityBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  classActions: {
    flexDirection: 'row',
  },
  startButton: {
    backgroundColor: colors.success,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    flex: 1,
    alignItems: 'center',
  },
  endButton: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    flex: 1,
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    flex: 1,
    alignItems: 'center',
  },
  startButtonText: {
    color: colors.text,
    fontSize: typography.sm,
    fontWeight: typography.weights.medium,
  },
  endButtonText: {
    color: colors.text,
    fontSize: typography.sm,
    fontWeight: typography.weights.medium,
  },
  viewButtonText: {
    color: colors.text,
    fontSize: typography.sm,
    fontWeight: typography.weights.medium,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.base,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.sm,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  tipsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  tipCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...shadows.sm,
  },
  tipIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: typography.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tipText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.relaxed * typography.sm,
  },
  bottomSpacing: {
    height: spacing['2xl'],
  },
});