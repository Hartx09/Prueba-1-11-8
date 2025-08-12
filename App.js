import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  Animated,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HapticFeedback from 'react-native-haptic-feedback';

const {width, height} = Dimensions.get('window');

const App = () => {
  const [gameState, setGameState] = useState({
    coins: 500,
    gems: 10,
    energy: 100,
    power: 0,
    buildings: {},
    chapter: 1,
    mission: {
      type: 'build',
      target: 'farm',
      current: 0,
      required: 3,
      description: 'Construye 3 granjas para alimentar a los refugiados',
    },
    timeLeft: 48 * 60 * 60,
    bossHealth: 1000,
    maxBossHealth: 1000,
  });

  const [showStory, setShowStory] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [showShop, setShowShop] = useState(false);

  const chapters = {
    1: {
      title: 'Capítulo 1: Las Ruinas',
      story: 'Los refugiados llegan hambrientos. Debes alimentarlos antes de que pierdan la esperanza.',
      mission: {
        type: 'build',
        target: 'farm',
        required: 3,
        description: 'Construye 3 granjas para alimentar a los refugiados',
      },
      reward: {coins: 1000, gems: 5},
      timeLimit: 48 * 60 * 60,
    },
    2: {
      title: 'Capítulo 2: La Primera Defensa',
      story: 'Los exploradores del Rey Oscuro se acercan. Necesitas soldados para proteger a tu gente.',
      mission: {
        type: 'build',
        target: 'barracks',
        required: 2,
        description: 'Construye 2 cuarteles y recluta tu primer ejército',
      },
      reward: {coins: 1500, gems: 10},
      timeLimit: 36 * 60 * 60,
    },
    12: {
      title: 'Capítulo 12: ¡LA VENGANZA FINAL!',
      story: 'El Rey Oscuro te espera en su torre. Es hora de la venganza que has esperado tanto tiempo.',
      mission: {
        type: 'boss',
        required: 1,
        description: 'Derrota al Rey Oscuro y reclama tu venganza',
      },
      reward: {victory: true},
      timeLimit: 60 * 60 * 60,
    },
  };

  const buildingTypes = {
    farm: {
      icon: '🌾',
      name: 'Granja',
      cost: 200,
      income: 20,
      power: 0,
      story: 'Alimenta a los refugiados y mantiene la moral alta',
    },
    barracks: {
      icon: '🏹',
      name: 'Cuartel',
      cost: 500,
      income: 10,
      power: 50,
      story: 'Entrena soldados valientes para tu ejército de venganza',
    },
    mine: {
      icon: '⛏️',
      name: 'Mina',
      cost: 300,
      income: 30,
      power: 10,
      story: 'Extrae metales preciosos para forjar armas legendarias',
    },
    tower: {
      icon: '🗼',
      name: 'Torre Mágica',
      cost: 800,
      income: 15,
      power: 100,
      story: 'Canaliza poder arcano contra las fuerzas del mal',
    },
  };

  useEffect(() => {
    loadGame();
    const timer = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        timeLeft: Math.max(0, prev.timeLeft - 1),
      }));
    }, 1000);

    const incomeTimer = setInterval(() => {
      collectPassiveIncome();
    }, 5000);

    const missionTimer = setInterval(() => {
      checkMission();
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(incomeTimer);
      clearInterval(missionTimer);
    };
  }, []);

  const loadGame = async () => {
    try {
      const savedGame = await AsyncStorage.getItem('crystalKingdomSave');
      if (savedGame) {
        setGameState(JSON.parse(savedGame));
      }
    } catch (error) {
      console.log('Error loading game:', error);
    }
  };

  const saveGame = async () => {
    try {
      await AsyncStorage.setItem('crystalKingdomSave', JSON.stringify(gameState));
    } catch (error) {
      console.log('Error saving game:', error);
    }
  };

  const startGame = () => {
    HapticFeedback.trigger('impactHeavy');
    setShowStory(false);
  };

  const buyBuilding = type => {
    const building = buildingTypes[type];
    if (gameState.coins >= building.cost) {
      let emptySlot = -1;
      for (let i = 0; i < 16; i++) {
        if (!gameState.buildings[i]) {
          emptySlot = i;
          break;
        }
      }

      if (emptySlot !== -1) {
        setGameState(prev => ({
          ...prev,
          coins: prev.coins - building.cost,
          buildings: {
            ...prev.buildings,
            [emptySlot]: {
              type: type,
              level: 1,
              lastCollect: Date.now(),
            },
          },
        }));

        HapticFeedback.trigger('impactMedium');
        showEvent('🏗️ Construcción Completa', `${building.name} construido!\n${building.story}`);
        setShowShop(false);
        saveGame();
      } else {
        Alert.alert('Sin Espacio', '¡No hay terreno disponible!');
      }
    } else {
      Alert.alert('Sin Recursos', '¡No tienes suficiente oro!');
    }
  };

  const upgradeBuilding = slotIndex => {
    const building = gameState.buildings[slotIndex];
    if (building) {
      const cost = building.level * 150;
      if (gameState.coins >= cost) {
        setGameState(prev => ({
          ...prev,
          coins: prev.coins - cost,
          buildings: {
            ...prev.buildings,
            [slotIndex]: {
              ...prev.buildings[slotIndex],
              level: prev.buildings[slotIndex].level + 1,
            },
          },
        }));

        HapticFeedback.trigger('impactLight');
        const buildingData = buildingTypes[building.type];
        showEvent('⬆️ Mejora Completa', `${buildingData.name} mejorado a nivel ${building.level + 1}!`);
        saveGame();
      } else {
        Alert.alert('Sin Recursos', '¡No tienes suficiente oro para mejorar!');
      }
    }
  };

  const collectPassiveIncome = () => {
    let totalEarned = 0;
    const currentTime = Date.now();
    const newBuildings = {...gameState.buildings};

    Object.keys(gameState.buildings).forEach(slotIndex => {
      const building = gameState.buildings[slotIndex];
      const buildingData = buildingTypes[building.type];
      const timeDiff = (currentTime - building.lastCollect) / 1000;

      if (timeDiff >= 5) {
        const earnings = Math.floor(buildingData.income * building.level * (timeDiff / 5));
        totalEarned += earnings;
        newBuildings[slotIndex] = {
          ...building,
          lastCollect: currentTime,
        };
      }
    });

    if (totalEarned > 0) {
      setGameState(prev => ({
        ...prev,
        coins: prev.coins + totalEarned,
        buildings: newBuildings,
      }));
    }
  };

  const collectAll = () => {
    collectPassiveIncome();
    HapticFeedback.trigger('impactLight');
    showEvent('💰 Recursos Recolectados', '¡Recursos recolectados de todos los edificios!');
  };

  const checkMission = () => {
    const mission = gameState.mission;
    let completed = false;

    if (mission.type === 'build') {
      const count = Object.values(gameState.buildings).filter(b => b.type === mission.target).length;
      
      setGameState(prev => ({
        ...prev,
        mission: {
          ...prev.mission,
          current: count,
        },
      }));

      if (count >= mission.required) {
        completed = true;
      }
    }

    if (completed) {
      completeMission();
    }
  };

  const completeMission = () => {
    const chapter = chapters[gameState.chapter];
    
    if (chapter.reward.victory) {
      showEvent('👑 ¡VICTORIA ÉPICA!', '¡Has derrotado al Rey Oscuro! Tu reino está a salvo y tu venganza está completa.');
      return;
    }

    setGameState(prev => ({
      ...prev,
      coins: prev.coins + chapter.reward.coins,
      gems: prev.gems + chapter.reward.gems,
      chapter: prev.chapter < 12 ? prev.chapter + 1 : prev.chapter,
    }));

    HapticFeedback.trigger('impactHeavy');
    showEvent('🎉 ¡Capítulo Completado!', `¡Misión cumplida!\n\n+${chapter.reward.coins} oro\n+${chapter.reward.gems} gemas`);
    
    saveGame();
  };

  const buyPremium = () => {
    if (gameState.gems >= 5) {
      setGameState(prev => ({
        ...prev,
        gems: prev.gems - 5,
        coins: prev.coins + 2000,
        energy: 100,
        timeLeft: prev.timeLeft + 3600,
      }));

      HapticFeedback.trigger('impactHeavy');
      showEvent('💎 Boost Temporal', '¡Pack premium activado!\n+2000 oro\n+1 hora extra\nEnergía restaurada');
      saveGame();
    } else {
      Alert.alert('💎 Tienda Premium', '¡Compra gemas para acelerar tu venganza!\nPacks disponibles desde $0.99');
    }
  };

  const showEvent = (title, message) => {
    setModalContent({title, message});
    setShowModal(true);
    setTimeout(() => setShowModal(false), 3000);
  };

  const formatTime = seconds => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderGameGrid = () => {
    const slots = [];
    for (let i = 0; i < 16; i++) {
      const building = gameState.buildings[i];
      slots.push(
        <TouchableOpacity
          key={i}
          style={[styles.buildingSlot, building && styles.building]}
          onPress={() => building ? upgradeBuilding(i) : setShowShop(true)}>
          {building ? (
            <View style={styles.buildingContent}>
              <Text style={styles.buildingIcon}>{buildingTypes[building.type].icon}</Text>
              <Text style={styles.buildingName}>{buildingTypes[building.type].name}</Text>
              <View style={styles.levelIndicator}>
                <Text style={styles.levelText}>{building.level}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptySlot}>
              <Text style={styles.buildingIcon}>➕</Text>
              <Text style={styles.buildingName}>Construir</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }
    return slots;
  };

  if (showStory) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.storyContainer}>
          <View style={styles.storyContent}>
            <Text style={styles.storyTitle}>🏰 Crystal Kingdom: La Última Esperanza</Text>
            <Text style={styles.storyText}>
              <Text style={styles.bold}>Tu reino ha caído...</Text>{'\n\n'}
              El Rey Oscuro ha destruido todo lo que amabas. Solo queda una pequeña parcela de tierra maldita y tu determinación inquebrantable.{'\n\n'}
              <Text style={styles.bold}>MISIÓN:</Text> Reconstruye tu reino, forma un ejército poderoso y derrota al Rey Oscuro en 12 épicos capítulos.{'\n\n'}
              ¿Estás listo para vengarte?
            </Text>
            <TouchableOpacity style={styles.startButton} onPress={startGame}>
              <Text style={styles.startButtonText}>⚔️ ¡COMENZAR LA VENGANZA!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#2D1B69', '#11998e']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HUD */}
      <View style={styles.hud}>
        <View style={styles.hudTop}>
          <View style={styles.resourceContainer}>
            <View style={styles.resource}>
              <View style={[styles.resourceIcon, {backgroundColor: '#FFD700'}]} />
              <Text style={styles.resourceText}>{gameState.coins}</Text>
            </View>
            <View style={styles.resource}>
              <View style={[styles.resourceIcon, {backgroundColor: '#FF1493'}]} />
              <Text style={styles.resourceText}>{gameState.gems}</Text>
            </View>
            <View style={styles.resource}>
              <View style={[styles.resourceIcon, {backgroundColor: '#00FFFF'}]} />
              <Text style={styles.resourceText}>{gameState.energy}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.chapterTitle}>{chapters[gameState.chapter]?.title || 'Capítulo 1'}</Text>
            <Text style={styles.timeLeft}>⏰ {formatTime(gameState.timeLeft)}</Text>
          </View>
        </View>

        <View style={styles.missionBar}>
          <Text style={styles.missionTitle}>{gameState.mission.description}</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                {width: `${Math.min((gameState.mission.current / gameState.mission.required) * 100, 100)}%`}
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {gameState.mission.current} / {gameState.mission.required} completado
          </Text>
        </View>
      </View>

      {/* Game Grid */}
      <ScrollView style={styles.gameArea} contentContainerStyle={styles.gameGrid}>
        {renderGameGrid()}
      </ScrollView>

      {/* Bottom Menu */}
      <View style={styles.bottomMenu}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setShowShop(true)}>
          <Text style={styles.menuButtonText}>🏪 Construir</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={collectAll}>
          <Text style={styles.menuButtonText}>💰 Recolectar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuButton, styles.premiumButton]} onPress={buyPremium}>
          <Text style={[styles.menuButtonText, {color: '#000'}]}>💎 Acelerar</Text>
        </TouchableOpacity>
      </View>

      {/* Shop Modal */}
      {showShop && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowShop(false)}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>🏗️ Construir Edificios</Text>
            <ScrollView style={styles.shopItems}>
              {Object.keys(buildingTypes).map(type => (
                <TouchableOpacity 
                  key={type} 
                  style={styles.shopItem} 
                  onPress={() => buyBuilding(type)}
                >
                  <Text style={styles.shopItemText}>
                    {buildingTypes[type].icon} {buildingTypes[type].name} - {buildingTypes[type].cost} oro
                  </Text>
                  <Text style={styles.shopItemDesc}>{buildingTypes[type].story}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Event Modal */}
      {showModal && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalContent.title}</Text>
            <Text style={styles.modalText}>{modalContent.message}</Text>
          </View>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  storyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  storyContent: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 30,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FFD700',
    maxWidth: 400,
  },
  storyTitle: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  storyText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 30,
  },
  bold: {
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  hud: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 15,
    paddingTop: 50,
  },
  hudTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  resourceContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  resource: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  resourceIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  resourceText: {
    color: 'white',
    fontWeight: 'bold',
  },
  chapterTitle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  timeLeft: {
    color: '#FF4444',
    fontSize: 12,
    textAlign: 'right',
  },
  missionBar: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  missionTitle: {
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBar: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#FFD700',
    height: '100%',
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
  gameArea: {
    flex: 1,
    padding: 20,
  },
  gameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  buildingSlot: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
    borderRadius: 20,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  building: {
    backgroundColor: '#4ECDC4',
    borderColor: '#FFD700',
    borderStyle: 'solid',
  },
  buildingContent: {
    alignItems: 'center',
    position: 'relative',
  },
  emptySlot: {
    alignItems: 'center',
  },
  buildingIcon: {
    fontSize: 30,
    marginBottom: 5,
  },
  buildingName: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  levelIndicator: {
    position: 'absolute',
    top: -15,
    right: -15,
    backgroundColor: '#FFD700',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomMenu: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 15,
    justifyContent: 'space-around',
  },
  menuButton: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  premiumButton: {
    backgroundColor: '#FFD700',
  },
  menuButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2D1B69',
    padding: 30,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FFD700',
    maxWidth: '90%',
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 15,
    zIndex: 1,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalTitle: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  shopItems: {
    maxHeight: 300,
  },
  shopItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  shopItemText: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  shopItemDesc: {
    color: '#AAA',
    fontSize: 12,
  },
});

export default App;
