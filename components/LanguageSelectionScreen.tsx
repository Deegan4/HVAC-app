import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Colors } from '@/constants/colors';
import SpinningSnowflake from './SpinningSnowflake';
import SnowingBackground from './SnowingBackground';
import { Globe } from 'lucide-react-native';

export type Language = 'en' | 'es';

interface LanguageSelectionScreenProps {
  onLanguageSelected: (language: Language) => void;
}

export default function LanguageSelectionScreen({ onLanguageSelected }: LanguageSelectionScreenProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
  };

  const handleContinue = () => {
    if (selectedLanguage) {
      console.log('Language selection - continuing with:', selectedLanguage);
      onLanguageSelected(selectedLanguage);
    }
  };

  const languageOptions = [
    {
      id: 'en' as Language,
      title: 'English',
      nativeTitle: 'English',
      flag: '🇺🇸',
      color: '#3b82f6',
    },
    {
      id: 'es' as Language,
      title: 'Spanish',
      nativeTitle: 'Español',
      flag: '🇪🇸',
      color: '#ef4444',
    },
  ];

  return (
    <SnowingBackground snowflakeCount={30}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <SpinningSnowflake size={80} color={Colors.primary} duration={3000} />
            <Text style={styles.title}>Oliva Refrigeration</Text>
            <View style={styles.iconContainer}>
              <Globe size={32} color="#ffffff" />
            </View>
            <Text style={styles.subtitle}>
              {selectedLanguage === 'es' 
                ? 'Seleccione su idioma preferido'
                : 'Select your preferred language'}
            </Text>
          </View>

          <View style={styles.languageSection}>
            {languageOptions.map((language) => {
              const isSelected = selectedLanguage === language.id;
              
              return (
                <TouchableOpacity
                  key={language.id}
                  style={[
                    styles.languageCard,
                    isSelected && styles.languageCardSelected,
                    { borderColor: isSelected ? language.color : 'rgba(255, 255, 255, 0.2)' }
                  ]}
                  onPress={() => handleLanguageSelect(language.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.languageCardContent}>
                    <Text style={styles.flag}>{language.flag}</Text>
                    
                    <View style={styles.languageInfo}>
                      <Text style={[
                        styles.languageTitle,
                        { color: isSelected ? language.color : '#ffffff' }
                      ]}>
                        {language.title}
                      </Text>
                      <Text style={styles.languageNativeTitle}>
                        {language.nativeTitle}
                      </Text>
                    </View>
                    
                    <View style={[
                      styles.radioButton,
                      { borderColor: isSelected ? language.color : 'rgba(255, 255, 255, 0.3)' }
                    ]}>
                      {isSelected && (
                        <View style={[
                          styles.radioButtonInner,
                          { backgroundColor: language.color }
                        ]} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[
              styles.continueButton,
              selectedLanguage && styles.continueButtonActive,
              selectedLanguage && { 
                backgroundColor: languageOptions.find(l => l.id === selectedLanguage)?.color 
              }
            ]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={!selectedLanguage}
          >
            <Text style={[
              styles.continueButtonText,
              selectedLanguage && styles.continueButtonTextActive
            ]}>
              {selectedLanguage === 'es' ? 'Continuar' : 'Continue'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {selectedLanguage === 'es' 
                ? 'Puede cambiar el idioma más tarde en la configuración'
                : 'You can change the language later in settings'}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </SnowingBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    textAlign: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 18,
    color: '#e2e8f0',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  languageSection: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  languageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  languageCardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  languageCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  flag: {
    fontSize: 48,
    marginRight: 16,
  },
  languageInfo: {
    flex: 1,
  },
  languageTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
  },
  languageNativeTitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  continueButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  continueButtonActive: {
    borderColor: 'transparent',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  continueButtonTextActive: {
    color: '#ffffff',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
