import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationPreferences {
  jobReminders: boolean;
  invoiceAlerts: boolean;
  teamMessages: boolean;
  dailySummary: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  jobReminders: true,
  invoiceAlerts: true,
  teamMessages: true,
  dailySummary: false,
};

class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<string | null> {
    console.log('NotificationService: Initializing...');

    if (Platform.OS === 'web') {
      console.log('NotificationService: Web platform, skipping native setup');
      return null;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('NotificationService: Permission not granted');
        return null;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#0066CC',
        });

        await Notifications.setNotificationChannelAsync('jobs', {
          name: 'Job Notifications',
          description: 'Notifications about job updates and reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#10B981',
        });

        await Notifications.setNotificationChannelAsync('invoices', {
          name: 'Invoice Notifications',
          description: 'Notifications about invoices and payments',
          importance: Notifications.AndroidImportance.DEFAULT,
          lightColor: '#F59E0B',
        });

        await Notifications.setNotificationChannelAsync('messages', {
          name: 'Message Notifications',
          description: 'Notifications about team messages',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 100, 100, 100],
          lightColor: '#8B5CF6',
        });
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      this.expoPushToken = tokenData.data;
      console.log('NotificationService: Push token:', this.expoPushToken);

      return this.expoPushToken;
    } catch (error) {
      console.error('NotificationService: Error initializing:', error);
      return null;
    }
  }

  setupListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void
  ): void {
    if (Platform.OS === 'web') return;

    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('NotificationService: Notification received:', notification);
        onNotificationReceived?.(notification);
      }
    );

    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('NotificationService: Notification response:', response);
        onNotificationResponse?.(response);
      }
    );
  }

  removeListeners(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
      this.notificationListener = null;
    }
    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = null;
    }
  }

  async scheduleJobReminder(
    jobId: string,
    customerName: string,
    jobType: string,
    scheduledDate: Date,
    reminderMinutesBefore: number = 30
  ): Promise<string | null> {
    if (Platform.OS === 'web') return null;

    const preferences = await this.getPreferences();
    if (!preferences.jobReminders) return null;

    const triggerDate = new Date(scheduledDate.getTime() - reminderMinutesBefore * 60 * 1000);
    
    if (triggerDate <= new Date()) {
      console.log('NotificationService: Reminder time has already passed');
      return null;
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Upcoming Job Reminder',
          body: `${jobType} for ${customerName} starts in ${reminderMinutesBefore} minutes`,
          data: { type: 'job_reminder', jobId },
          sound: 'default',
        },
        trigger: {
          date: triggerDate,
          channelId: 'jobs',
        },
      });

      console.log('NotificationService: Job reminder scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('NotificationService: Error scheduling job reminder:', error);
      return null;
    }
  }

  async sendInvoiceAlert(
    invoiceId: string,
    customerName: string,
    amount: number,
    type: 'new' | 'overdue' | 'paid'
  ): Promise<void> {
    if (Platform.OS === 'web') return;

    const preferences = await this.getPreferences();
    if (!preferences.invoiceAlerts) return;

    const messages = {
      new: `New invoice for ${customerName}: $${amount.toFixed(2)}`,
      overdue: `Invoice for ${customerName} is overdue: $${amount.toFixed(2)}`,
      paid: `Payment received from ${customerName}: $${amount.toFixed(2)}`,
    };

    const titles = {
      new: 'Invoice Created',
      overdue: 'Invoice Overdue',
      paid: 'Payment Received',
    };

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: titles[type],
          body: messages[type],
          data: { type: 'invoice_alert', invoiceId },
          sound: 'default',
        },
        trigger: null,
      });
    } catch (error) {
      console.error('NotificationService: Error sending invoice alert:', error);
    }
  }

  async sendMessageNotification(
    senderId: string,
    senderName: string,
    messagePreview: string
  ): Promise<void> {
    if (Platform.OS === 'web') return;

    const preferences = await this.getPreferences();
    if (!preferences.teamMessages) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Message from ${senderName}`,
          body: messagePreview.length > 100 
            ? messagePreview.substring(0, 100) + '...' 
            : messagePreview,
          data: { type: 'message', senderId },
          sound: 'default',
        },
        trigger: null,
      });
    } catch (error) {
      console.error('NotificationService: Error sending message notification:', error);
    }
  }

  async sendLocalNotification(
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: null,
      });
    } catch (error) {
      console.error('NotificationService: Error sending local notification:', error);
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('NotificationService: Notification cancelled:', notificationId);
    } catch (error) {
      console.error('NotificationService: Error cancelling notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('NotificationService: All notifications cancelled');
    } catch (error) {
      console.error('NotificationService: Error cancelling all notifications:', error);
    }
  }

  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const stored = await AsyncStorage.getItem('notificationPreferences');
      return stored ? JSON.parse(stored) : DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('NotificationService: Error getting preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  }

  async updatePreferences(updates: Partial<NotificationPreferences>): Promise<void> {
    try {
      const current = await this.getPreferences();
      const updated = { ...current, ...updates };
      await AsyncStorage.setItem('notificationPreferences', JSON.stringify(updated));
      console.log('NotificationService: Preferences updated:', updated);
    } catch (error) {
      console.error('NotificationService: Error updating preferences:', error);
    }
  }

  async getBadgeCount(): Promise<number> {
    if (Platform.OS === 'web') return 0;

    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('NotificationService: Error getting badge count:', error);
      return 0;
    }
  }

  async setBadgeCount(count: number): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('NotificationService: Error setting badge count:', error);
    }
  }

  getPushToken(): string | null {
    return this.expoPushToken;
  }
}

export default NotificationService;
