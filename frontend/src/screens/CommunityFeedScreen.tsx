import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

interface Post {
  _id: string;
  userId: {
    _id: string;
    displayName: string;
    profilePicture?: string;
  };
  activity: {
    name: string;
    location: string;
  };
  caption: string;
  originalLanguage: string;
  translatedCaption?: string;
  photoUrl?: string;
  likes: string[];
  comments: Array<{
    userId: { displayName: string };
    text: string;
    createdAt: string;
  }>;
  createdAt: string;
}

export default function CommunityFeedScreen() {
  const navigation = useNavigation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    loadFeed();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const response = await api.get('/users/me');
      setCurrentUserId(response.data.data.user.id);
    } catch (error) {
      console.error('Failed to get current user:', error);
    }
  };

  const loadFeed = async (pageNum: number = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      }

      const response = await api.get(`/community/feed`, {
        params: { page: pageNum, limit: 10 },
      });

      const newPosts = response.data.data.posts || [];

      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }

      setHasMore(newPosts.length === 10);
      setPage(pageNum);
    } catch (error: any) {
      console.error('Failed to load feed:', error);
      Alert.alert('Error', 'Failed to load community feed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFeed(1);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadFeed(page + 1);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const post = posts.find((p) => p._id === postId);
      if (!post) return;

      const isLiked = post.likes.includes(currentUserId);

      // Optimistic update
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id === postId) {
            return {
              ...p,
              likes: isLiked
                ? p.likes.filter((id) => id !== currentUserId)
                : [...p.likes, currentUserId],
            };
          }
          return p;
        })
      );

      // API call
      await api.post(`/community/posts/${postId}/like`);
    } catch (error) {
      console.error('Failed to like post:', error);
      // Revert on error
      loadFeed(1);
    }
  };

  const handleComment = (postId: string) => {
    // TODO: Navigate to comments screen or show modal
    Alert.alert('Comments', 'Comment functionality coming soon!');
  };

  const handleShare = (post: Post) => {
    // TODO: Implement share functionality
    Alert.alert('Share', 'Share functionality coming soon!');
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const renderPost = ({ item: post }: { item: Post }) => {
    const isLiked = post.likes.includes(currentUserId);

    return (
      <View style={styles.postCard}>
        {/* Header */}
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            {post.userId.profilePicture ? (
              <Image
                source={{ uri: post.userId.profilePicture }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={24} color="#999" />
              </View>
            )}
            <View>
              <Text style={styles.userName}>{post.userId.displayName}</Text>
              <Text style={styles.postTime}>{formatTimestamp(post.createdAt)}</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Activity Badge */}
        <View style={styles.activityBadge}>
          <Ionicons name="location" size={16} color="#007AFF" />
          <Text style={styles.activityText}>
            {post.activity.name} • {post.activity.location}
          </Text>
        </View>

        {/* Photo */}
        {post.photoUrl && (
          <Image source={{ uri: post.photoUrl }} style={styles.postImage} />
        )}

        {/* Caption */}
        <View style={styles.captionContainer}>
          <Text style={styles.caption}>
            {post.translatedCaption || post.caption}
          </Text>
          {post.translatedCaption && (
            <Text style={styles.translationNotice}>
              <Ionicons name="language" size={12} /> Translated from{' '}
              {post.originalLanguage}
            </Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(post._id)}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={isLiked ? '#FF3B30' : '#666'}
            />
            <Text style={[styles.actionText, isLiked && styles.likedText]}>
              {post.likes.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleComment(post._id)}
          >
            <Ionicons name="chatbubble-outline" size={24} color="#666" />
            <Text style={styles.actionText}>{post.comments.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShare(post)}
          >
            <Ionicons name="share-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Top Comments */}
        {post.comments.length > 0 && (
          <View style={styles.commentsPreview}>
            {post.comments.slice(0, 2).map((comment, index) => (
              <Text key={index} style={styles.commentText}>
                <Text style={styles.commentUser}>
                  {comment.userId.displayName}
                </Text>{' '}
                {comment.text}
              </Text>
            ))}
            {post.comments.length > 2 && (
              <TouchableOpacity onPress={() => handleComment(post._id)}>
                <Text style={styles.viewAllComments}>
                  View all {post.comments.length} comments
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={64} color="#CCC" />
        <Text style={styles.emptyTitle}>No Posts Yet</Text>
        <Text style={styles.emptyText}>
          Be the first to share your adventure with the community!
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreatePost' as never)}
        >
          <Ionicons name="add-circle" size={20} color="#FFF" />
          <Text style={styles.createButtonText}>Create Post</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading || page === 1) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  if (loading && page === 1) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading community feed...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreatePost' as never)}
        >
          <Ionicons name="add-circle-outline" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.feedContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  feedContainer: {
    paddingBottom: 16,
  },
  postCard: {
    backgroundColor: '#FFF',
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  postTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  activityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F0F7FF',
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  activityText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  postImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#F0F0F0',
  },
  captionContainer: {
    padding: 12,
  },
  caption: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  translationNotice: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  likedText: {
    color: '#FF3B30',
  },
  commentsPreview: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
    marginBottom: 4,
  },
  commentUser: {
    fontWeight: '600',
  },
  viewAllComments: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
    alignItems: 'center',
    gap: 8,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
