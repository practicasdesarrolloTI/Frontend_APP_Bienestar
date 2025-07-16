# CuidarMe App Frontend

## Descripción

Aplicación móvil CuidarMe desarrollada con React Native y Expo. Permite a los pacientes gestionar citas, consultar resultados médicos, completar encuestas de autocuidado y mucho más.

## Tabla de Contenidos

- [Instalación]
- [Uso]
- [Estructura del Proyecto]
- [Módulos]
  - [App.tsx / index.ts]
  - [assets/]
  - [src/components/]
  - [src/screens/]
  - [src/services/]
  - [src/themes/]
  - [src/utils/]
- [Configuración]
- [Licencia]

## Instalación

1. Clona este repositorio:
   ```bash
   git clone https://github.com/practicasdesarrolloTI/Frontend_APP_Bienestar.git
   ```
2. Accede al directorio del proyecto:
   ```bash
   cd bienestar-app-front
   ```
3. Instala las dependencias:
   ```bash
   npm install
   # o
   yarn install
   ```

## Uso

Para iniciar la aplicación en modo desarrollo:

```bash
expo start
```

Escanea el código QR con la app Expo Go o emula en Android/iOS.

## Estructura del Proyecto

```
├── App.tsx            # Punto de entrada de la app
├── index.ts           # Registro del componente raíz
├── app.json           # Configuración de Expo
├── eas.json           # Configuración de EAS Build
├── tsconfig.json      # Configuración de TypeScript
├── package.json       # Dependencias y scripts
├── assets/            # Recursos estáticos (imágenes, fondos)
└── src/               # Código fuente
    ├── components/    # Componentes UI reutilizables
    ├── data/          # Preguntas, respuestas y puntajes de encuestas
    ├── screens/       # Pantallas principales
    ├── navigation/    # Maneja toda la lógica de navegación
    ├── services/      # Llamadas a la API y lógica de negocio
    ├── themes/        # Definición de colores y fuentes
    └── utils/         # Funciones de utilidad
```

## Módulos

### App.tsx / index.ts

- **App.tsx**: Punto de entrada principal. Configura proveedores de navegación y estado global.
- **index.ts**: Registra el componente raíz (`App`) para la plataforma.

### assets/

Carpeta que contiene todos los recursos estáticos

### src/components/

Componentes reutilizables de la interfaz:

- **Buscador.tsx**: Barra de búsqueda para filtrar listas.
- **Carousel.tsx**: Carrusel de imágenes para banners.
- **CustomDateRangeFilter.tsx**: Selector de rango de fechas.
- **CustomHeader.tsx**: Encabezado personalizado para pantallas.
- **CustomToast.tsx**: Notificaciones tipo toast.
- **DatePickerField.tsx**: Campo personalizado de selección de fecha.
- **DocumentPicker.tsx**: Selector de tipo de documento.
- **EmptyState.tsx**: Vista para estados vacíos.
- **EpsPicker.tsx**: Selector de EPS.
- **HomeHeader.tsx**: Encabezado específico de la pantalla de inicio.
- **LoadingScreen.tsx**: Componente de pantalla de carga.
- **PasswordRecoveryModal.tsx**: Modal para recuperación de contraseña.
- **RecommendationModal.tsx**: Modal que muestra recomendaciones.
- **SexPicker.tsx**: Selector de sexo.
- **SkeletonLoading.tsx**: Skeleton para estados de carga.
- **SurveyCard.tsx**: Tarjeta que representa una encuesta.
- **WarningModal.tsx**: Modal de alerta.

### src/screens/

Pantallas principales de la aplicación:

- **LandingScreen.tsx**: Pantalla de bienvenida y presentación.
- **LoginScreen.tsx**: Formulario de inicio de sesión.
- **RegisterScreen.tsx**: Registro de nuevos usuarios.
- **VerifyCodeScreen.tsx**: Verificación de código enviado por correo.
- **ResetPasswordScreen.tsx**: Restablecimiento de contraseña.
- **HomeScreen.tsx**: Dashboard principal con resumen de datos.
- **AppointmentScreen.tsx**: Historial y gestión de citas.
- **ProgramsScreen.tsx**: Listado de programas en los que está inscrito el paciente.
- **ResultsScreen.tsx**: Visualización y descarga de resultados de laboratorio.
- **PrescriptionsScreen.tsx**: Ordenes y fórmulas médicas.
- **PatientInfoScreen.tsx**: Información detallada del paciente.
- **SelfCareScreen.tsx**: Pantalla de autocuidado con encuestas.
- **SurveyScreen.tsx**: Ejecución de una encuesta.
- **SurveySummary.tsx**: Resumen de resultados y recomendaciones.
- **ForgotPasswordScreen.tsx**: Recuperación de contraseña via formulario.

### src/services/

Módulos encargados de la comunicación con la API:

- **authService.ts**: Autenticación y registro de usuarios.
- **appointmentService.ts**: Gestión de citas.
- **programService.ts**: Consulta de programas del paciente.
- **resultService.ts**: Descarga de resultados de laboratorio.
- **medicamentService.ts**: Obtención de medicamentos asignados.
- **surveyService.ts**: Carga de encuestas disponibles.
- **surveyResultService.ts**: Envío y consulta de respuestas de encuestas.
- **bannerService.ts**: Obtención de banners e imágenes promocionales.
- **epsService.ts**: Lógica de selección y homologación de EPS.
- **patientService.ts**: Consulta de datos básicos del paciente.
- **pdfServices.ts**: Generación y manejo de PDFs.

### src/themes/

Definición de estilos globales:

- **colors.ts**: Paleta de colores de la marca.
- **fonts.ts**: Tipografías utilizadas.

### src/utils/

Funciones de apoyo:

- **dateUtils.ts**: Cálculo de edad y formatos de fecha.
- **getRemainingTimeUtils.ts**: Cálculo del tiempo restante para encuestas bloqueadas.
- **surveyUtils.ts**: Lógica de puntajes y recomendaciones basadas en resultados.

## Configuración

- **app.json**: Configuración de la app Expo.
- **eas.json**: Configuración de EAS Build.
- **tsconfig.json**: Configuración de TypeScript.
- **package.json**: Scripts y dependencias.
