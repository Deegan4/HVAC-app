import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PanResponder,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { X, RotateCcw, Check } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface SignatureCaptureProps {
  onCapture: (signatureSvg: string) => void;
  onCancel: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const signatureWidth = screenWidth - 32;
const signatureHeight = screenHeight * 0.4;

export default function SignatureCapture({ onCapture, onCancel }: SignatureCaptureProps) {
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const pathRef = useRef<string>('');

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,

      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        if (locationX === undefined || locationY === undefined) return;
        const newPath = `M${locationX.toFixed(2)},${locationY.toFixed(2)}`;
        pathRef.current = newPath;
        setCurrentPath(newPath);
      },

      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        if (locationX === undefined || locationY === undefined) return;
        const newPath = `${pathRef.current} L${locationX.toFixed(2)},${locationY.toFixed(2)}`;
        pathRef.current = newPath;
        setCurrentPath(newPath);
      },

      onPanResponderRelease: () => {
        if (pathRef.current) {
          setPaths(prevPaths => [...prevPaths, pathRef.current]);
          setCurrentPath('');
          pathRef.current = '';
        }
      },

      onPanResponderTerminate: () => {
        if (pathRef.current) {
          setPaths(prevPaths => [...prevPaths, pathRef.current]);
          setCurrentPath('');
          pathRef.current = '';
        }
      },
    })
  ).current;

  const clearSignature = () => {
    setPaths([]);
    setCurrentPath('');
    pathRef.current = '';
  };

  const saveSignature = () => {
    const allPaths = [...paths];
    if (currentPath) {
      allPaths.push(currentPath);
    }

    if (allPaths.length === 0) {
      return;
    }

    const svgString = `
      <svg width="${signatureWidth}" height="${signatureHeight}" xmlns="http://www.w3.org/2000/svg">
        ${allPaths.map(path => `<path d="${path}" stroke="#000000" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />`).join('')}
      </svg>
    `.trim();

    onCapture(svgString);
  };

  const hasSignature = paths.length > 0 || currentPath.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onCancel}>
          <X size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer Signature</Text>
        <TouchableOpacity 
          style={[styles.headerButton, !hasSignature && styles.disabledButton]} 
          onPress={clearSignature}
          disabled={!hasSignature}
        >
          <RotateCcw size={24} color={hasSignature ? Colors.text.primary : Colors.text.light} />
        </TouchableOpacity>
      </View>

      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          Please sign below to confirm service completion
        </Text>
      </View>

      <View style={styles.signatureContainer}>
        <View 
          style={styles.signatureArea}
          {...panResponder.panHandlers}
          collapsable={false}
        >
          <Svg
            width={signatureWidth}
            height={signatureHeight}
            style={styles.svg}
          >
            {paths.map((path, index) => (
              <Path
                key={index}
                d={path}
                stroke={Colors.text.primary}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {currentPath && (
              <Path
                d={currentPath}
                stroke={Colors.text.primary}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </Svg>
          
          {!hasSignature && (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>Sign here</Text>
              <View style={styles.signatureLine} />
            </View>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerButton, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.footerButton, 
            styles.saveButton,
            !hasSignature && styles.disabledSaveButton
          ]}
          onPress={saveSignature}
          disabled={!hasSignature}
        >
          <Check size={20} color={hasSignature ? Colors.text.inverse : Colors.text.light} />
          <Text style={[
            styles.saveButtonText,
            !hasSignature && styles.disabledSaveButtonText
          ]}>
            Save Signature
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  disabledButton: {
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  instructionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  instructionText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
    lineHeight: 24,
  },
  signatureContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  signatureArea: {
    width: signatureWidth,
    height: signatureHeight,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    position: 'relative',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  placeholderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: Colors.text.light,
    marginBottom: 20,
  },
  signatureLine: {
    width: signatureWidth * 0.6,
    height: 2,
    backgroundColor: Colors.border,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  disabledSaveButton: {
    backgroundColor: Colors.text.light,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
  },
  disabledSaveButtonText: {
    color: Colors.text.light,
  },
});