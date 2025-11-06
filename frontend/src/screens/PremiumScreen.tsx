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
import api from '../services/api';

type PremiumScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Premium'>;
};

export default function PremiumScreen({ navigation }: PremiumScreenProps) {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const response = await api.get('/premium/status');
      setIsPremium(response.data.data.isPremium);
    } catch (error) {
      console.error('Error checking premium status:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTrial = async () => {
    try {
      setLoading(true);
      await api.post('/premium/trial');
      Alert.alert(
        'Success!',
        'Your 7-day premium trial has started. Enjoy all premium features!',
        [{ text: 'OK', onPress: () => {
          setIsPremium(true);
          setLoading(false);
        }}]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error?.message || 'Failed to start trial');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (isPremium) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>⭐ PREMIUM</Text>
          </View>

          <Text style={styles.title}>You're Premium!</Text>
          <Text style={styles.subtitle}>
            Enjoy all premium features
          </Text>

          <View style={styles.featuresGrid}>
            <FeatureCard
              icon="📅"
              title="Daily Discovery"
              description="3 personalized suggestions every day"
              onPress={() => navigation.navigate('DailyMenu' as any)}
            />
            <FeatureCard
              icon="🎨"
              title="Themed Adventures"
              description="Curated experiences by theme"
              onPress={() => navigation.navigate('ThemedAdventures' as any)}
            />
            <FeatureCard
              icon="✈️"
              title="Vacation Explorer"
              description="Plan your perfect vacation"
              onPress={() => navigation.navigate('VacationPlanner' as any)}
            />
            <FeatureCard
              icon="📊"
              title="Statistics"
              description="Detailed insights & history"
              onPress={() => navigation.navigate('PremiumStats' as any)}
            />
          </View>

          <View style={styles.benefits}>
            <Text style={styles.benefitsTitle}>Your Premium Benefits:</Text>
            <BenefitItem icon="🚫" text="No advertisements" />
            <BenefitItem icon="🔄" text="5 skips per session (vs 1)" />
            <BenefitItem icon="🗺️" text="Unlimited radius (vs 25km)" />
            <BenefitItem icon="🎯" text="Premium challenges" />
            <BenefitItem icon="📸" text="Unlimited photo uploads" />
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Upgrade to Premium</Text>
        <Text style={styles.subtitle}>
          Unlock the full Make My Day experience
        </Text>

        <View style={styles.pricing}>
          <PricingCard
            title="Monthly"
            price="€1.50"
            period="per month"
            onPress={() => Alert.alert('Coming Soon', 'Payment integration in progress')}
          />
          <PricingCard
            title="Yearly"
            price="€12.00"
            period="per year"
            badge="Save €6!"
            highlighted
            onPress={() => Alert.alert('Coming Soon', 'Payment integration in progress')}
          />
        </View>

        <View style={styles.benefits}>
          <Text style={styles.benefitsTitle}>Premium Features:</Text>
          <BenefitItem icon="📅" text="Daily Discovery Menu - 3 suggestions daily" />
          <BenefitItem icon="🎨" text="Themed Adventures - Curated routes" />
          <BenefitItem icon="✈️" text="Vacation Explorer - 2x per year" />
          <BenefitItem icon="🚫" text="Ad-free experience" />
          <BenefitItem icon="🔄" text="5 skips per session" />
          <BenefitItem icon="🗺️" text="Unlimited radius" />
          <BenefitItem icon="🎯" text="Exclusive challenges" />
          <BenefitItem icon="📊" text="Advanced statistics" />
        </View>

        <TouchableOpacity
          style={styles.trialButton}
          onPress={startTrial}
          disabled={loading}
        >
          <Text style={styles.trialButtonText}>
            Start 7-Day Free Trial
          </Text>
        </TouchableOpacity>

        <Text style={styles.trialNote}>
          No credit card required. Cancel anytime.
        </Text>
      </View>
    </ScrollView>
  );
}

function FeatureCard({ icon, title, description, onPress }: any) {
  return (
    <TouchableOpacity style={styles.featureCard} onPress={onPress}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </TouchableOpacity>
  );
}

function PricingCard({ title, price, period, badge, highlighted, onPress }: any) {
  return (
    <TouchableOpacity
      style={[styles.pricingCard, highlighted && styles.pricingCardHighlighted]}
      onPress={onPress}
    >
      {badge && (
        <View style={styles.pricingBadge}>
          <Text style={styles.pricingBadgeText}>{badge}</Text>
        </View>
      )}
      <Text style={styles.pricingTitle}>{title}</Text>
      <Text style={styles.pricingPrice}>{price}</Text>
      <Text style={styles.pricingPeriod}>{period}</Text>
    </TouchableOpacity>
  );
}

function BenefitItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.benefitItem}>
      <Text style={styles.benefitIcon}>{icon}</Text>
      <Text style={styles.benefitText}>{text}</Text>
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
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: '#6b7280',
  },
  premiumBadge: {
    alignSelf: 'center',
    backgroundColor: '#fbbf24',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  premiumBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  featureCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  pricing: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  pricingCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pricingCardHighlighted: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  pricingBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  pricingBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  pricingPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  pricingPeriod: {
    fontSize: 14,
    color: '#6b7280',
  },
  benefits: {
    marginBottom: 32,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  trialButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  trialButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  trialNote: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6b7280',
  },
});
