import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

type Theme = 'historical' | 'culinary' | 'art' | 'nature' | 'hidden-gems';

interface ThemeOption {
  id: Theme;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const themes: ThemeOption[] = [
  {
    id: 'historical',
    title: 'Historical Tour',
    description: 'Explore monuments, museums, and historical landmarks',
    icon: 'library',
    color: '#8B4513',
  },
  {
    id: 'culinary',
    title: 'Culinary Tour',
    description: 'Discover restaurants, cafes, and local food markets',
    icon: 'restaurant',
    color: '#FF6347',
  },
  {
    id: 'art',
    title: 'Art & Culture',
    description: 'Visit galleries, theaters, and cultural centers',
    icon: 'color-palette',
    color: '#9370DB',
  },
  {
    id: 'nature',
    title: 'Nature Escape',
    description: 'Enjoy parks, gardens, and natural scenery',
    icon: 'leaf',
    color: '#228B22',
  },
  {
    id: 'hidden-gems',
    title: 'Hidden Gems',
    description: 'Find unique and lesser-known local spots',
    icon: 'diamond',
    color: '#FFD700',
  },
];

interface Activity {
  name: string;
  description: string;
  location: { lat: number; lon: number };
  distance: number;
  estimatedDuration: number;
  activityDuration: number;
}

export default function ThemedAdventuresScreen() {
  const navigation = useNavigation();
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(false);
  const [adventure, setAdventure] = useState<{
    theme: string;
    activities: Activity[];
    totalDistance: number;
    totalDuration: number;
  } | null>(null);

  const generateAdventure = async (theme: Theme) => {
    try {
      setLoading(true);
      setSelectedTheme(theme);

      const response = await api.post('/premium/themed-adventure', {
        theme,
        duration: 240, // 4 hours
        transport: 'WALKING',
        maxActivities: 5,
      });

      setAdventure(response.data.data.adventure);
    } catch (error: any) {
      console.error('Failed to generate themed adventure:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error?.message || 'Failed to generate adventure'
      );
      setSelectedTheme(null);
    } finally {
      setLoading(false);
    }
  };

  const startAdventure = () => {
    Alert.alert(
      'Start Adventure',
      'This will create a new session with these activities. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => {
            // TODO: Integrate with session creation
            Alert.alert('Success', 'Adventure session created!');
            navigation.goBack();
          },
        },
      ]
    );
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>
          Crafting your {selectedTheme} adventure...
        </Text>
      </View>
    );
  }

  if (adventure) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setAdventure(null);
              setSelectedTheme(null);
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Adventure</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{adventure.theme} Tour</Text>
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Ionicons name="location" size={20} color="#666" />
              <Text style={styles.statText}>
                {formatDistance(adventure.totalDistance)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time" size={20} color="#666" />
              <Text style={styles.statText}>
                {formatDuration(adventure.totalDuration)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="flag" size={20} color="#666" />
              <Text style={styles.statText}>
                {adventure.activities.length} stops
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.activitiesContainer}>
          <Text style={styles.sectionTitle}>Your Itinerary</Text>
          {adventure.activities.map((activity, index) => (
            <View key={index} style={styles.activityCard}>
              <View style={styles.activityNumber}>
                <Text style={styles.activityNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityName}>{activity.name}</Text>
                <Text style={styles.activityDescription}>
                  {activity.description}
                </Text>
                <View style={styles.activityMeta}>
                  <Text style={styles.metaText}>
                    <Ionicons name="walk" size={14} />{' '}
                    {formatDistance(activity.distance)}
                  </Text>
                  <Text style={styles.metaText}>
                    <Ionicons name="time-outline" size={14} />{' '}
                    {formatDuration(activity.activityDuration)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.startButton} onPress={startAdventure}>
          <Text style={styles.startButtonText}>Start This Adventure</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Themed Adventures</Text>
        <Text style={styles.subtitle}>
          Choose a theme and we'll create a personalized tour for you
        </Text>
      </View>

      <View style={styles.themesContainer}>
        {themes.map((theme) => (
          <TouchableOpacity
            key={theme.id}
            style={[styles.themeCard, { borderLeftColor: theme.color }]}
            onPress={() => generateAdventure(theme.id)}
          >
            <View
              style={[styles.themeIcon, { backgroundColor: theme.color + '20' }]}
            >
              <Ionicons name={theme.icon} size={32} color={theme.color} />
            </View>
            <View style={styles.themeContent}>
              <Text style={styles.themeTitle}>{theme.title}</Text>
              <Text style={styles.themeDescription}>{theme.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCC" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={24} color="#007AFF" />
        <Text style={styles.infoText}>
          Each adventure is a curated 4-hour tour with 5 activities tailored to
          your chosen theme.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  themesContainer: {
    padding: 16,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  themeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  themeContent: {
    flex: 1,
  },
  themeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  activitiesContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityNumberText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  activityMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
