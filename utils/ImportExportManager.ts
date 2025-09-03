import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform, Alert } from 'react-native';
import { Customer } from '@/types';

interface PriceBookItem {
  id: string;
  name: string;
  description: string;
  category: 'parts' | 'labor' | 'service';
  price: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

export class ImportExportManager {
  static async exportCustomers(customers: Customer[]): Promise<void> {
    try {
      const jsonData = JSON.stringify(customers, null, 2);
      const fileName = `customers_export_${new Date().toISOString().split('T')[0]}.json`;
      
      if (Platform.OS === 'web') {
        // Web export using download
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        Alert.alert('Success', 'Customers exported successfully!');
      } else {
        // Mobile export using file system and sharing
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, jsonData);
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/json',
            dialogTitle: 'Export Customers Data',
          });
        } else {
          Alert.alert('Success', `Customers exported to: ${fileUri}`);
        }
      }
    } catch (error) {
      console.error('Export customers error:', error);
      Alert.alert('Error', 'Failed to export customers data');
    }
  }

  static async importCustomers(): Promise<Customer[] | null> {
    try {
      if (Platform.OS === 'web') {
        // Web import using file input
        return new Promise((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json';
          input.onchange = async (event: any) => {
            const file = event.target.files[0];
            if (file) {
              const text = await file.text();
              try {
                const customers = JSON.parse(text);
                if (this.validateCustomersData(customers)) {
                  resolve(customers);
                } else {
                  Alert.alert('Error', 'Invalid customers data format');
                  resolve(null);
                }
              } catch (parseError) {
                Alert.alert('Error', 'Invalid JSON file');
                resolve(null);
              }
            } else {
              resolve(null);
            }
          };
          document.body.appendChild(input);
          input.click();
          document.body.removeChild(input);
        });
      } else {
        // Mobile import using document picker
        const result = await DocumentPicker.getDocumentAsync({
          type: 'application/json',
          copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets[0]) {
          const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
          const customers = JSON.parse(fileContent);
          
          if (this.validateCustomersData(customers)) {
            return customers;
          } else {
            Alert.alert('Error', 'Invalid customers data format');
            return null;
          }
        }
        return null;
      }
    } catch (error) {
      console.error('Import customers error:', error);
      Alert.alert('Error', 'Failed to import customers data');
      return null;
    }
  }

  static async exportPriceBook(items: PriceBookItem[]): Promise<void> {
    try {
      const jsonData = JSON.stringify(items, null, 2);
      const fileName = `price_book_export_${new Date().toISOString().split('T')[0]}.json`;
      
      if (Platform.OS === 'web') {
        // Web export using download
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        Alert.alert('Success', 'Price book exported successfully!');
      } else {
        // Mobile export using file system and sharing
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, jsonData);
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/json',
            dialogTitle: 'Export Price Book Data',
          });
        } else {
          Alert.alert('Success', `Price book exported to: ${fileUri}`);
        }
      }
    } catch (error) {
      console.error('Export price book error:', error);
      Alert.alert('Error', 'Failed to export price book data');
    }
  }

  static async importPriceBook(): Promise<PriceBookItem[] | null> {
    try {
      if (Platform.OS === 'web') {
        // Web import using file input
        return new Promise((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json';
          input.onchange = async (event: any) => {
            const file = event.target.files[0];
            if (file) {
              const text = await file.text();
              try {
                const items = JSON.parse(text);
                if (this.validatePriceBookData(items)) {
                  resolve(items);
                } else {
                  Alert.alert('Error', 'Invalid price book data format');
                  resolve(null);
                }
              } catch (parseError) {
                Alert.alert('Error', 'Invalid JSON file');
                resolve(null);
              }
            } else {
              resolve(null);
            }
          };
          document.body.appendChild(input);
          input.click();
          document.body.removeChild(input);
        });
      } else {
        // Mobile import using document picker
        const result = await DocumentPicker.getDocumentAsync({
          type: 'application/json',
          copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets[0]) {
          const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
          const items = JSON.parse(fileContent);
          
          if (this.validatePriceBookData(items)) {
            return items;
          } else {
            Alert.alert('Error', 'Invalid price book data format');
            return null;
          }
        }
        return null;
      }
    } catch (error) {
      console.error('Import price book error:', error);
      Alert.alert('Error', 'Failed to import price book data');
      return null;
    }
  }

  private static validateCustomersData(data: any): data is Customer[] {
    if (!Array.isArray(data)) return false;
    
    return data.every(customer => 
      typeof customer === 'object' &&
      typeof customer.id === 'string' &&
      typeof customer.name === 'string' &&
      typeof customer.email === 'string' &&
      typeof customer.phone === 'string' &&
      typeof customer.address === 'string'
    );
  }

  private static validatePriceBookData(data: any): data is PriceBookItem[] {
    if (!Array.isArray(data)) return false;
    
    return data.every(item => 
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.name === 'string' &&
      typeof item.description === 'string' &&
      ['parts', 'labor', 'service'].includes(item.category) &&
      typeof item.price === 'number' &&
      typeof item.unit === 'string'
    );
  }

  static showImportExportOptions(onImport: () => void, onExport: () => void): void {
    Alert.alert(
      'Import/Export Data',
      'Choose an option:',
      [
        {
          text: 'Import',
          onPress: onImport,
        },
        {
          text: 'Export',
          onPress: onExport,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  }
}