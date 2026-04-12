import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import type { CatalogueItem, PoolBalance } from '@credx/shared';
import { formatCurrency } from '@credx/shared';

export default function App() {
  const testBalance: PoolBalance = { confirmed: 549, pending: 120 };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unloqs Mobile</Text>
      <Text style={styles.subtitle}>
        Pool Balance: {formatCurrency(testBalance.confirmed)}
      </Text>
      <Text style={styles.info}>@credx/shared imported successfully</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#1e3a5f', marginBottom: 4 },
  info: { fontSize: 14, color: '#22c55e', marginTop: 16 },
});
