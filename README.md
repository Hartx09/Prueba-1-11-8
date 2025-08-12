# 🏰 Crystal Kingdom: La Última Esperanza

Un juego móvil casual de construcción de reino con narrativa épica de venganza. Reconstruye tu reino destruido y derrota al Rey Oscuro en 12 capítulos emocionantes.

## 🎮 Características del Juego

- **Historia Épica**: 12 capítulos con narrativa envolvente
- **Construcción Estratégica**: 4 tipos de edificios únicos
- **Progresión Temporal**: Límites de tiempo reales por capítulo
- **Sistema de Misiones**: Objetivos claros y recompensas
- **Monetización Integrada**: IAP y espacios para publicidad
- **Guardado Automático**: Progreso persistente

## 📱 Requisitos del Sistema

### Para Desarrollo iOS:
- **macOS** (requerido para desarrollo iOS)
- **Node.js** v16 o superior
- **Xcode** (última versión desde App Store)
- **CocoaPods** para dependencias nativas
- **React Native CLI**

### Para Testing:
- **iPhone/iPad** con iOS 11.0+
- **Cable USB** para conexión
- **Apple ID** (para firma de código)

## 🚀 Instalación Rápida

### 1. Clonar o Descargar el Proyecto
```bash
git clone https://github.com/tuusuario/crystal-kingdom.git
cd crystal-kingdom
```

### 2. Instalar Herramientas Globales
```bash
# React Native CLI
npm install -g react-native-cli

# CocoaPods (para iOS)
sudo gem install cocoapods
```

### 3. Instalar Dependencias
```bash
# Dependencias de Node.js
npm install

# Dependencias iOS (CocoaPods)
cd ios && pod install && cd ..
```

### 4. Ejecutar en iOS
```bash
# En simulador
npx react-native run-ios

# En dispositivo real (conecta tu iPhone primero)
npx react-native run-ios --device "Tu iPhone"
```

## 🔧 Setup Detallado

### Configuración de Xcode:

1. **Abrir Proyecto en Xcode:**
   ```bash
   open ios/CrystalKingdom.xcworkspace
   ```

2. **Configurar Signing:**
   - Selecciona tu proyecto en el navegador
   - Ve a "Signing & Capabilities"
   - Selecciona tu Apple Developer Team
   - Cambia Bundle Identifier a algo único: `com.tunombre.crystalkingdom`

3. **Para Dispositivo Real:**
   - Conecta tu iPhone/iPad via USB
   - Selecciona tu dispositivo en Xcode
   - Build y ejecuta (Cmd+R)

### Comandos Útiles:

```bash
# Limpiar cache de Metro
npm start -- --reset-cache

# Limpiar build de iOS
npm run ios-clean

# Ver dispositivos disponibles
xcrun simctl list devices

# Ejecutar en simulador específico
npx react-native run-ios --simulator="iPhone 14 Pro"

# Ver logs en tiempo real
npx react-native log-ios
```

## 📂 Estructura del Proyecto

```
crystal-kingdom/
├── App.js                 # 🎮 Archivo principal del juego
├── package.json           # 📦 Dependencias y scripts
├── .gitignore            # 🚫 Archivos ignorados por Git
├── ios/                  # 📱 Configuración iOS
│   ├── CrystalKingdom/
│   │   ├── Info.plist   # ⚙️ Configuración de la app
│   │   └── ...
│   └── Podfile          # 📚 Dependencias nativas iOS
├── android/              # 🤖 (Futuro soporte Android)
└── README.md            # 📖 Esta guía
```

## 🎯 Mecánicas del Juego

### Recursos:
- **🪙 Oro**: Moneda principal para construcciones
- **💎 Gemas**: Moneda premium para boosts
- **⚡ Energía**: Requerida para acciones especiales

### Edificios:
- **🌾 Granja**: Alimenta refugiados (+20 oro/min)
- **🏹 Cuartel**: Entrena soldados (+50 poder militar)
- **⛏️ Mina**: Extrae recursos (+30 oro/min)
- **🗼 Torre Mágica**: Poder arcano (+100 poder)

### Progresión:
- **12 Capítulos** con historias únicas
- **Límites de tiempo** reales (24-48 horas)
- **Misiones específicas** por capítulo
- **Jefe final** en el último capítulo

## 💰 Estrategia de Monetización

### In-App Purchases (IAP):
- **Boost Temporal**: +1 hora extra (5 gemas)
- **Pack de Oro**: 2000 monedas ($0.99)
- **Pack Premium**: Recursos + tiempo ($2.99)
- **Pack Mega**: Construcción instantánea ($9.99)

### Publicidad:
- **Rewarded Videos**: Gemas extra por ver ads
- **Banner Ads**: Ingresos pasivos discretos
- **Interstitial Ads**: Entre capítulos completados

## 🚀 Deployment y Distribución

### Para TestFlight (Beta Testing):

1. **Archive en Xcode:**
   - Product → Archive
   - Distribute App → App Store Connect
   - Upload to TestFlight

2. **Configurar Beta Testing:**
   - Ve a App Store Connect
   - Agrega beta testers
   - Envía invitaciones

### Para GitHub Actions (CI/CD):

Crea `.github/workflows/ios.yml`:

```yaml
name: iOS Build
on:
  push:
    branches: [ main ]
jobs:
  build:
    runs-on: macos-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm ci
    - name: Pod install
      run: cd ios && pod install
    - name: Build iOS
      run: npx react-native run-ios --configuration Release
```

## 🐛 Troubleshooting

### Error: "Command PhaseScriptExecution failed"
```bash
cd ios
rm -rf build/
rm -rf ~/Library/Developer/Xcode/DerivedData/
pod install
cd ..
```

### Error: "Unable to resolve module"
```bash
npx react-native start --reset-cache
rm -rf node_modules
npm install
```

### Error de Signing en Xcode:
1. Ve a Xcode > Preferences > Accounts
2. Agrega tu Apple ID
3. Selecciona "Automatically manage signing"

### Metro Bundler Issues:
```bash
# Reiniciar Metro completamente
npx react-native start --reset-cache

# Limpiar watchman
watchman watch-del-all
```

## 📊 Métricas a Trackear

- **Retention**: D1, D7, D30
- **Session Length**: Tiempo promedio de juego
- **Conversion Rate**: Free-to-paid users
- **ARPU**: Revenue por usuario
- **Chapter Completion**: Progreso por capítulo

## 🔄 Próximas Funcionalidades

### Versión 1.1:
- [ ] Soporte para Android
- [ ] Sistema de logros
- [ ] Leaderboards globales
- [ ] Push notifications

### Versión 1.2:
- [ ] Multijugador básico
- [ ] Guild system
- [ ] Eventos especiales
- [ ] Más capítulos (13-20)

### Versión 2.0:
- [ ] Modo PvP
- [ ] Nuevas razas/facciones
- [ ] Sistema de cartas
- [ ] Realidad aumentada

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ve el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Desarrollador

Creado con ❤️ para la comunidad de juegos móviles casuales.

## 📞 Soporte

¿Problemas con la instalación? ¿Ideas para nuevas features?

- 📧 Email: support@crystalkingdom.com
- 💬 Discord: CrystalKingdom#1234
- 🐦 Twitter: @CrystalKingdomGame

---

¡Que comience la venganza! ⚔️👑
