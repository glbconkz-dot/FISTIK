import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { fetchHealth, fetchOrders } from './src/api';
import { getManagerSecret, loadStoredSecret, saveManagerSecret } from './src/config';
import { channelLabel, formatMoney, formatWhen, statusLabel } from './src/format';
import { registerForPush } from './src/notifications';
import type { ManagerOrder } from './src/types';

type LoadError = 'secret-missing' | 'unauthorized' | 'network' | null;

export default function App() {
  const [ready, setReady] = useState(false);
  const [orders, setOrders] = useState<ManagerOrder[]>([]);
  const [adminUrl, setAdminUrl] = useState('https://fistik.kz/admin/orders');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<LoadError>(null);
  const [secretDraft, setSecretDraft] = useState('');
  const [pushOk, setPushOk] = useState<boolean | null>(null);
  const [healthOk, setHealthOk] = useState<boolean | null>(null);
  const [activeDevices, setActiveDevices] = useState<number | null>(null);
  const appState = useRef(AppState.currentState);

  const load = useCallback(async (soft = false) => {
    if (!soft) setLoading(true);
    try {
      const health = await fetchHealth().catch(() => null);
      setHealthOk(health?.ok ?? false);
      setActiveDevices(health?.activeDevices ?? null);

      if (!getManagerSecret()) {
        setError('secret-missing');
        setOrders([]);
        return;
      }

      const data = await fetchOrders();
      setOrders(data.orders);
      setAdminUrl(data.adminUrl);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message === 'secret-missing') setError('secret-missing');
      else if (message === 'unauthorized') setError('unauthorized');
      else setError('network');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await loadStoredSecret();
      setReady(true);
      await load();
      if (getManagerSecret()) {
        void registerForPush()
          .then((token) => setPushOk(Boolean(token)))
          .catch(() => setPushOk(false));
      }
    })();
  }, [load]);

  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener(() => {
      void load(true);
    });
    const response = Notifications.addNotificationResponseReceivedListener(() => {
      void load(true);
    });
    return () => {
      sub.remove();
      response.remove();
    };
  }, [load]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        void load(true);
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [load]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (getManagerSecret()) void load(true);
    }, 30_000);
    return () => clearInterval(timer);
  }, [load]);

  const saveSecret = useCallback(async () => {
    const value = secretDraft.trim();
    if (!value) return;
    setSaving(true);
    try {
      await saveManagerSecret(value);
      await load();
      if (getManagerSecret()) {
        void registerForPush()
          .then((token) => setPushOk(Boolean(token)))
          .catch(() => setPushOk(false));
      }
      setSecretDraft('');
    } finally {
      setSaving(false);
    }
  }, [load, secretDraft]);

  const needsSecret = error === 'secret-missing' || error === 'unauthorized';

  if (!ready) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color="#4A2C11" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>fıstık</Text>
          <Text style={styles.title}>Sipariş uyarısı</Text>
        </View>
        <Pressable style={styles.adminBtn} onPress={() => void Linking.openURL(adminUrl)}>
          <Text style={styles.adminBtnText}>Admin</Text>
        </Pressable>
      </View>

      <View style={styles.statusRow}>
        <StatusPill ok={healthOk} label={healthOk ? 'Sunucu' : 'Sunucu yok'} />
        <StatusPill
          ok={pushOk}
          label={pushOk ? 'Bildirim açık' : pushOk === false ? 'Bildirim yok' : 'Bildirim'}
        />
        {activeDevices != null ? (
          <Text style={styles.deviceCount}>{activeDevices} cihaz</Text>
        ) : null}
      </View>

      {needsSecret ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.setup}
        >
          <Text style={styles.setupTitle}>
            {error === 'unauthorized' ? 'Anahtar eşleşmedi' : 'Uygulama anahtarı'}
          </Text>
          <Text style={styles.setupHint}>
            Vercel → fistik → Environment Variables → MANAGER_APP_SECRET değerini yapıştır.
          </Text>
          <TextInput
            value={secretDraft}
            onChangeText={setSecretDraft}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            secureTextEntry
            placeholder="MANAGER_APP_SECRET"
            placeholderTextColor="#A09070"
            style={styles.input}
          />
          <Pressable
            style={[styles.saveBtn, (!secretDraft.trim() || saving) && styles.saveBtnDisabled]}
            disabled={!secretDraft.trim() || saving}
            onPress={() => void saveSecret()}
          >
            <Text style={styles.saveBtnText}>{saving ? 'Kaydediliyor…' : 'Kaydet'}</Text>
          </Pressable>
        </KeyboardAvoidingView>
      ) : error === 'network' ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>Sunucuya ulaşılamadı. Aşağı çekerek yenileyin.</Text>
        </View>
      ) : null}

      {!needsSecret && loading && orders.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color="#4A2C11" />
          <Text style={styles.muted}>Siparişler yükleniyor…</Text>
        </View>
      ) : !needsSecret ? (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={orders.length === 0 ? styles.emptyList : styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void load(true);
              }}
              tintColor="#4A2C11"
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>Bekleyen sipariş yok. Aşağı çekerek yenileyin.</Text>
          }
          renderItem={({ item }) => <OrderCard order={item} />}
        />
      ) : null}
    </SafeAreaView>
  );
}

function StatusPill({ ok, label }: { ok: boolean | null; label: string }) {
  const tone = ok === true ? styles.pillOk : ok === false ? styles.pillBad : styles.pillWait;
  return (
    <View style={[styles.pill, tone]}>
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

function OrderCard({ order }: { order: ManagerOrder }) {
  const channel = channelLabel(order);
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.orderNo}>#{order.order_number}</Text>
        <View style={[styles.channel, channel === 'B2B' ? styles.channelB2b : styles.channelB2c]}>
          <Text style={channel === 'B2B' ? styles.channelTextLight : styles.channelTextDark}>
            {channel}
          </Text>
        </View>
      </View>
      <Text style={styles.customer}>{order.customer_name || 'Müşteri'}</Text>
      <Text style={styles.meta}>
        {formatMoney(order.total)} · {statusLabel(order.status)} · {formatWhen(order.created_at)}
      </Text>
      {order.phone ? <Text style={styles.meta}>{order.phone}</Text> : null}
      {order.delivery_date || order.delivery_time ? (
        <Text style={styles.meta}>
          Teslim {order.delivery_date || ''} {order.delivery_time || ''}
        </Text>
      ) : null}
      {order.address ? <Text style={styles.address}>{order.address}</Text> : null}
      {order.notes ? <Text style={styles.notes}>{order.notes}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F0E4' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 28,
    color: '#4A2C11',
    fontStyle: 'italic',
    fontWeight: '600',
  },
  title: { fontSize: 14, color: '#6B5420', marginTop: 2 },
  adminBtn: {
    backgroundColor: '#4A2C11',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  adminBtnText: { color: '#F4F0E4', fontWeight: '600' },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  pillOk: { backgroundColor: '#C5D46A' },
  pillBad: { backgroundColor: '#E8B4A0' },
  pillWait: { backgroundColor: '#E6DFC8' },
  pillText: { fontSize: 12, color: '#4A2C11', fontWeight: '600' },
  deviceCount: { fontSize: 12, color: '#6B5420' },
  setup: { paddingHorizontal: 20, paddingTop: 12, gap: 12 },
  setupTitle: { fontSize: 18, fontWeight: '700', color: '#4A2C11' },
  setupHint: { fontSize: 14, color: '#6B5420', lineHeight: 20 },
  input: {
    backgroundColor: '#FFFdf6',
    borderWidth: 1,
    borderColor: '#E4DCC4',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2C2114',
  },
  saveBtn: {
    backgroundColor: '#4A2C11',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.45 },
  saveBtnText: { color: '#F4F0E4', fontWeight: '700', fontSize: 16 },
  errorBanner: {
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: '#F6D6CC',
    borderRadius: 12,
    padding: 12,
  },
  errorText: { color: '#6B2410', fontSize: 13 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  muted: { color: '#6B5420' },
  list: { paddingHorizontal: 16, paddingBottom: 32, gap: 10 },
  emptyList: { flexGrow: 1, justifyContent: 'center', padding: 32 },
  empty: { textAlign: 'center', color: '#6B5420', fontSize: 15 },
  card: {
    backgroundColor: '#FFFdf6',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4DCC4',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNo: { fontSize: 18, fontWeight: '700', color: '#4A2C11' },
  channel: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  channelB2c: { backgroundColor: '#C5D46A' },
  channelB2b: { backgroundColor: '#4A2C11' },
  channelTextLight: { fontSize: 11, fontWeight: '700', color: '#F4F0E4' },
  channelTextDark: { fontSize: 11, fontWeight: '700', color: '#4A2C11' },
  customer: { marginTop: 8, fontSize: 16, color: '#2C2114', fontWeight: '600' },
  meta: { marginTop: 4, fontSize: 13, color: '#6B5420' },
  address: { marginTop: 8, fontSize: 13, color: '#2C2114' },
  notes: { marginTop: 6, fontSize: 13, fontStyle: 'italic', color: '#6B5420' },
});
