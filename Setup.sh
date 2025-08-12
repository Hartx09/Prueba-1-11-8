#!/bin/bash

# 🏰 Crystal Kingdom - Script de Setup Automático
# Este script configura todo lo necesario para ejecutar el juego

set -e  # Exit if any command fails

echo "🏰 ¡Bienvenido a Crystal Kingdom Setup!"
echo "======================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si estamos en macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "Este script solo funciona en macOS (requerido para desarrollo iOS)"
    exit 1
fi

print_status "Verificando sistema..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Por favor instala Node.js v16+ desde https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Necesitas Node.js v16 o superior. Versión actual: $(node -v)"
    exit 1
fi

print_success "Node.js $(node -v) ✓"

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi

print_success "npm $(npm -v) ✓"

# Verificar Xcode
if ! command -v xcodebuild &> /dev/null; then
    print_error "Xcode no está instalado. Por favor instala Xcode desde App Store"
    exit 1
fi

print_success "Xcode $(xcodebuild -version | head -n1) ✓"

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. ¿Estás en el directorio correcto del proyecto?"
    exit 1
fi

# Instalar React Native CLI globalmente
print_status "Instalando React Native CLI..."
if ! command -v react-native &> /dev/null; then
    npm install -g react-native-cli
    print_success "React Native CLI instalado ✓"
else
    print_success "React Native CLI ya está instalado ✓"
fi

# Instalar CocoaPods
print_status "Verificando CocoaPods..."
if ! command -v pod &> /dev/null; then
    print_status "Instalando CocoaPods..."
    sudo gem install cocoapods
    print_success "CocoaPods instalado ✓"
else
    print_success "CocoaPods ya está instalado ✓"
fi

# Instalar dependencias de Node.js
print_status "Instalando dependencias de Node.js..."
npm install
print_success "Dependencias de Node.js instaladas ✓"

# Navegar a iOS y instalar pods
print_status "Instalando dependencias nativas de iOS..."
cd ios

if [ ! -f "Podfile" ]; then
    print_error "No se encontró Podfile en el directorio ios/"
    cd ..
    exit 1
fi

pod install
print_success "CocoaPods instalados ✓"
cd ..

# Verificar si hay dispositivos iOS disponibles
print_status "Verificando simuladores de iOS disponibles..."
xcrun simctl list devices | grep "iPhone" | head -5

# Crear script de ejecución rápida
print_status "Creando scripts de ejecución..."

cat > run-ios.sh << 'EOF'
#!/bin/bash
echo "🏰 Ejecutando Crystal Kingdom en iOS..."
npx react-native run-ios
EOF

cat > run-ios-device.sh << 'EOF'
#!/bin/bash
echo "🏰 Ejecutando Crystal Kingdom en dispositivo iOS..."
echo "Asegúrate de que tu iPhone/iPad esté conectado via USB"
npx react-native run-ios --device
EOF

cat > clean-build.sh << 'EOF'
#!/bin/bash
echo "🧹 Limpiando builds..."
cd ios
rm -rf build/
xcodebuild clean
cd ..
npx react-native start --reset-cache
EOF

chmod +x run-ios.sh run-ios-device.sh clean-build.sh

print_success "Scripts creados:"
print_success "  - run-ios.sh (ejecutar en simulador)"
print_success "  - run-ios-device.sh (ejecutar en dispositivo)"
print_success "  - clean-build.sh (limpiar builds)"

# Crear archivo de configuración local
cat > crystal-kingdom.config.js << 'EOF'
// Configuración local de Crystal Kingdom
module.exports = {
  projectName: 'CrystalKingdom',
  bundleId: 'com.crystalkingdom.app',
  displayName: 'Crystal Kingdom',
  version: '1.0.0',
  buildNumber: 1,
  
  // Configuración de desarrollo
  development: {
    enableHermes: true,
    enableFlipper: true,
    debugMode: true,
  },
  
  // URLs para servicios externos (cuando los agregues)
  services: {
    analytics: 'https://api.crystalkingdom.com/analytics',
    ads: 'ca-app-pub-xxxxxxxxx~xxxxxxxxx', // Tu AdMob App ID
    iap: 'com.crystalkingdom.app', // Tu bundle ID para IAP
  }
};
EOF

print_success "Archivo de configuración creado ✓"

echo ""
echo "🎉 ¡Setup completado exitosamente!"
echo "=================================="
echo ""
print_status "Próximos pasos:"
echo "1. Para ejecutar en simulador: ./run-ios.sh"
echo "2. Para ejecutar en dispositivo: ./run-ios-device.sh"
echo "3. Si hay problemas, ejecuta: ./clean-build.sh"
echo ""
print_status "Comandos útiles:"
echo "• npm start                    - Iniciar Metro bundler"
echo "• npm run ios                  - Ejecutar en iOS"
echo "• npm run ios-device          - Ejecutar en dispositivo"
echo "• npm run pod-install         - Reinstalar CocoaPods"
echo "• npm run reset               - Limpiar cache"
echo ""
print_status "Para desarrollo:"
echo "• Abre ios/CrystalKingdom.xcworkspace en Xcode"
echo "• Configura tu Apple Developer Team"
echo "• Cambia el Bundle Identifier a algo único"
echo ""
echo "🎮 ¡Que comience la aventura de Crystal Kingdom!"
echo ""

# Opcional: Ejecutar automáticamente si el usuario quiere
read -p "¿Quieres ejecutar el juego ahora en el simulador? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Ejecutando Crystal Kingdom..."
    ./run-ios.sh
fi
