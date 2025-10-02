import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { 
  MessageCircle, 
  Send, 
  ArrowLeft,
  User,
  Search,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/app-store';
import { Conversation, Message } from '@/types';

export default function MessagingScreen() {
  const { participantId } = useLocalSearchParams<{ participantId?: string }>();
  const { 
    messages, 
    technicians, 
    sendMessage, 
    getConversationMessages,
    currentUserId,
    currentUserName,
    userRole,
  } = useAppStore();
  
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(
    participantId || null
  );
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const conversations = useMemo<Conversation[]>(() => {
    const conversationMap = new Map<string, Conversation>();
    
    messages.forEach((msg: Message) => {
      const otherParticipantId = msg.senderId === currentUserId ? msg.recipientId : msg.senderId;
      const otherParticipantName = msg.senderId === currentUserId ? msg.recipientName : msg.senderName;
      const otherParticipantRole = msg.senderId === currentUserId ? 
        (msg.recipientId.startsWith('tech') ? 'technician' : 'owner') : 
        msg.senderRole;
      
      const existing = conversationMap.get(otherParticipantId);
      
      if (!existing || new Date(msg.timestamp) > new Date(existing.lastMessageTime)) {
        const unreadCount = messages.filter((m: Message) => 
          m.senderId === otherParticipantId && 
          m.recipientId === currentUserId && 
          !m.read
        ).length;
        
        conversationMap.set(otherParticipantId, {
          id: otherParticipantId,
          participantId: otherParticipantId,
          participantName: otherParticipantName,
          participantRole: otherParticipantRole,
          lastMessage: msg.content,
          lastMessageTime: msg.timestamp,
          unreadCount,
        });
      }
    });
    
    return Array.from(conversationMap.values()).sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
  }, [messages, currentUserId]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;
    return conversations.filter(conv => 
      conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  const currentConversation = useMemo(() => {
    if (!selectedParticipant) return [];
    return getConversationMessages(selectedParticipant);
  }, [selectedParticipant, getConversationMessages]);

  const selectedParticipantInfo = useMemo(() => {
    if (!selectedParticipant) return null;
    const tech = technicians.find(t => t.id === selectedParticipant);
    if (tech) return { name: tech.name, role: 'technician' as const };
    const conv = conversations.find(c => c.participantId === selectedParticipant);
    if (conv) return { name: conv.participantName, role: conv.participantRole };
    return null;
  }, [selectedParticipant, technicians, conversations]);

  useEffect(() => {
    if (currentConversation.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [currentConversation]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedParticipant) return;
    
    const recipientName = selectedParticipantInfo?.name || 'Unknown';
    
    sendMessage({
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: userRole || 'owner',
      recipientId: selectedParticipant,
      recipientName,
      content: messageText.trim(),
    });
    
    setMessageText('');
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  if (selectedParticipant && selectedParticipantInfo) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={styles.chatHeader}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setSelectedParticipant(null)}
            >
              <ArrowLeft size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <View style={styles.chatHeaderInfo}>
              <View style={styles.chatAvatar}>
                <User size={20} color={Colors.text.inverse} />
              </View>
              <View>
                <Text style={styles.chatHeaderName}>{selectedParticipantInfo.name}</Text>
                <Text style={styles.chatHeaderRole}>
                  {selectedParticipantInfo.role === 'technician' ? 'Technician' : 'Owner'}
                </Text>
              </View>
            </View>
          </View>

          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
          >
            {currentConversation.map((msg: Message) => {
              const isOwn = msg.senderId === currentUserId;
              return (
                <View 
                  key={msg.id} 
                  style={[
                    styles.messageBubble,
                    isOwn ? styles.ownMessage : styles.otherMessage
                  ]}
                >
                  <Text style={[
                    styles.messageText,
                    isOwn ? styles.ownMessageText : styles.otherMessageText
                  ]}>
                    {msg.content}
                  </Text>
                  <Text style={[
                    styles.messageTime,
                    isOwn ? styles.ownMessageTime : styles.otherMessageTime
                  ]}>
                    {formatMessageTime(msg.timestamp)}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={Colors.text.light}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Send size={20} color={Colors.text.inverse} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.text.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor={Colors.text.light}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {filteredConversations.length === 0 ? (
        <View style={styles.emptyState}>
          <MessageCircle size={64} color={Colors.text.light} />
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptyText}>
            {searchQuery 
              ? 'No conversations match your search'
              : 'Start messaging your team members'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.conversationItem}
              onPress={() => setSelectedParticipant(item.participantId)}
            >
              <View style={styles.conversationAvatar}>
                <User size={24} color={Colors.text.inverse} />
              </View>
              <View style={styles.conversationContent}>
                <View style={styles.conversationHeader}>
                  <Text style={styles.conversationName}>{item.participantName}</Text>
                  <Text style={styles.conversationTime}>
                    {formatTime(item.lastMessageTime)}
                  </Text>
                </View>
                <View style={styles.conversationFooter}>
                  <Text 
                    style={styles.conversationMessage}
                    numberOfLines={1}
                  >
                    {item.lastMessage}
                  </Text>
                  {item.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{item.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {technicians.length > 0 && !selectedParticipant && (
        <View style={styles.quickAccessContainer}>
          <Text style={styles.quickAccessTitle}>Quick Access</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {technicians.map((tech) => (
              <TouchableOpacity
                key={tech.id}
                style={styles.quickAccessItem}
                onPress={() => setSelectedParticipant(tech.id)}
              >
                <View style={styles.quickAccessAvatar}>
                  <User size={20} color={Colors.text.inverse} />
                </View>
                <Text style={styles.quickAccessName} numberOfLines={1}>
                  {tech.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
    marginTop: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  conversationAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  conversationTime: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationMessage: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
  },
  quickAccessContainer: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  quickAccessTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  quickAccessItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 64,
  },
  quickAccessAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickAccessName: {
    fontSize: 12,
    color: Colors.text.primary,
    textAlign: 'center' as const,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginRight: 12,
  },
  chatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  chatHeaderRole: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  ownMessageText: {
    color: Colors.text.inverse,
  },
  otherMessageText: {
    color: Colors.text.primary,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  ownMessageTime: {
    color: Colors.text.inverse,
    opacity: 0.7,
  },
  otherMessageTime: {
    color: Colors.text.secondary,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text.primary,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
