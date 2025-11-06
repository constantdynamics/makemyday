import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import api from '../services/api';
import { formatDistance, formatDuration } from '@makemyday/shared';

type DailyMenuScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DailyMenu'>;
};

export default function DailyMenuScreen({ navigation }: DailyMenuScreenProps) {
  const [menu, setMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDailyMenu();
  }, []);

  const loadDailyMenu = async () => {
    try {
      setLoading(true);
      const response = await api.post('/premium/daily-menu', {
        preferredDuration: 180,
        preferredTransport: 'WALKING',
        preferredTime: 'AFTERNOON',
      });
      setMenu(response.data.data.menu || []);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error?.message || 'Failed to load daily menu');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDailyMenu();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading your daily suggestions...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Today's Adventures</Text>
          <Text style={styles.subtitle}>
            Handpicked suggestions just for you
          </Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {menu.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyText}>
              Pull to refresh to generate your daily menu
            </Text>
          </View>
        ) : (
          <View style={styles.menuList}>
            {menu.map((suggestion, index) => (
              <ActivitySuggestionCard
                key={index}
                suggestion={suggestion}
                index={index}
                onPress={() => {
                  // Navigate to activity detail
                  Alert.alert('Activity Selected', 'Start session with this activity?');
                }}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function ActivitySuggestionCard({ suggestion, index, onPress }: any) {
  const { activity, route } = suggestion;
  const title = activity.title.en || Object.values(activity.title)[0];
  const description = activity.description.en || Object.values(activity.description)[0];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.cardBadge}>
          <Text style={styles.cardBadgeText}>#{index + 1}</Text>
        </View>
        <View style={styles.cardType}>
          <Text style={styles.cardTypeText}>
            {activity.type === 'CHALLENGE' ? '🎯 Challenge' : '📍 Location'}
          </Text>
        </View>
      </View>

      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription} numberOfLines={2}>
        {description}
      </Text>

      <View style={styles.cardInfo}>
        <View style={styles.cardInfoItem}>
          <Text style={styles.cardInfoIcon}>🚶</Text>
          <Text style={styles.cardInfoText}>{formatDistance(route.distance)}</Text>
        </View>
        <View style={styles.cardInfoItem}>
          <Text style={styles.cardInfoIcon}>⏱️</Text>
          <Text style={styles.cardInfoText}>{formatDuration(Math.round(route.duration / 60))}</Text>
        </View>
        <View style={styles.cardInfoItem}>
          <Text style={styles.cardInfoIcon}>⭐</Text>
          <Text style={styles.cardInfoText}>{activity.difficulty}/5</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.cardButton} onPress={onPress}>
        <Text style={styles.cardButtonText}>Let's Go! →</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  menuList: {
    gap: 16,
  },
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardBadge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardType: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardTypeText: {
    color: '#6366f1',
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  cardInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  cardInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfoIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  cardInfoText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  cardButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cardButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
