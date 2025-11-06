import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useDispatch } from 'react-redux';
import { setConfiguration, setSession } from '../store/slices/sessionSlice';
import * as Location from 'expo-location';
import { TransportMode } from '@makemyday/shared';
import api from '../services/api';

type ConfigurationScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Configuration'>;
};

export default function ConfigurationScreen({ navigation }: ConfigurationScreenProps) {
  const dispatch = useDispatch();
  const [transport, setTransport] = useState<TransportMode>(TransportMode.WALKING);
  const [totalTime, setTotalTime] = useState(120); // minutes
  const [groupSize, setGroupSize] = useState(1);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setLocation({
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    });
  };

  const handleStartAdventure = async () => {
    if (!location) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    setLoading(true);

    const config = {
      transport,
      totalTime,
      groupSize,
      startLocation: location,
      filters: [],
    };

    try {
      // Create session
      const response = await api.post('/sessions', config);
      const session = response.data.data.session;

      dispatch(setConfiguration(config));
      dispatch(setSession(session));

      navigation.navigate('Wheel', { sessionId: session.id });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error?.message || 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Configure Your Adventure</Text>

        {/* Transport Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How will you travel?</Text>
          <View style={styles.buttonGroup}>
            <TransportButton
              icon="🚶"
              label="Walking"
              selected={transport === TransportMode.WALKING}
              onPress={() => setTransport(TransportMode.WALKING)}
            />
            <TransportButton
              icon="🚴"
              label="Cycling"
              selected={transport === TransportMode.CYCLING}
              onPress={() => setTransport(TransportMode.CYCLING)}
            />
            <TransportButton
              icon="🚗"
              label="Driving"
              selected={transport === TransportMode.DRIVING}
              onPress={() => setTransport(TransportMode.DRIVING)}
            />
          </View>
        </View>

        {/* Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How much time do you have?</Text>
          <View style={styles.timeSelector}>
            {[60, 120, 180, 240].map((minutes) => (
              <TimeButton
                key={minutes}
                minutes={minutes}
                selected={totalTime === minutes}
                onPress={() => setTotalTime(minutes)}
              />
            ))}
          </View>
        </View>

        {/* Group Size */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How many people?</Text>
          <View style={styles.groupSelector}>
            {[1, 2, 3, 4, 5].map((size) => (
              <GroupButton
                key={size}
                size={size}
                selected={groupSize === size}
                onPress={() => setGroupSize(size)}
              />
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.startButton, loading && styles.startButtonDisabled]}
          onPress={handleStartAdventure}
          disabled={loading || !location}
        >
          <Text style={styles.startButtonText}>
            {loading ? 'Starting...' : 'Start Adventure'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function TransportButton({
  icon,
  label,
  selected,
  onPress,
}: {
  icon: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.transportButton, selected && styles.transportButtonSelected]}
      onPress={onPress}
    >
      <Text style={styles.transportIcon}>{icon}</Text>
      <Text style={[styles.transportLabel, selected && styles.transportLabelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function TimeButton({
  minutes,
  selected,
  onPress,
}: {
  minutes: number;
  selected: boolean;
  onPress: () => void;
}) {
  const hours = minutes / 60;
  return (
    <TouchableOpacity
      style={[styles.timeButton, selected && styles.timeButtonSelected]}
      onPress={onPress}
    >
      <Text style={[styles.timeButtonText, selected && styles.timeButtonTextSelected]}>
        {hours}h
      </Text>
    </TouchableOpacity>
  );
}

function GroupButton({
  size,
  selected,
  onPress,
}: {
  size: number;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.groupButton, selected && styles.groupButtonSelected]}
      onPress={onPress}
    >
      <Text style={[styles.groupButtonText, selected && styles.groupButtonTextSelected]}>
        {size}
      </Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  transportButton: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  transportButtonSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  transportIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  transportLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  transportLabelSelected: {
    color: '#6366f1',
    fontWeight: '600',
  },
  timeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  timeButtonSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  timeButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  timeButtonTextSelected: {
    color: '#6366f1',
    fontWeight: '600',
  },
  groupSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  groupButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  groupButtonSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  groupButtonText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '500',
  },
  groupButtonTextSelected: {
    color: '#6366f1',
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
