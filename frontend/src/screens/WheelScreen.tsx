import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setActivity, setLoading } from '../store/slices/activitySlice';
import api from '../services/api';

type WheelScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Wheel'>;
  route: RouteProp<RootStackParamList, 'Wheel'>;
};

export default function WheelScreen({ navigation, route }: WheelScreenProps) {
  const { sessionId } = route.params;
  const dispatch = useDispatch();
  const { currentSession, configuration } = useSelector((state: RootState) => state.session);
  const [spinning, setSpinning] = useState(false);
  const [rotation] = useState(new Animated.Value(0));

  const spinWheel = async () => {
    if (!configuration) return;

    setSpinning(true);
    dispatch(setLoading(true));

    // Animate wheel spinning
    Animated.sequence([
      Animated.timing(rotation, {
        toValue: 5,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      // Generate activity
      const response = await api.post('/activities/generate', {
        location: configuration.startLocation,
        transport: configuration.transport,
        time: configuration.totalTime,
        groupSize: configuration.groupSize,
        filters: configuration.filters || [],
      });

      const suggestion = response.data.data.suggestion;

      // Add activity to session
      await api.post(`/sessions/${sessionId}/activities/${suggestion.activity.id}`, {
        activityId: suggestion.activity.id,
        activityType: suggestion.activity.type,
      });

      dispatch(setActivity(suggestion));

      setTimeout(() => {
        setSpinning(false);
        dispatch(setLoading(false));
        navigation.navigate('ActivityDetail', {
          activityId: suggestion.activity.id,
          sessionId,
        });
      }, 500);
    } catch (error: any) {
      setSpinning(false);
      dispatch(setLoading(false));
      Alert.alert(
        'Error',
        error.response?.data?.error?.message || 'Failed to generate activity'
      );
    }
  };

  const rotateValue = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ready for an adventure?</Text>
      <Text style={styles.subtitle}>Spin the wheel to discover your next activity!</Text>

      <View style={styles.wheelContainer}>
        <Animated.View
          style={[
            styles.wheel,
            {
              transform: [{ rotate: rotateValue }],
            },
          ]}
        >
          <View style={styles.wheelSegment}>
            <Text style={styles.wheelText}>?</Text>
          </View>
        </Animated.View>
      </View>

      <TouchableOpacity
        style={[styles.spinButton, spinning && styles.spinButtonDisabled]}
        onPress={spinWheel}
        disabled={spinning}
      >
        <Text style={styles.spinButtonText}>
          {spinning ? 'Spinning...' : 'Spin the Wheel!'}
        </Text>
      </TouchableOpacity>

      {currentSession && currentSession.skips.used < currentSession.skips.available && (
        <Text style={styles.skipInfo}>
          You have {currentSession.skips.available - currentSession.skips.used} skips remaining
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 48,
  },
  wheelContainer: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
  },
  wheel: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  wheelSegment: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelText: {
    fontSize: 80,
    color: '#fff',
    fontWeight: 'bold',
  },
  spinButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  spinButtonDisabled: {
    opacity: 0.6,
  },
  spinButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  skipInfo: {
    marginTop: 24,
    fontSize: 14,
    color: '#6b7280',
  },
});
