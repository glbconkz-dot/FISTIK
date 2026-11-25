import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { registerDevice } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function setupPushChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('orders', {
    name: 'Siparişler',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    sound: 'default',
    enableVibrate: true,
  });
}

export async function registerForPush(): Promise<string | null> {
  await setupPushChannel();

  if (!Device.isDevice) {
    return null;
  }

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== 'granted') {
    const asked = await Notifications.requestPermissionsAsync();
    status = asked.status;
  }
  if (status !== 'granted') {
    return null;
  }

  const projectId =
    Constants.easConfig?.projectId ??
    (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas
      ?.projectId;

  const token = (
    await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)
  ).data;

  await registerDevice({
    expoPushToken: token,
    deviceName: Device.deviceName ?? Device.modelName ?? 'iPhone',
    platform: Platform.OS,
  });

  return token;
}
