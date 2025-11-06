import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { formatDistance, formatDuration } from '@makemyday/shared';
import api from '../services/api';

type ActivityDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ActivityDetail'>;
  route: RouteProp<RootStackParamList, 'ActivityDetail'>;
};

export default function ActivityDetailScreen({ navigation, route }: ActivityDetailScreenProps) {
  const { activityId, sessionId } = route.params;
  const { currentActivity } = useSelector((state: RootState) => state.activity);
  const { currentSession } = useSelector((state: RootState) => state.session);

  if (!currentActivity) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleAccept = () => {
    navigation.navigate('MapNavigation', { activityId, sessionId });
  };

  const handleSkip = async () => {
    if (!currentSession) return;

    if (currentSession.skips.used >= currentSession.skips.available) {
      Alert.alert('No Skips Available', 'You have used all your skips for this session');
      return;
    }

    Alert.alert(
      'Skip Activity',
      'Are you sure you want to skip this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/sessions/${sessionId}/activities/${activityId}/skip`);
              navigation.navigate('Wheel', { sessionId });
            } catch (error: any) {
              Alert.alert('Error', 'Failed to skip activity');
            }
          },
        },
      ]
    );
  };

  const { activity, route: routeInfo } = currentActivity;
  const title = activity.title.en || Object.values(activity.title)[0];
  const description = activity.description.en || Object.values(activity.description)[0];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {activity.type === 'CHALLENGE' ? '🎯 Challenge' : '📍 Location'}
            </Text>
          </View>
        </View>

        <Text style={styles.description}>{description}</Text>

        <View style={styles.infoSection}>
          <InfoCard
            icon="🚶"
            title="Distance"
            value={formatDistance(routeInfo.distance)}
          />
          <InfoCard
            icon="⏱️"
            title="Travel Time"
            value={formatDuration(Math.round(routeInfo.duration / 60))}
          />
          <InfoCard
            icon="⭐"
            title="Difficulty"
            value={`${activity.difficulty}/5`}
          />
        </View>

        {activity.estimatedDuration && (
          <View style={styles.durationInfo}>
            <Text style={styles.durationText}>
              Estimated time at location: {formatDuration(activity.estimatedDuration.min)} -{' '}
              {formatDuration(activity.estimatedDuration.max)}
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
            <Text style={styles.acceptButtonText}>Let's Go! 🚀</Text>
          </TouchableOpacity>

          {currentSession && currentSession.skips.used < currentSession.skips.available && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>
                Skip (
                {currentSession.skips.available - currentSession.skips.used} left)
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function InfoCard({ icon, title, value }: { icon: string; title: string; value: string }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeBadgeText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 24,
  },
  infoSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  durationInfo: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  durationText: {
    fontSize: 14,
    color: '#92400e',
  },
  actions: {
    gap: 12,
  },
  acceptButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
});
