import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { FileText, Upload, CheckCircle2, FileInput } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import * as DocumentPicker from 'expo-document-picker';
import { useAppStore } from '@/hooks/app-store';


interface ParsedNote {
  title: string;
  content: string;
  date?: string;
  type: 'customer' | 'job' | 'general';
  parsedData?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    description?: string;
  };
}

export default function ImportNotesScreen() {
  const { addCustomer, addJob, customers } = useAppStore();
  const [parsedNotes, setParsedNotes] = useState<ParsedNote[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Set<number>>(new Set());

  const parseNotesToCustomersAndJobs = (noteText: string): ParsedNote[] => {
    const notes: ParsedNote[] = [];
    
    const lines = noteText.split('\n');
    let currentNote: Partial<ParsedNote> = {};
    let currentContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line === '' && currentNote.title && currentContent.length > 0) {
        const content = currentContent.join('\n');
        const parsedData = extractDataFromContent(content);
        
        notes.push({
          title: currentNote.title || 'Untitled',
          content,
          type: determineNoteType(currentNote.title || '', content),
          parsedData,
        } as ParsedNote);
        
        currentNote = {};
        currentContent = [];
      } else if (line !== '') {
        if (!currentNote.title) {
          currentNote.title = line;
        } else {
          currentContent.push(line);
        }
      }
    }
    
    if (currentNote.title && currentContent.length > 0) {
      const content = currentContent.join('\n');
      const parsedData = extractDataFromContent(content);
      
      notes.push({
        title: currentNote.title,
        content,
        type: determineNoteType(currentNote.title, content),
        parsedData,
      } as ParsedNote);
    }

    return notes;
  };

  const extractDataFromContent = (content: string): ParsedNote['parsedData'] => {
    const data: ParsedNote['parsedData'] = {};
    
    const phoneRegex = /(?:phone|tel|mobile|cell)[\s:]*([0-9\-\(\)\s]+)/i;
    const emailRegex = /(?:email|e-mail)[\s:]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const addressRegex = /(?:address|location|addr)[\s:]*([^\n]+)/i;
    const nameRegex = /(?:name|customer)[\s:]*([^\n]+)/i;

    const phoneMatch = content.match(phoneRegex);
    if (phoneMatch) data.phone = phoneMatch[1].trim();

    const emailMatch = content.match(emailRegex);
    if (emailMatch) data.email = emailMatch[1].trim();

    const addressMatch = content.match(addressRegex);
    if (addressMatch) data.address = addressMatch[1].trim();

    const nameMatch = content.match(nameRegex);
    if (nameMatch) data.name = nameMatch[1].trim();

    data.description = content;

    return data;
  };

  const determineNoteType = (title: string, content: string): ParsedNote['type'] => {
    const customerKeywords = ['customer', 'client', 'contact'];
    const jobKeywords = ['job', 'work', 'service', 'repair', 'install', 'maintenance'];
    
    const lowerTitle = title.toLowerCase();
    const lowerContent = content.toLowerCase();
    
    const hasCustomerKeyword = customerKeywords.some(
      (keyword) => lowerTitle.includes(keyword) || lowerContent.includes(keyword)
    );
    const hasJobKeyword = jobKeywords.some(
      (keyword) => lowerTitle.includes(keyword) || lowerContent.includes(keyword)
    );

    if (hasCustomerKeyword && !hasJobKeyword) return 'customer';
    if (hasJobKeyword) return 'job';
    return 'general';
  };

  const handleFilePick = async () => {
    try {
      setIsProcessing(true);
      
      if (Platform.OS === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,.text';
        input.onchange = async (event: any) => {
          const file = event.target.files[0];
          if (file) {
            const text = await file.text();
            const parsed = parseNotesToCustomersAndJobs(text);
            setParsedNotes(parsed);
            setIsProcessing(false);
            Alert.alert('Success', `Found ${parsed.length} notes to import`);
          } else {
            setIsProcessing(false);
          }
        };
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
      } else {
        const result = await DocumentPicker.getDocumentAsync({
          type: 'text/plain',
          copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets[0]) {
          const response = await fetch(result.assets[0].uri);
          const text = await response.text();
          const parsed = parseNotesToCustomersAndJobs(text);
          setParsedNotes(parsed);
          Alert.alert('Success', `Found ${parsed.length} notes to import`);
        }
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('File pick error:', error);
      Alert.alert('Error', 'Failed to read notes file');
      setIsProcessing(false);
    }
  };

  const handlePasteNotes = () => {
    Alert.prompt(
      'Paste Notes',
      'Paste your Apple Notes text here:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Parse',
          onPress: (text?: string) => {
            if (text) {
              const parsed = parseNotesToCustomersAndJobs(text);
              setParsedNotes(parsed);
              Alert.alert('Success', `Found ${parsed.length} notes to import`);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const toggleNoteSelection = (index: number) => {
    const newSelected = new Set(selectedNotes);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedNotes(newSelected);
  };

  const handleImport = () => {
    if (selectedNotes.size === 0) {
      Alert.alert('No Selection', 'Please select at least one note to import');
      return;
    }

    let customersAdded = 0;
    let jobsAdded = 0;

    selectedNotes.forEach((index) => {
      const note = parsedNotes[index];
      
      if (note.type === 'customer' && note.parsedData) {
        const customerData = {
          name: note.parsedData.name || note.title,
          email: note.parsedData.email || '',
          phone: note.parsedData.phone || '',
          address: note.parsedData.address || '',
          notes: note.content,
        };
        
        addCustomer(customerData);
        customersAdded++;
      } else if (note.type === 'job') {
        const jobData = {
          customerId: customers[0]?.id || 'unknown',
          customerName: note.parsedData?.name || note.title,
          address: note.parsedData?.address || '',
          type: 'repair' as const,
          description: note.content,
          scheduledDate: new Date().toISOString().split('T')[0],
          scheduledTime: '09:00',
          status: 'scheduled' as const,
          priority: 'normal' as const,
        };
        
        addJob(jobData);
        jobsAdded++;
      }
    });

    Alert.alert(
      'Import Complete',
      `Successfully imported:\n${customersAdded} customers\n${jobsAdded} jobs`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const getTypeColor = (type: ParsedNote['type']) => {
    switch (type) {
      case 'customer':
        return Colors.primary;
      case 'job':
        return Colors.status.scheduled;
      default:
        return Colors.text.secondary;
    }
  };

  const getTypeIcon = (type: ParsedNote['type']) => {
    switch (type) {
      case 'customer':
        return '👤';
      case 'job':
        return '🔧';
      default:
        return '📝';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Import Apple Notes',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text.primary,
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <FileText size={48} color={Colors.primary} />
          <Text style={styles.title}>Import Notes</Text>
          <Text style={styles.subtitle}>
            Import customer information and jobs from your Apple Notes
          </Text>
        </View>

        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How it works:</Text>
          <Text style={styles.instructionText}>
            1. Export your notes from Apple Notes as text{'\n'}
            2. The app will automatically detect customers and jobs{'\n'}
            3. Review and select which items to import{'\n'}
            4. Customer notes should include phone, email, and address{'\n'}
            5. Job notes should include service details
          </Text>
        </View>

        {parsedNotes.length === 0 ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleFilePick}
              disabled={isProcessing}
            >
              <Upload size={20} color={Colors.text.inverse} />
              <Text style={styles.primaryButtonText}>
                {isProcessing ? 'Processing...' : 'Import from File'}
              </Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handlePasteNotes}
              >
                <FileInput size={20} color={Colors.primary} />
                <Text style={styles.secondaryButtonText}>Paste Notes Text</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                Found {parsedNotes.length} Notes
              </Text>
              <Text style={styles.resultsSubtitle}>
                Select items to import ({selectedNotes.size} selected)
              </Text>
            </View>

            {parsedNotes.map((note, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.noteCard,
                  selectedNotes.has(index) && styles.noteCardSelected,
                ]}
                onPress={() => toggleNoteSelection(index)}
              >
                <View style={styles.noteHeader}>
                  <View style={styles.noteTypeContainer}>
                    <Text style={styles.noteTypeIcon}>{getTypeIcon(note.type)}</Text>
                    <Text
                      style={[
                        styles.noteType,
                        { color: getTypeColor(note.type) },
                      ]}
                    >
                      {note.type.charAt(0).toUpperCase() + note.type.slice(1)}
                    </Text>
                  </View>
                  {selectedNotes.has(index) && (
                    <CheckCircle2 size={24} color={Colors.primary} />
                  )}
                </View>

                <Text style={styles.noteTitle}>{note.title}</Text>
                
                {note.parsedData && (
                  <View style={styles.parsedDataContainer}>
                    {note.parsedData.name && (
                      <Text style={styles.parsedDataText}>
                        Name: {note.parsedData.name}
                      </Text>
                    )}
                    {note.parsedData.phone && (
                      <Text style={styles.parsedDataText}>
                        Phone: {note.parsedData.phone}
                      </Text>
                    )}
                    {note.parsedData.email && (
                      <Text style={styles.parsedDataText}>
                        Email: {note.parsedData.email}
                      </Text>
                    )}
                    {note.parsedData.address && (
                      <Text style={styles.parsedDataText}>
                        Address: {note.parsedData.address}
                      </Text>
                    )}
                  </View>
                )}

                <Text style={styles.noteContent} numberOfLines={3}>
                  {note.content}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.bottomActions}>
              <TouchableOpacity
                style={styles.selectAllButton}
                onPress={() => {
                  if (selectedNotes.size === parsedNotes.length) {
                    setSelectedNotes(new Set());
                  } else {
                    setSelectedNotes(new Set(parsedNotes.map((_, i) => i)));
                  }
                }}
              >
                <Text style={styles.selectAllText}>
                  {selectedNotes.size === parsedNotes.length
                    ? 'Deselect All'
                    : 'Select All'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.importButton,
                  selectedNotes.size === 0 && styles.importButtonDisabled,
                ]}
                onPress={handleImport}
                disabled={selectedNotes.size === 0}
              >
                <CheckCircle2
                  size={20}
                  color={selectedNotes.size === 0 ? Colors.text.light : Colors.text.inverse}
                />
                <Text
                  style={[
                    styles.importButtonText,
                    selectedNotes.size === 0 && styles.importButtonTextDisabled,
                  ]}
                >
                  Import Selected ({selectedNotes.size})
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  instructionsCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  actionButtons: {
    paddingHorizontal: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  noteCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  noteCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noteTypeIcon: {
    fontSize: 20,
  },
  noteType: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  parsedDataContainer: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  parsedDataText: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  noteContent: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  selectAllButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  importButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  importButtonDisabled: {
    backgroundColor: Colors.border,
  },
  importButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
  },
  importButtonTextDisabled: {
    color: Colors.text.light,
  },
});
