import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8,
  style 
}: SkeletonLoaderProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonJobCard() {
  return (
    <View style={styles.jobCard}>
      <View style={styles.jobCardHeader}>
        <SkeletonLoader width={100} height={16} />
        <SkeletonLoader width={80} height={20} borderRadius={6} />
      </View>
      
      <SkeletonLoader width="70%" height={18} style={{ marginBottom: 8 }} />
      
      <View style={styles.jobCardRow}>
        <SkeletonLoader width={20} height={20} borderRadius={10} />
        <SkeletonLoader width="60%" height={14} />
      </View>
      
      <View style={styles.jobCardFooter}>
        <SkeletonLoader width={120} height={14} />
        <SkeletonLoader width={80} height={14} />
      </View>
      
      <SkeletonLoader width="100%" height={36} style={{ marginTop: 8 }} />
    </View>
  );
}

export function SkeletonInvoiceCard() {
  return (
    <View style={styles.invoiceCard}>
      <View style={styles.invoiceHeader}>
        <View>
          <SkeletonLoader width={100} height={16} style={{ marginBottom: 4 }} />
          <SkeletonLoader width={80} height={12} />
        </View>
        <SkeletonLoader width={70} height={20} borderRadius={6} />
      </View>
      
      <View style={styles.customerRow}>
        <SkeletonLoader width={14} height={14} borderRadius={7} />
        <SkeletonLoader width="60%" height={14} />
      </View>
      
      <View style={styles.itemsList}>
        <SkeletonLoader width="90%" height={13} style={{ marginBottom: 4 }} />
        <SkeletonLoader width="80%" height={13} />
      </View>
      
      <View style={styles.invoiceFooter}>
        <View>
          <SkeletonLoader width={60} height={11} style={{ marginBottom: 4 }} />
          <SkeletonLoader width={80} height={13} />
        </View>
        <View style={styles.totalContainer}>
          <SkeletonLoader width={40} height={11} style={{ marginBottom: 4 }} />
          <SkeletonLoader width={90} height={18} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonCustomerItem() {
  return (
    <View style={styles.customerItem}>
      <SkeletonLoader width="70%" height={17} />
      <SkeletonLoader width={22} height={22} borderRadius={11} />
    </View>
  );
}

export function SkeletonStatCard() {
  return (
    <View style={styles.statCard}>
      <SkeletonLoader width={28} height={28} borderRadius={14} style={{ marginBottom: 8 }} />
      <SkeletonLoader width={50} height={28} style={{ marginBottom: 4 }} />
      <SkeletonLoader width={60} height={11} />
    </View>
  );
}

export function SkeletonList({ count = 3, CardComponent = SkeletonJobCard }: { 
  count?: number; 
  CardComponent?: React.ComponentType;
}) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, index) => (
        <CardComponent key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.border,
  },
  jobCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  jobCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  invoiceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  itemsList: {
    marginBottom: 12,
  },
  invoiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  customerItem: {
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  list: {
    paddingHorizontal: 16,
  },
});
