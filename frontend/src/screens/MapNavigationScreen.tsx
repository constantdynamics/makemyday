import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import MapView, { Marker, Polyline } from 'react-native-maps';

type MapNavigationScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MapNavigation'>;
  route: RouteProp<RootStackParamList, 'MapNavigation'>;
};

export default function MapNavigationScreen({ navigation, route }: MapNavigationScreenProps) {
  const { activityId, sessionId } = route.params;
  const { currentActivity } = useSelector((state: RootState) => state.activity);
  const { configuration } = useSelector((state: RootState) => state.session);

  if (!currentActivity || !configuration) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const { activity, route: routeInfo } = currentActivity;
  const [lng, lat] = activity.location.coordinates;

  // Convert route geometry to polyline coordinates
  const routeCoordinates = routeInfo.geometry?.coordinates?.map(
    (coord: [number, number]) => ({
      latitude: coord[1],
      longitude: coord[0],
    })
  ) || [];

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: configuration.startLocation.lat,
          longitude: configuration.startLocation.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* User location */}
        <Marker
          coordinate={{
            latitude: configuration.startLocation.lat,
            longitude: configuration.startLocation.lng,
          }}
          title="Your Location"
          pinColor="blue"
        />

        {/* Destination */}
        <Marker
          coordinate={{
            latitude: lat,
            longitude: lng,
          }}
          title={activity.title.en || 'Destination'}
          pinColor="red"
        />

        {/* Route */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#6366f1"
            strokeWidth={4}
          />
        )}
      </MapView>

      <View style={styles.bottomSheet}>
        <Text style={styles.bottomSheetTitle}>Navigate to your destination</Text>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => navigation.navigate('Completion', { sessionId })}
        >
          <Text style={styles.completeButtonText}>I've Arrived!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#fff',
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  completeButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
