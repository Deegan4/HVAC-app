import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <AlertCircle size={64} color="#EF4444" style={styles.icon} />
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              We&apos;re sorry, but the app encountered an unexpected error.
            </Text>
            
            <ScrollView style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Error Details:</Text>
              <Text style={styles.errorText}>{this.state.error.message}</Text>
              {__DEV__ && this.state.error.stack && (
                <>
                  <Text style={styles.errorTitle}>Stack Trace:</Text>
                  <Text style={styles.errorStack}>{this.state.error.stack}</Text>
                </>
              )}
            </ScrollView>

            <TouchableOpacity 
              style={styles.button} 
              onPress={this.resetError}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 500,
    width: '100%',
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  errorContainer: {
    width: '100%',
    maxHeight: 200,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#991B1B',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    marginBottom: 12,
    lineHeight: 20,
  },
  errorStack: {
    fontSize: 12,
    color: '#DC2626',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
});

export default ErrorBoundary;
