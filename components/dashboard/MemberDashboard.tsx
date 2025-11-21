import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';
import { useAppStore } from '../../store/appStore';
import { ClassService } from '../../services/classService';
import { Class, CheckIn } from '../../types/api';

const { width } = Dimensions.get('window');

interface DashboardStats {
  totalClasses: number;
  attendedClasses: number;
  upcomingClasses: number;
  favoriteClass: string;
}

export default function MemberDashboard() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { user, logout } = useAppStore();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      // Cargar clases disponibles
      const classesData = await ClassService.getClasses();
      setClasses(classesData.slice(0, 3)); // Solo mostrar las próximas 3

      // Simular stats (en producción vendría del backend)
      const mockStats: DashboardStats = {
        totalClasses: 24,
        attendedClasses: 18,
        upcomingClasses: classesData.filter(c => new Date(c.dateTime) > new Date()).length,
        favoriteClass: 'CrossFit',
      };
      setStats(mockStats);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData(true);
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
            <Text style={styles.greeting}>¡Hola, {user?.fullName?.split(' ')[0]}!</Text>
            <Text style={styles.subtitle}>Listo para entrenar hoy</Text>
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
                <Text style={styles.statNumber}>{stats.attendedClasses}</Text>
                <Text style={styles.statLabel}>Clases este mes</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.upcomingClasses}</Text>
                <Text style={styles.statLabel}>Próximas clases</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statPercentage}>
                  {Math.round((stats.attendedClasses / stats.totalClasses) * 100)}%
                </Text>
                <Text style={styles.statLabel}>Asistencia</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statText}>{stats.favoriteClass}</Text>
                <Text style={styles.statLabel}>Clase favorita</Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Acciones rápidas</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, styles.actionButtonPrimary]}>
              <Text style={styles.actionIcon}>📱</Text>
              <Text style={styles.actionText}>Escanear QR</Text>
              <Text style={styles.actionSubtext}>Check-in rápido</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📅</Text>
              <Text style={styles.actionText}>Mis Clases</Text>
              <Text style={styles.actionSubtext}>Ver reservas</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Classes */}
        <View style={styles.classesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Próximas clases</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          
          {classes.length > 0 ? (
            <View style={styles.classList}>
              {classes.map((classItem) => (
                <View key={classItem.id} style={styles.classCard}>
                  <View style={styles.classInfo}>
                    <Text style={styles.className}>{classItem.name}</Text>
                    <Text style={styles.classInstructor}>
                      Instructor: {classItem.instructor}
                    </Text>
                    <View style={styles.classDetails}>
                      <Text style={styles.classDate}>
                        📅 {formatDate(classItem.dateTime)}
                      </Text>
                      <Text style={styles.classTime}>
                        🕐 {formatTime(classItem.dateTime)}
                      </Text>
                    </View>
                    <View style={styles.classCapacity}>
                      <Text style={styles.capacityText}>
                        {classItem.capacity - classItem.currentAttendees}/{classItem.capacity} lugares
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
                  <TouchableOpacity style={styles.reserveButton}>
                    <Text style={styles.reserveButtonText}>Reservar</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyText}>No hay clases próximas</Text>
              <Text style={styles.emptySubtext}>
                Las nuevas clases aparecerán aquí
              </Text>
            </View>
          )}
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Consejo del día</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>💡</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Hidratación</Text>
              <Text style={styles.tipText}>
                Bebe agua antes, durante y después del entrenamiento para mantener 
                un rendimiento óptimo.
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
    backgroundColor: colors.primary,
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
    backgroundColor: colors.primary,
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
    color: colors.success,
    marginBottom: spacing.xs,
  },
  statText: {
    fontSize: typography.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
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
  classInfo: {
    marginBottom: spacing.md,
  },
  className: {
    fontSize: typography.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  classInstructor: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  classDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  classDate: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  classTime: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  classCapacity: {
    marginTop: spacing.sm,
  },
  capacityText: {
    fontSize: typography.xs,
    color: colors.textTertiary,
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
  reserveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignSelf: 'flex-end',
  },
  reserveButtonText: {
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