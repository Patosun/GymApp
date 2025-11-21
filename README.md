# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

# GymMaster Mobile App

Una aplicación móvil completa para la gestión de gimnasios desarrollada con Expo y React Native.

## 🚀 Características

### Para Miembros
- **Autenticación Segura**: Login con 2FA y autenticación biométrica
- **Dashboard Personalizado**: Estadísticas de asistencia y clases favoritas
- **Escáner QR**: Check-in rápido mediante códigos QR
- **Gestión de Clases**: Ver y reservar clases disponibles
- **Perfil de Usuario**: Gestión de información personal

### Para Entrenadores
- **Dashboard de Instructor**: Estadísticas de estudiantes y asistencia
- **Gestión de Clases**: Iniciar/finalizar clases en tiempo real
- **Seguimiento de Asistencia**: Monitorear participación de estudiantes
- **Reportes**: Análisis de rendimiento y asistencia

### Características Generales
- **Diseño Dark Mode**: Interface elegante y moderna
- **Navegación Intuitiva**: Experiencia de usuario optimizada
- **Sincronización en Tiempo Real**: Datos actualizados instantáneamente
- **Notificaciones Push**: Recordatorios y actualizaciones importantes

## 🛠️ Tecnologías

- **Expo SDK**: ~52.0.11
- **React Native**: 0.76.2
- **TypeScript**: Tipado estático completo
- **Zustand**: Gestión de estado global
- **Axios**: Cliente HTTP con interceptores
- **Expo Camera**: Escáner QR integrado
- **AsyncStorage**: Persistencia local
- **React Hook Form**: Manejo de formularios

## 📱 Requisitos

- Node.js 18+
- Expo CLI
- iOS 13+ / Android 6+
- Cámara del dispositivo (para QR)

## 🔧 Instalación

1. **Clonar el repositorio**:
   ```bash
   cd GymApp
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   # o
   expo install
   ```

3. **Configurar variables de entorno**:
   ```bash
   # Crear archivo .env (opcional)
   API_BASE_URL=https://tu-backend.vercel.app
   ```

4. **Iniciar el servidor de desarrollo**:
   ```bash
   npx expo start
   ```

5. **Ejecutar en dispositivo**:
   - **iOS**: Presiona `i` en la terminal o usa Expo Go
   - **Android**: Presiona `a` en la terminal o usa Expo Go
   - **Web**: Presiona `w` en la terminal

## 📱 Estructura del Proyecto

```
GymApp/
├── components/           # Componentes React Native
│   ├── auth/            # Componentes de autenticación
│   │   ├── LoginScreen.tsx
│   │   └── TwoFactorScreen.tsx
│   ├── dashboard/       # Dashboards principales
│   │   ├── MemberDashboard.tsx
│   │   └── TrainerDashboard.tsx
│   └── scanner/         # Escáner QR
│       └── QRScanner.tsx
├── constants/           # Constantes y configuración
│   └── theme.ts        # Sistema de diseño
├── services/           # Servicios API
│   ├── apiService.ts   # Cliente HTTP base
│   ├── authService.ts  # Autenticación
│   ├── classService.ts # Gestión de clases
│   ├── memberService.ts # Gestión de miembros
│   └── branchService.ts # Gestión de sucursales
├── store/              # Estado global
│   └── appStore.ts     # Store principal con Zustand
├── types/              # Tipos TypeScript
│   └── api.ts          # Interfaces de API
├── App.tsx             # Componente principal
├── index.js            # Punto de entrada
└── package.json        # Configuración del proyecto
```

## 🎨 Sistema de Diseño

La aplicación implementa un sistema de diseño dark consistente:

- **Colores**: Paleta dark elegante con acentos en verde (#1DB954)
- **Tipografía**: Escalas consistentes con pesos apropiados
- **Espaciado**: Sistema basado en 4px para consistencia
- **Componentes**: Botones, cards y elementos reutilizables
- **Iconos**: Emojis nativos y componentes personalizados

## 🔐 Autenticación

### Flujo de Login
1. Ingreso de email/password
2. Verificación 2FA (si está habilitada)
3. Almacenamiento seguro de tokens
4. Redirección según rol del usuario

### Seguridad
- JWT tokens con renovación automática
- Almacenamiento seguro con AsyncStorage
- Interceptores Axios para manejo de sesiones
- Logout automático en caso de token expirado

## 📷 Funcionalidad QR

### Tipos de QR Soportados
- **Clases**: `GYMMASTER_CLASS_{id}` - Check-in a clase específica
- **General**: `GYMMASTER_CHECKIN_{location}` - Check-in al gimnasio

### Características del Scanner
- Detección automática de códigos QR
- Validación de formato
- Feedback visual con animaciones
- Manejo de errores graceful

## 🚀 Compilación

### Development Build
```bash
expo build:android
expo build:ios
```

### Production Build
```bash
expo build:android --release-channel production
expo build:ios --release-channel production
```

### EAS Build (Recomendado)
```bash
eas build --platform android
eas build --platform ios
```

## 📊 Estado y Datos

### Store Global (Zustand)
- **Autenticación**: Usuario, tokens, estado de sesión
- **UI**: Loading states, modales, navegación
- **Cache**: Datos de clases, miembros, estadísticas
- **Configuración**: Tema, preferencias del usuario

### Persistencia
- Tokens de autenticación en AsyncStorage
- Caché de datos para modo offline
- Configuraciones de usuario

## 🔄 API Integration

### Servicios Disponibles
- **Auth**: Login, 2FA, refresh tokens
- **Classes**: CRUD de clases, reservas, check-ins
- **Members**: Gestión de perfiles y membresías
- **Branches**: Información de sucursales

### Manejo de Errores
- Retry automático para requests fallidos
- Offline detection y queue
- Fallbacks para datos críticos

## 🎯 Próximas Funcionalidades

- [ ] Modo offline completo
- [ ] Notificaciones push
- [ ] Chat entre miembros y entrenadores
- [ ] Integración con wearables
- [ ] Métricas de fitness detalladas
- [ ] Sistema de gamificación
- [ ] Pagos in-app
- [ ] Reservas de equipamiento

## 🐛 Debugging

### Logs
```bash
# Mostrar logs de desarrollo
npx expo start --dev-client

# Debug mode
npx expo start --debug
```

### Herramientas
- React DevTools
- Flipper (para debugging nativo)
- Expo DevTools en el navegador

## 📈 Performance

### Optimizaciones Implementadas
- Lazy loading de componentes
- Optimización de re-renders con useMemo/useCallback
- Imágenes optimizadas con expo-image
- Cache de API responses
- Bundle splitting por rutas

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto es privado y propietario.

## 🆘 Soporte

Para soporte técnico o reportes de bugs:
- Crear issue en el repositorio
- Contactar al equipo de desarrollo

---

Desarrollado con ❤️ para GymMaster

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
