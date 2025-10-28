import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  Wrench,
  Calendar,
  CheckCircle,
  PlayCircle,
  XCircle,

  Camera,
  PenTool,
  Image as ImageIcon,
  MessageSquare,
  Trash2
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/app-store';
import { Job } from '@/types';
import CameraCapture from '@/components/CameraCapture';
import SignatureCapture from '@/components/SignatureCapture';
import OfflineStorageManager from '@/utils/OfflineStorageManager';

export default function JobDetailsScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const { 
    jobs, 
    updateJobStatus, 
    getCustomerById, 
    addJobComment, 
    getJobComments, 
    deleteJobComment,
    currentUserId,
    currentUserName,
    userRole,
  } = useAppStore();
  const [showCamera, setShowCamera] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [jobPhoto, setJobPhoto] = useState<string | null>(null);
  const [jobSignature, setJobSignature] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const offlineStorage = OfflineStorageManager.getInstance();
  
  const jobComments = getJobComments(jobId || '');
  
  const job = jobs.find(j => j.id === jobId);
  const customer = job ? getCustomerById(job.customerId) : undefined;

  useEffect(() => {
    const loadAssets = async () => {
      if (!job) return;
      
      try {
        const photo = await offlineStorage.getJobPhoto(job.id);
        const signature = await offlineStorage.getJobSignature(job.id);
        
        setJobPhoto(photo);
        setJobSignature(signature);
      } catch (error) {
        console.error('Error loading job assets:', error);
      }
    };

    if (job) {
      loadAssets();
    }
  }, [job, offlineStorage]);



  const handleAddComment = () => {
    if (!commentText.trim() || !jobId) return;
    
    addJobComment({
      jobId,
      authorId: currentUserId,
      authorName: currentUserName,
      authorRole: userRole || 'owner',
      content: commentText.trim(),
    });
    
    setCommentText('');
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteJobComment(commentId)
        }
      ]
    );
  };

  if (!job) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Job Details' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Job not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleStatusChange = (newStatus: Job['status']) => {
    if (newStatus === 'completed' && (!jobPhoto || !jobSignature)) {
      Alert.alert(
        'Missing Requirements',
        'Please capture a photo and customer signature before completing the job.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Update Status',
      `Change job status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update', 
          onPress: async () => {
            try {
              await updateJobStatus(job.id, newStatus);
              if (newStatus === 'completed') {
                router.back();
              }
            } catch (error) {
              console.error('Error updating job status:', error);
              Alert.alert('Error', 'Failed to update job status. Changes saved offline.');
            }
          }
        }
      ]
    );
  };

  const handleCameraCapture = async (photoUri: string) => {
    try {
      await offlineStorage.saveJobPhoto(job.id, photoUri);
      setJobPhoto(photoUri);
      setShowCamera(false);
      Alert.alert('Success', 'Photo saved successfully!');
    } catch (error) {
      console.error('Error saving photo:', error);
      Alert.alert('Error', 'Failed to save photo. Please try again.');
    }
  };

  const handleSignatureCapture = async (signatureSvg: string) => {
    try {
      await offlineStorage.saveJobSignature(job.id, signatureSvg);
      setJobSignature(signatureSvg);
      setShowSignature(false);
      Alert.alert('Success', 'Signature saved successfully!');
    } catch (error) {
      console.error('Error saving signature:', error);
      Alert.alert('Error', 'Failed to save signature. Please try again.');
    }
  };

  const getStatusColor = (status: Job['status']) => {
    const statusKey = status === 'inProgress' ? 'inProgress' : status;
    return Colors.status[statusKey as keyof typeof Colors.status] || Colors.text.secondary;
  };

  const getPriorityColor = (priority: Job['priority']) => {
    switch (priority) {
      case 'emergency':
        return Colors.status.emergency;
      case 'high':
        return Colors.accent;
      case 'normal':
        return Colors.primary;
      default:
        return Colors.text.secondary;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Job Details' }} />
      <ScrollView style={styles.scrollView}>
        {/* Job Header */}
        <View style={styles.header}>
          <View style={styles.statusBadge}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(job.status) }]} />
            <Text style={styles.statusText}>{job.status.replace('-', ' ').toUpperCase()}</Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(job.priority) }]}>
            <Text style={styles.priorityText}>{job.priority.toUpperCase()}</Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <View style={styles.card}>
            <View style={styles.customerHeader}>
              <View style={styles.avatarContainer}>
                <User size={24} color={Colors.text.inverse} />
              </View>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{job.customerName}</Text>
                {customer && (
                  <>
                    <TouchableOpacity style={styles.contactRow}>
                      <Phone size={14} color={Colors.primary} />
                      <Text style={styles.contactText}>{customer.phone}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.contactRow}>
                      <Mail size={14} color={Colors.primary} />
                      <Text style={styles.contactText}>{customer.email}</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Job Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Details</Text>
          <View style={styles.card}>
            <View style={styles.detailRow}>
              <Calendar size={16} color={Colors.text.secondary} />
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>
                {new Date(job.scheduledDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Clock size={16} color={Colors.text.secondary} />
              <Text style={styles.detailLabel}>Time:</Text>
              <Text style={styles.detailValue}>{job.scheduledTime}</Text>
            </View>
            <View style={styles.detailRow}>
              <Wrench size={16} color={Colors.text.secondary} />
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailValue}>{job.type.charAt(0).toUpperCase() + job.type.slice(1)}</Text>
            </View>
            <View style={styles.detailRow}>
              <MapPin size={16} color={Colors.text.secondary} />
              <Text style={styles.detailLabel}>Location:</Text>
              <Text style={styles.detailValue}>{job.address}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <View style={styles.card}>
            <Text style={styles.description}>{job.description}</Text>
            {job.notes && (
              <>
                <View style={styles.divider} />
                <Text style={styles.notesLabel}>Notes:</Text>
                <Text style={styles.notes}>{job.notes}</Text>
              </>
            )}
          </View>
        </View>

        {/* Technician */}
        {job.technicianName && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Assigned Technician</Text>
            <View style={styles.card}>
              <View style={styles.technicianRow}>
                <View style={styles.techAvatar}>
                  <User size={20} color={Colors.text.inverse} />
                </View>
                <Text style={styles.technicianName}>{job.technicianName}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Photo and Signature Section */}
        {job.status === 'inProgress' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Documentation</Text>
            <View style={styles.card}>
              <View style={styles.documentationRow}>
                <TouchableOpacity
                  style={[styles.docButton, jobPhoto && styles.docButtonCompleted]}
                  onPress={() => setShowCamera(true)}
                >
                  {jobPhoto ? (
                    <ImageIcon size={20} color={Colors.status.completed} />
                  ) : (
                    <Camera size={20} color={Colors.text.secondary} />
                  )}
                  <Text style={[styles.docButtonText, jobPhoto && styles.docButtonTextCompleted]}>
                    {jobPhoto ? 'Photo Captured' : 'Take Photo'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.docButton, jobSignature && styles.docButtonCompleted]}
                  onPress={() => setShowSignature(true)}
                >
                  {jobSignature ? (
                    <CheckCircle size={20} color={Colors.status.completed} />
                  ) : (
                    <PenTool size={20} color={Colors.text.secondary} />
                  )}
                  <Text style={[styles.docButtonText, jobSignature && styles.docButtonTextCompleted]}>
                    {jobSignature ? 'Signature Captured' : 'Get Signature'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {jobPhoto && (
                <View style={styles.photoPreview}>
                  <Text style={styles.previewLabel}>Captured Photo:</Text>
                  <Image source={{ uri: jobPhoto }} style={styles.photoThumbnail} />
                </View>
              )}
              
              {jobSignature && (
                <View style={styles.signaturePreview}>
                  <Text style={styles.previewLabel}>Customer Signature: ✓</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Job Comments Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Notes & Comments</Text>
          <View style={styles.card}>
            {jobComments.length === 0 ? (
              <View style={styles.noComments}>
                <MessageSquare size={32} color={Colors.text.light} />
                <Text style={styles.noCommentsText}>No comments yet</Text>
              </View>
            ) : (
              <View style={styles.commentsContainer}>
                {jobComments.map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <View style={styles.commentHeader}>
                      <View style={styles.commentAuthorInfo}>
                        <View style={styles.commentAvatar}>
                          <User size={14} color={Colors.text.inverse} />
                        </View>
                        <View>
                          <Text style={styles.commentAuthor}>{comment.authorName}</Text>
                          <Text style={styles.commentTime}>
                            {new Date(comment.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </Text>
                        </View>
                      </View>
                      {comment.authorId === currentUserId && (
                        <TouchableOpacity
                          onPress={() => handleDeleteComment(comment.id)}
                          style={styles.deleteCommentButton}
                        >
                          <Trash2 size={16} color={Colors.status.cancelled} />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={styles.commentContent}>{comment.content}</Text>
                  </View>
                ))}
              </View>
            )}
            
            <View style={styles.addCommentContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a note or comment..."
                placeholderTextColor={Colors.text.light}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.addCommentButton, !commentText.trim() && styles.addCommentButtonDisabled]}
                onPress={handleAddComment}
                disabled={!commentText.trim()}
              >
                <Text style={styles.addCommentButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {job.status !== 'completed' && job.status !== 'cancelled' && (
          <View style={styles.actionButtons}>
            {job.status === 'scheduled' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.startButton]}
                onPress={() => handleStatusChange('inProgress')}
              >
                <PlayCircle size={20} color={Colors.text.inverse} />
                <Text style={styles.actionButtonText}>Start Job</Text>
              </TouchableOpacity>
            )}
            {job.status === 'inProgress' && (
              <TouchableOpacity
                style={[
                  styles.actionButton, 
                  styles.completeButton,
                  (!jobPhoto || !jobSignature) && styles.disabledButton
                ]}
                onPress={() => handleStatusChange('completed')}
                disabled={!jobPhoto || !jobSignature}
              >
                <CheckCircle size={20} color={Colors.text.inverse} />
                <Text style={styles.actionButtonText}>Complete Job</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleStatusChange('cancelled')}
            >
              <XCircle size={20} color={Colors.text.inverse} />
              <Text style={styles.actionButtonText}>Cancel Job</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      {/* Camera Modal */}
      <Modal
        visible={showCamera}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <CameraCapture
          onCapture={handleCameraCapture}
          onCancel={() => setShowCamera(false)}
        />
      </Modal>
      
      {/* Signature Modal */}
      <Modal
        visible={showSignature}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SignatureCapture
          onCapture={handleSignatureCapture}
          onCancel={() => setShowSignature(false)}
        />
      </Modal>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    textTransform: 'uppercase' as const,
    marginBottom: 8,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  contactText: {
    fontSize: 14,
    color: Colors.primary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 8,
    marginRight: 8,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
  },
  description: {
    fontSize: 15,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    marginBottom: 6,
  },
  notes: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontStyle: 'italic' as const,
    lineHeight: 20,
  },
  technicianRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  techAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  technicianName: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  actionButtons: {
    padding: 16,
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
  },
  startButton: {
    backgroundColor: Colors.status.inProgress,
  },
  completeButton: {
    backgroundColor: Colors.status.completed,
  },
  cancelButton: {
    backgroundColor: Colors.status.cancelled,
  },
  disabledButton: {
    backgroundColor: Colors.text.light,
    opacity: 0.6,
  },
  documentationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  docButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  docButtonCompleted: {
    borderColor: Colors.status.completed,
    backgroundColor: Colors.status.completed + '10',
  },
  docButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  docButtonTextCompleted: {
    color: Colors.status.completed,
  },
  photoPreview: {
    marginTop: 16,
    alignItems: 'center',
  },
  signaturePreview: {
    marginTop: 16,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  photoThumbnail: {
    width: 120,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover' as const,
  },
  commentsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  commentItem: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  commentAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  commentTime: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  commentContent: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  deleteCommentButton: {
    padding: 4,
  },
  noComments: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noCommentsText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 8,
  },
  addCommentContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  commentInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.text.primary,
    maxHeight: 80,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addCommentButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addCommentButtonDisabled: {
    opacity: 0.5,
  },
  addCommentButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
  },
});