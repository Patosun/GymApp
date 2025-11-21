import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { apiService } from '../services/apiService';
import QRScanner from './scanner/QRScanner';

interface DashboardStats {
  totalClasses: number;
  attendedClasses: number;
  upcomingClasses: number;
  membershipStatus: string;
}

interface ClassData {
  id: string;
  name: string;
  instructor: string;
  dateTime: string;
  capacity: number;
  currentAttendees: number;
  branch: string;
}

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  
  const { user, logout } = useAuthStore();
  const { setAvailableClasses } = useAppStore();

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
      console.log('Dashboard: Cargando datos del dashboard...');
      
      // Cargar múltiples endpoints en paralelo
      const [classesResponse, memberStatsResponse] = await Promise.all([
        apiService.getAvailableClasses(),
        apiService.getMemberStats().catch(() => ({ data: null })) // No fallar si no existe
      ]);
      
      console.log('Dashboard: Respuesta de clases:', classesResponse);
      console.log('Dashboard: Respuesta de stats:', memberStatsResponse);
      
      // Procesar clases disponibles
      // El endpoint /api/classes/available devuelve { classes: [...], total: number }
      const classesArray = classesResponse?.data?.classes || classesResponse?.data || [];
      const classesData = Array.isArray(classesArray) 
        ? classesArray.map((cls: any) => ({
            id: cls.id,
            name: cls.name,
            instructor: cls.trainer?.user?.firstName + ' ' + cls.trainer?.user?.lastName || 'Instructor',
            dateTime: cls.startTime || cls.dateTime,
            capacity: cls.capacity || 20,
            currentAttendees: cls._count?.reservations || 0,
            branch: cls.branch?.name || 'Sede Principal',
            availableSpots: cls.availableSpots || (cls.capacity - (cls._count?.reservations || 0)),
          }))
        : [];
      
      console.log('Dashboard: Datos de clases procesados:', classesData);
      
      setClasses(classesData.slice(0, 5));
      setAvailableClasses(classesData);

      // Procesar estadísticas reales
      const memberStats = memberStatsResponse?.data;
      const now = new Date();
      const upcomingClasses = classesData.filter((cls: ClassData) => {
        const classDate = new Date(cls.dateTime);
        return classDate > now;
      }).length;

      const realStats: DashboardStats = {
        totalClasses: memberStats?.totalEnrolledClasses || classesData.length,
        attendedClasses: memberStats?.totalCheckinsThisMonth || 0,
        upcomingClasses,
        membershipStatus: memberStats?.activeMembership?.membershipType?.name || 'Activa',
      };
      
      console.log('Dashboard: Estadísticas calculadas:', realStats);
      setStats(realStats);

    } catch (error: any) {
      console.error('Dashboard: Error detallado:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        stack: error.stack
      });
      
      // Proporcionar datos por defecto en caso de error
      setClasses([]);
      setStats({
        totalClasses: 0,
        attendedClasses: 0,
        upcomingClasses: 0,
        membershipStatus: user?.role || 'Activa',
      });
      
      Alert.alert('Error', `No se pudieron cargar los datos: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  const handleQRScan = () => {
    setShowQRScanner(true);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', onPress: logout }
      ]
    );
  };

  const handleProfile = () => {
    Alert.alert(
      'Perfil de Usuario',
      `Nombre: ${user?.firstName} ${user?.lastName}\nEmail: ${user?.email}\nRol: ${user?.role}\nTeléfono: ${user?.phone || 'No registrado'}`,
      [
        { text: 'Editar', onPress: () => handleEditProfile() },
        { text: 'Cerrar', style: 'cancel' }
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Editar Perfil', 'Funcionalidad próximamente disponible');
  };

  const handleViewMyClasses = async () => {
    try {
      const response = await apiService.getMyClasses();
      const myClassesData = response?.data || [];
      
      if (myClassesData.length === 0) {
        Alert.alert('Mis Clases', 'No tienes clases reservadas');
        return;
      }
      
      const classNames = myClassesData.map((cls: any) => 
        `• ${cls.name} - ${new Date(cls.startTime).toLocaleString()}`
      ).join('\n');
      
      Alert.alert('Mis Clases Reservadas', classNames);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar tus clases');
    }
  };

  const handleClassAction = async (classItem: ClassData) => {
    if (user?.role === 'TRAINER') {
      // Funcionalidad para entrenadores
      Alert.alert(
        'Gestionar Clase',
        `Clase: ${classItem.name}\nAsistentes: ${classItem.currentAttendees}/${classItem.capacity}`,
        [
          { text: 'Ver Asistentes', onPress: () => handleViewAttendees(classItem.id) },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
    } else {
      // Funcionalidad para miembros
      Alert.alert(
        'Reservar Clase',
        `¿Deseas reservar la clase "${classItem.name}"?\nInstructor: ${classItem.instructor}\nFecha: ${formatDate(classItem.dateTime)} ${formatTime(classItem.dateTime)}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Reservar', onPress: () => handleReserveClass(classItem.id) }
        ]
      );
    }
  };

  const handleReserveClass = async (classId: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.reserveClass(classId);
      
      if (response.success) {
        Alert.alert('Éxito', 'Clase reservada correctamente');
        loadDashboardData(); // Recargar datos
      } else {
        Alert.alert('Error', response.message || 'No se pudo reservar la clase');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Error al reservar la clase');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAttendees = async (classId: string) => {
    try {
      // Endpoint hipotético para ver asistentes
      Alert.alert('Asistentes', 'Funcionalidad próximamente disponible');
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los asistentes');
    }
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
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>
              ¡Hola, {user?.fullName?.split(' ')[0] || 'Usuario'}! 👋
            </Text>
            <Text style={styles.subtitle}>
              {user?.role === 'TRAINER' ? 'Panel de Entrenador' : 'Listo para entrenar hoy'}
            </Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
            <Text style={styles.profileText}>
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
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
                  {Math.round((stats.attendedClasses / (stats.totalClasses || 1)) * 100)}%
                </Text>
                <Text style={styles.statLabel}>Asistencia</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statText}>{stats.membershipStatus}</Text>
                <Text style={styles.statLabel}>Membresía</Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={handleQRScan}
          >
            <Text style={styles.actionIcon}>📱</Text>
            <Text style={styles.actionText}>Check-in QR</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>Mis Clases</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleProfile}>
            <Text style={styles.actionIcon}>👤</Text>
            <Text style={styles.actionText}>Perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Classes List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {user?.role === 'TRAINER' ? 'Mis Clases' : 'Próximas clases'}
            </Text>
            {user?.role !== 'TRAINER' && (
              <TouchableOpacity onPress={handleViewMyClasses}>
                <Text style={styles.viewAllText}>Ver mis clases</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {classes.length > 0 ? (
            <View style={styles.classList}>
              {classes.map((classItem) => (
                <View key={classItem.id} style={styles.classCard}>
                  <View style={styles.classInfo}>
                    <Text style={styles.className}>{classItem.name}</Text>
                    <Text style={styles.classInstructor}>
                      👨‍💼 {classItem.instructor}
                    </Text>
                    <Text style={styles.classTime}>
                      📅 {formatDate(classItem.dateTime)} • 🕐 {formatTime(classItem.dateTime)}
                    </Text>
                    <Text style={styles.classBranch}>📍 {classItem.branch}</Text>
                    <View style={styles.capacityInfo}>
                      <Text style={styles.capacityText}>
                        👥 {classItem.currentAttendees}/{classItem.capacity} personas
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
                  <TouchableOpacity 
                    style={styles.reserveButton}
                    onPress={() => handleClassAction(classItem)}
                  >
                    <Text style={styles.reserveText}>
                      {user?.role === 'TRAINER' ? 'Gestionar' : 'Reservar'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyText}>No hay clases disponibles</Text>
            </View>
          )}
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Consejo del día</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Hidratación</Text>
            <Text style={styles.tipText}>
              Mantente hidratado antes, durante y después del entrenamiento 
              para un rendimiento óptimo y mejor recuperación.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* QR Scanner Modal */}
      <Modal visible={showQRScanner} animationType="slide" presentationStyle="fullScreen">
        <QRScanner
          onClose={() => setShowQRScanner(false)}
          onScanSuccess={(data) => {
            console.log('QR escaneado exitosamente:', data);
            setShowQRScanner(false);
            // Recargar datos del dashboard para reflejar el check-in
            loadDashboardData(true);
          }}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 50,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#B3B3B3',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsContainer: {
    marginBottom: 30,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statCardPrimary: {
    backgroundColor: '#1DB954',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1DB954',
    marginBottom: 4,
  },
  statText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#B3B3B3',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionButtonPrimary: {
    backgroundColor: '#1DB954',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#1DB954',
    fontWeight: '500',
  },
  classList: {
    gap: 12,
  },
  classCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classInfo: {
    flex: 1,
    paddingRight: 12,
  },
  className: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  classInstructor: {
    fontSize: 12,
    color: '#B3B3B3',
    marginBottom: 4,
  },
  classTime: {
    fontSize: 12,
    color: '#B3B3B3',
    marginBottom: 4,
  },
  classBranch: {
    fontSize: 12,
    color: '#B3B3B3',
    marginBottom: 8,
  },
  capacityInfo: {
    marginTop: 4,
  },
  capacityText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  capacityBar: {
    height: 3,
    backgroundColor: '#333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    backgroundColor: '#1DB954',
  },
  reserveButton: {
    backgroundColor: '#1DB954',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  reserveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#B3B3B3',
  },
  tipCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#B3B3B3',
    lineHeight: 20,
  },
  qrModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrText: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  qrSubtext: {
    fontSize: 16,
    color: '#B3B3B3',
    marginBottom: 20,
  },
  qrCloseButton: {
    backgroundColor: '#1DB954',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  qrCloseText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});