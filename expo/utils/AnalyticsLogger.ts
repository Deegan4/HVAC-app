/**
 * Centralized analytics logger for AGCC.
 * Currently writes structured logs to the console.
 * Replace the `send` implementation with a real analytics SDK
 * (Firebase, Mixpanel, Amplitude, etc.) when ready.
 */

type EventCategory = 'onboarding' | 'auth' | 'navigation' | 'theme' | 'tracking' | 'invoice' | 'customer' | 'job' | 'error';

interface AnalyticsEvent {
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

class AnalyticsLogger {
  private static instance: AnalyticsLogger;
  private enabled = __DEV__;

  private constructor() {}

  static getInstance(): AnalyticsLogger {
    if (!AnalyticsLogger.instance) {
      AnalyticsLogger.instance = new AnalyticsLogger();
    }
    return AnalyticsLogger.instance;
  }

  private send(event: AnalyticsEvent) {
    if (!this.enabled) return;
    console.log(`[Analytics] ${event.category}/${event.action}`, {
      ...(event.label ? { label: event.label } : {}),
      ...(event.value !== undefined ? { value: event.value } : {}),
      ...(event.metadata ?? {}),
      ts: event.timestamp,
    });
  }

  private makeEvent(category: EventCategory, action: string, opts?: { label?: string; value?: number; metadata?: Record<string, unknown> }): AnalyticsEvent {
    return {
      category,
      action,
      label: opts?.label,
      value: opts?.value,
      metadata: opts?.metadata,
      timestamp: new Date().toISOString(),
    };
  }

  // Onboarding
  languageSelected(language: string) {
    this.send(this.makeEvent('onboarding', 'language_selected', { label: language }));
  }

  roleSelected(role: string) {
    this.send(this.makeEvent('onboarding', 'role_selected', { label: role }));
  }

  onboardingCompleted() {
    this.send(this.makeEvent('onboarding', 'onboarding_completed'));
  }

  onboardingSkipped(step: number) {
    this.send(this.makeEvent('onboarding', 'onboarding_skipped', { value: step }));
  }

  // Auth
  pinCreated() {
    this.send(this.makeEvent('auth', 'pin_created'));
  }

  loginSuccess(method: 'pin' | 'biometric') {
    this.send(this.makeEvent('auth', 'login_success', { label: method }));
  }

  loginFailed() {
    this.send(this.makeEvent('auth', 'login_failed'));
  }

  logout() {
    this.send(this.makeEvent('auth', 'logout'));
  }

  // Theme
  themeToggled(mode: 'light' | 'dark') {
    this.send(this.makeEvent('theme', 'theme_toggled', { label: mode }));
  }

  // Navigation
  screenViewed(screenName: string) {
    this.send(this.makeEvent('navigation', 'screen_viewed', { label: screenName }));
  }

  // Tracking
  technicianLocationViewed(technicianId: string) {
    this.send(this.makeEvent('tracking', 'technician_location_viewed', { label: technicianId }));
  }

  // CRUD
  entityCreated(type: 'job' | 'customer' | 'invoice') {
    this.send(this.makeEvent(type, `${type}_created`));
  }

  entityDeleted(type: 'job' | 'customer' | 'invoice') {
    this.send(this.makeEvent(type, `${type}_deleted`));
  }

  // Errors
  errorOccurred(screen: string, error: string) {
    this.send(this.makeEvent('error', 'error_occurred', { label: screen, metadata: { error } }));
  }
}

export default AnalyticsLogger;
