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
      console.log('Exporting customers:', customers.length);
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
        
        Alert.alert('Success', `${customers.length} customers exported successfully!`);
      } else {
        // Mobile export using file system and sharing
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, jsonData);
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/json',
            dialogTitle: 'Export Customers Data',
          });
          Alert.alert('Success', `${customers.length} customers exported successfully!`);
        } else {
          Alert.alert('Success', `${customers.length} customers exported to: ${fileUri}`);
        }
      }
    } catch (error) {
      console.error('Export customers error:', error);
      Alert.alert('Error', 'Failed to export customers data. Please try again.');
    }
  }

  static async importCustomers(): Promise<Customer[] | null> {
    try {
      console.log('Starting customer import...');
      
      if (Platform.OS === 'web') {
        // Web import using file input
        return new Promise((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json';
          input.onchange = async (event: any) => {
            const file = event.target.files[0];
            if (file) {
              console.log('File selected:', file.name);
              const text = await file.text();
              try {
                const customers = JSON.parse(text);
                console.log('Parsed customers:', customers.length);
                if (this.validateCustomersData(customers)) {
                  resolve(customers);
                } else {
                  Alert.alert('Error', 'Invalid customers data format. Please check your file.');
                  resolve(null);
                }
              } catch (parseError) {
                console.error('JSON parse error:', parseError);
                Alert.alert('Error', 'Invalid JSON file. Please select a valid customers export file.');
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
          console.log('File selected:', result.assets[0].name);
          const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
          const customers = JSON.parse(fileContent);
          console.log('Parsed customers:', customers.length);
          
          if (this.validateCustomersData(customers)) {
            return customers;
          } else {
            Alert.alert('Error', 'Invalid customers data format. Please check your file.');
            return null;
          }
        }
        return null;
      }
    } catch (error) {
      console.error('Import customers error:', error);
      Alert.alert('Error', 'Failed to import customers data. Please try again.');
      return null;
    }
  }

  static async exportPriceBook(items: PriceBookItem[]): Promise<void> {
    try {
      console.log('Exporting price book items:', items.length);
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
        
        Alert.alert('Success', `${items.length} price book items exported successfully!`);
      } else {
        // Mobile export using file system and sharing
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, jsonData);
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/json',
            dialogTitle: 'Export Price Book Data',
          });
          Alert.alert('Success', `${items.length} price book items exported successfully!`);
        } else {
          Alert.alert('Success', `${items.length} price book items exported to: ${fileUri}`);
        }
      }
    } catch (error) {
      console.error('Export price book error:', error);
      Alert.alert('Error', 'Failed to export price book data. Please try again.');
    }
  }

  static async importPriceBook(): Promise<PriceBookItem[] | null> {
    try {
      console.log('Starting price book import...');
      
      if (Platform.OS === 'web') {
        // Web import using file input
        return new Promise((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json';
          input.onchange = async (event: any) => {
            const file = event.target.files[0];
            if (file) {
              console.log('File selected:', file.name);
              const text = await file.text();
              try {
                const items = JSON.parse(text);
                console.log('Parsed price book items:', items.length);
                if (this.validatePriceBookData(items)) {
                  resolve(items);
                } else {
                  Alert.alert('Error', 'Invalid price book data format. Please check your file.');
                  resolve(null);
                }
              } catch (parseError) {
                console.error('JSON parse error:', parseError);
                Alert.alert('Error', 'Invalid JSON file. Please select a valid price book export file.');
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
          console.log('File selected:', result.assets[0].name);
          const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
          const items = JSON.parse(fileContent);
          console.log('Parsed price book items:', items.length);
          
          if (this.validatePriceBookData(items)) {
            return items;
          } else {
            Alert.alert('Error', 'Invalid price book data format. Please check your file.');
            return null;
          }
        }
        return null;
      }
    } catch (error) {
      console.error('Import price book error:', error);
      Alert.alert('Error', 'Failed to import price book data. Please try again.');
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