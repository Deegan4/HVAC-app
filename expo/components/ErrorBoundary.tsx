import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

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

  getErrorMessage = (error: Error): string => {
    const errorLower = error.message.toLowerCase();
    
    if (errorLower.includes('network') || errorLower.includes('fetch')) {
      return 'Unable to connect. Please check your internet connection and try again.';
    }
    if (errorLower.includes('timeout')) {
      return 'The request took too long. Please try again.';
    }
    if (errorLower.includes('permission')) {
      return 'This action requires additional permissions. Please check your app settings.';
    }
    if (errorLower.includes('storage') || errorLower.includes('asyncstorage')) {
      return 'Unable to save your data. Please free up some storage space and try again.';
    }
    if (errorLower.includes('auth')) {
      return 'Session expired. Please log in again.';
    }
    
    return 'We encountered an unexpected error. Please try again or restart the app.';
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      const errorMessage = this.getErrorMessage(this.state.error);

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <AlertCircle size={72} color={Colors.error} />
            </View>
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>{errorMessage}</Text>
            
            {__DEV__ && (
              <ScrollView style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Debug Info:</Text>
                <Text style={styles.errorText}>{this.state.error.message}</Text>
                {this.state.error.stack && (
                  <>
                    <Text style={styles.errorTitle}>Stack Trace:</Text>
                    <Text style={styles.errorStack}>{this.state.error.stack}</Text>
                  </>
                )}
              </ScrollView>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.button} 
                onPress={this.resetError}
                activeOpacity={0.7}
              >
                <RefreshCw size={18} color={Colors.text.inverse} />
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.supportText}>
              If this problem persists, please contact support.
            </Text>
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
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 12,
    textAlign: 'center' as const,
  },
  message: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  errorContainer: {
    width: '100%',
    maxHeight: 150,
    backgroundColor: Colors.error + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.error,
    marginBottom: 6,
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
    marginBottom: 12,
    lineHeight: 18,
  },
  errorStack: {
    fontSize: 11,
    color: Colors.error,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: Colors.text.inverse,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  secondaryButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  supportText: {
    fontSize: 13,
    color: Colors.text.light,
    textAlign: 'center' as const,
  },
});

export default ErrorBoundary;
