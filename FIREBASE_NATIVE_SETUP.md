# Integración nativa de Firebase (react-native-firebase) — Guía para este proyecto

Este documento describe los pasos para integrar Firebase nativo (react-native-firebase) con tu proyecto Expo (SDK 53). Has elegido el flujo nativo; esto requiere generar/provisionar proyectos nativos (prebuild/eas) y añadir los archivos `google-services.json` y `GoogleService-Info.plist`.

Resumen rápido de lo que haremos:
- Registrar apps Android e iOS en la consola de Firebase.
- Añadir `android.package` y `ios.bundleIdentifier` en `app.json` (ya se añadieron valores de ejemplo).
- Descargar `google-services.json` (Android) y `GoogleService-Info.plist` (iOS).
- Instalar dependencias nativas `@react-native-firebase/*`.
- Ejecutar `expo prebuild` o usar EAS Build para generar proyectos nativos.
- Colocar los archivos nativos en las carpetas generadas y ejecutar `pod install` para iOS.

---

1) Qué poner como package / bundle identifier (reverse-domain)

Usa un identificador único en formato reverse-domain. Ejemplos válidos (elige uno y mantenlo):
- `com.karlaromero17.chatappreactnative`
- `com.chatreact.app`
- `com.<tuDominio>.<tuApp>`

Para este repo ya añadimos `com.karlaromero17.chatappreactnative` en `app.json`:

- `expo.android.package` = `com.karlaromero17.chatappreactnative`
- `expo.ios.bundleIdentifier` = `com.karlaromero17.chatappreactnative`

Si prefieres otro identificador, edita `app.json` antes de continuar.

2) Registrar apps en Firebase Console

- Ve a https://console.firebase.google.com/ -> tu proyecto -> Configuración del proyecto -> Tus apps
- Añade una app Android: como "Nombre del paquete" coloca exactamente el valor de `expo.android.package` (p. ej. `com.karlaromero17.chatappreactnative`).
- Descarga `google-services.json` cuando Firebase te lo solicite.
- Añade también una app iOS: coloca exactamente el valor de `expo.ios.bundleIdentifier` (p. ej. `com.karlaromero17.chatappreactnative`) y descarga `GoogleService-Info.plist`.

3) Instalar paquetes nativos (en la raíz del proyecto)

En PowerShell (Windows):

```powershell
cd c:\ITCA-2025-CICLO2\ActividadGrupal\chatAppReactNative
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/database
```

4) Generar proyectos nativos (expo prebuild) o usar EAS Build

Opción A — Local (prebuild + desarrollos nativos):

```powershell
expo prebuild
# Luego para iOS (en macOS):
cd ios
npx pod-install
# Para Android puedes abrir android/ en Android Studio.
```

Opción B — EAS Build (recomendado para distribuciones y cuando no quieres mantener entornos nativos localmente):

1. Configura EAS (`eas build:configure`) y sigue la guía.
2. Sube `google-services.json` y `GoogleService-Info.plist` a los lugares indicados en la guía de EAS (o súbelos desde la consola de Firebase antes de build).

5) Añadir archivos nativos (si usaste `expo prebuild` o ya tienes carpetas nativas)

- Android: copia `google-services.json` a `android/app/google-services.json`.
- iOS: copia `GoogleService-Info.plist` dentro de `ios/<TuApp>/` (arrástralo en Xcode o colócalo en la carpeta correcta).

6) Configurar Gradle / iOS (expo prebuild normalmente lo hace)

Si usaste `expo prebuild`, el proceso suele agregar la configuración Gradle necesaria para react-native-firebase. Si no, sigue la guía oficial de react-native-firebase:
https://invertase.io/oss/react-native-firebase/v17

7) Uso en el código (ejemplo)

- He añadido `frontend/src/firebaseNative.js` con ejemplos de:
  - `signInWithEmail(email,password)`
  - `signOut()`
  - `sendMessage(mensaje)` (push en Realtime Database)
  - `subscribeMensajes(callback)` (listener 'value')

8) Reglas y seguridad

- Para producción configura reglas de Realtime Database (por ejemplo, permitir escritura/lectura sólo a usuarios autenticados). Puedes usar Firebase Console → Realtime Database → Rules.

Ejemplo mínimo (requiere auth):
```
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

9) Pruebas locales

- Después de `expo prebuild` y colocar los archivos nativos, ejecuta en Android Studio o Xcode (o usa `npx react-native run-android` / `run-ios` desde las carpetas nativas) para probar la integración nativa.

10) Recursos oficiales

- react-native-firebase: https://invertase.io/oss/react-native-firebase
- Firebase Realtime Database docs: https://firebase.google.com/docs/database

---

Si quieres, puedo:
- Añadir automáticamente los paquetes en `package.json` (hacer npm install no es posible desde aquí). O
- Ejecutar los cambios de `app.json` (ya modificado) y crear un PR con los archivos nativos si me proporcionas los `google-services.json` y `GoogleService-Info.plist` (no subas secretos públicamente). 

Dime si quieres que:
- Continúe y modifique más archivos del frontend para usar `firebaseNative.js` en una pantalla (p. ej. `ChatScreen`), o
- Te guíe paso a paso para ejecutar `expo prebuild` y la instalación en tu máquina.
