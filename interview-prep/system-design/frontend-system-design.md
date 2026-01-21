# Frontend System Design Interview Questions

## Table of Contents
1. [Design a Real-Time Chat Application](#design-a-real-time-chat-application)
2. [Design a News Feed (Facebook/Twitter)](#design-a-news-feed-facebooktwitter)
3. [Design a Video Streaming Platform (YouTube/Netflix)](#design-a-video-streaming-platform-youtubenetflix)
4. [Design an Image Gallery (Pinterest/Instagram)](#design-an-image-gallery-pinterestinstagram)
5. [Design a Collaborative Document Editor (Google Docs)](#design-a-collaborative-document-editor-google-docs)
6. [Design an E-Commerce Product Page](#design-an-e-commerce-product-page)
7. [Design a Typeahead/Autocomplete System](#design-a-typeaheadautocomplete-system)
8. [Design a Notification System](#design-a-notification-system)
9. [Design a Data Visualization Dashboard](#design-a-data-visualization-dashboard)
10. [Design a Component Library](#design-a-component-library)

---

## Design a Real-Time Chat Application

### Requirements
**Functional**:
- Send/receive messages in real-time
- Support 1-on-1 and group chats
- Show online/offline status
- Display typing indicators
- Message delivery status (sent, delivered, read)
- Support attachments (images, files)
- Message history pagination

**Non-Functional**:
- Low latency (< 100ms)
- Handle 1M+ concurrent users
- 99.9% uptime
- Offline support
- Cross-platform (web, mobile)

### High-Level Architecture

```javascript
/**
 * Frontend Architecture Components
 */

// 1. State Management
const chatStore = {
  conversations: Map<conversationId, Conversation>,
  messages: Map<messageId, Message>,
  users: Map<userId, User>,
  activeConversation: conversationId,
  connectionStatus: 'connected' | 'reconnecting' | 'disconnected'
};

// 2. WebSocket Manager
class WebSocketManager {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.heartbeatInterval = null;
    this.messageQueue = [];
  }
  
  connect(userId, token) {
    this.ws = new WebSocket(`wss://chat.api.com?userId=${userId}&token=${token}`);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.flushMessageQueue();
    };
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.stopHeartbeat();
      this.reconnect();
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }
  
  send(message) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue messages when offline
      this.messageQueue.push(message);
    }
  }
  
  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }
    
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    
    setTimeout(() => {
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      this.connect();
    }, delay);
  }
  
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: 'ping' });
    }, 30000);
  }
  
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }
  
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }
  
  handleMessage(message) {
    switch (message.type) {
      case 'message':
        store.dispatch(addMessage(message));
        break;
      case 'typing':
        store.dispatch(setTyping(message));
        break;
      case 'presence':
        store.dispatch(updateUserStatus(message));
        break;
      case 'read':
        store.dispatch(markAsRead(message));
        break;
    }
  }
}

// 3. Message Optimistic Updates
class MessageManager {
  async sendMessage(conversationId, content, attachments = []) {
    const tempId = `temp_${Date.now()}`;
    
    // Optimistic update
    const optimisticMessage = {
      id: tempId,
      conversationId,
      content,
      attachments,
      senderId: currentUser.id,
      timestamp: Date.now(),
      status: 'sending'
    };
    
    store.dispatch(addMessage(optimisticMessage));
    
    try {
      // Upload attachments first
      const uploadedAttachments = await this.uploadAttachments(attachments);
      
      // Send message via WebSocket
      wsManager.send({
        type: 'message',
        tempId,
        conversationId,
        content,
        attachments: uploadedAttachments
      });
      
      // Update status to sent
      store.dispatch(updateMessageStatus(tempId, 'sent'));
      
    } catch (error) {
      // Rollback on failure
      store.dispatch(updateMessageStatus(tempId, 'failed'));
    }
  }
  
  async uploadAttachments(files) {
    const uploads = files.map(file => this.uploadFile(file));
    return Promise.all(uploads);
  }
  
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    return response.json();
  }
}

// 4. Virtual Scrolling for Message List
class VirtualMessageList {
  constructor(container, itemHeight = 80) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.visibleItems = [];
    this.allMessages = [];
    this.scrollTop = 0;
    
    this.setupScrollListener();
  }
  
  setMessages(messages) {
    this.allMessages = messages;
    this.render();
  }
  
  setupScrollListener() {
    this.container.addEventListener('scroll', () => {
      this.scrollTop = this.container.scrollTop;
      this.render();
      
      // Load more when near top
      if (this.scrollTop < 500) {
        this.loadMoreMessages();
      }
    });
  }
  
  render() {
    const containerHeight = this.container.clientHeight;
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.ceil((this.scrollTop + containerHeight) / this.itemHeight);
    
    this.visibleItems = this.allMessages.slice(
      Math.max(0, startIndex - 5), // Buffer
      Math.min(this.allMessages.length, endIndex + 5)
    );
    
    this.updateDOM();
  }
  
  async loadMoreMessages() {
    if (this.loading) return;
    
    this.loading = true;
    const oldestMessage = this.allMessages[0];
    
    const olderMessages = await fetchMessages({
      conversationId: this.conversationId,
      before: oldestMessage.timestamp,
      limit: 50
    });
    
    this.allMessages = [...olderMessages, ...this.allMessages];
    this.loading = false;
  }
}

// 5. Typing Indicator
class TypingIndicator {
  constructor(conversationId) {
    this.conversationId = conversationId;
    this.typingTimeout = null;
    this.isTyping = false;
  }
  
  onType() {
    if (!this.isTyping) {
      this.isTyping = true;
      wsManager.send({
        type: 'typing',
        conversationId: this.conversationId,
        isTyping: true
      });
    }
    
    // Clear previous timeout
    clearTimeout(this.typingTimeout);
    
    // Stop typing after 3 seconds of inactivity
    this.typingTimeout = setTimeout(() => {
      this.isTyping = false;
      wsManager.send({
        type: 'typing',
        conversationId: this.conversationId,
        isTyping: false
      });
    }, 3000);
  }
}

// 6. IndexedDB for Offline Storage
class ChatDatabase {
  constructor() {
    this.db = null;
  }
  
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ChatDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Messages store
        if (!db.objectStoreNames.contains('messages')) {
          const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
          messageStore.createIndex('conversationId', 'conversationId', { unique: false });
          messageStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Conversations store
        if (!db.objectStoreNames.contains('conversations')) {
          db.createObjectStore('conversations', { keyPath: 'id' });
        }
      };
    });
  }
  
  async saveMessage(message) {
    const transaction = this.db.transaction(['messages'], 'readwrite');
    const store = transaction.objectStore('messages');
    await store.put(message);
  }
  
  async getMessages(conversationId, limit = 50) {
    const transaction = this.db.transaction(['messages'], 'readonly');
    const store = transaction.objectStore('messages');
    const index = store.index('conversationId');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(conversationId, limit);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// 7. Service Worker for Background Sync
// service-worker.js
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncPendingMessages());
  }
});

async function syncPendingMessages() {
  const db = await openDB();
  const pendingMessages = await db.getAll('pending-messages');
  
  for (const message of pendingMessages) {
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
      
      await db.delete('pending-messages', message.id);
    } catch (error) {
      console.error('Failed to sync message:', error);
    }
  }
}
```

### Key Considerations

**1. Data Flow**:
```
User Input → Optimistic Update → Local DB → WebSocket → Backend
                     ↓                                      ↓
                 UI Update                            Server Processing
                     ↑                                      ↓
              Update Status ← WebSocket Confirmation ← Database
```

**2. Performance Optimizations**:
- Virtual scrolling for message lists
- Image lazy loading and progressive loading
- Debounced typing indicators
- Message batching for bulk operations
- IndexedDB for offline storage
- Service Worker for background sync

**3. Scalability**:
- WebSocket connection pooling
- Message pagination
- Conversation list virtualization
- Attachment CDN delivery
- Browser push notifications

**4. Trade-offs**:
- WebSocket vs Long Polling: WebSocket for low latency, fallback to long polling
- Optimistic Updates: Better UX but need rollback strategy
- IndexedDB vs LocalStorage: IndexedDB for larger data, structured queries
- Client-side vs Server-side rendering: CSR for real-time, SSR for SEO

---

## Design a News Feed (Facebook/Twitter)

### Requirements
**Functional**:
- Display personalized feed
- Infinite scroll
- Post creation (text, images, videos)
- Like, comment, share
- Real-time updates
- Filtering and sorting

**Non-Functional**:
- Fast initial load (< 2s)
- Smooth scrolling (60fps)
- Handle 10K+ posts
- Support offline mode
- Minimize data usage

### Architecture

```javascript
/**
 * Feed Architecture
 */

// 1. Feed State Management
class FeedStore {
  constructor() {
    this.posts = new Map();
    this.feedOrder = [];
    this.cursor = null;
    this.loading = false;
    this.hasMore = true;
    this.filters = {
      type: 'all', // all, friends, pages
      sort: 'recent' // recent, trending, relevant
    };
  }
  
  addPosts(posts) {
    posts.forEach(post => {
      this.posts.set(post.id, post);
      if (!this.feedOrder.includes(post.id)) {
        this.feedOrder.push(post.id);
      }
    });
  }
  
  updatePost(postId, updates) {
    const post = this.posts.get(postId);
    if (post) {
      this.posts.set(postId, { ...post, ...updates });
    }
  }
  
  removePost(postId) {
    this.posts.delete(postId);
    this.feedOrder = this.feedOrder.filter(id => id !== postId);
  }
}

// 2. Infinite Scroll Manager
class InfiniteScrollManager {
  constructor(options = {}) {
    this.threshold = options.threshold || 1000;
    this.loading = false;
    this.hasMore = true;
    this.onLoadMore = options.onLoadMore;
    
    this.setupIntersectionObserver();
  }
  
  setupIntersectionObserver() {
    const sentinel = document.querySelector('.scroll-sentinel');
    
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.loading && this.hasMore) {
            this.loadMore();
          }
        });
      },
      { rootMargin: `${this.threshold}px` }
    );
    
    if (sentinel) {
      this.observer.observe(sentinel);
    }
  }
  
  async loadMore() {
    this.loading = true;
    
    try {
      const result = await this.onLoadMore();
      this.hasMore = result.hasMore;
    } catch (error) {
      console.error('Failed to load more:', error);
    } finally {
      this.loading = false;
    }
  }
  
  reset() {
    this.hasMore = true;
    this.loading = false;
  }
}

// 3. Post Renderer with Virtualization
class FeedRenderer {
  constructor(container) {
    this.container = container;
    this.visiblePosts = new Set();
    this.postHeights = new Map();
    this.setupObserver();
  }
  
  setupObserver() {
    // Use Intersection Observer for visibility tracking
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const postId = entry.target.dataset.postId;
          
          if (entry.isIntersecting) {
            this.visiblePosts.add(postId);
            this.trackImpression(postId);
          } else {
            this.visiblePosts.delete(postId);
          }
        });
      },
      { threshold: 0.5 }
    );
  }
  
  renderPost(post) {
    const postElement = document.createElement('div');
    postElement.className = 'feed-post';
    postElement.dataset.postId = post.id;
    
    postElement.innerHTML = `
      <div class="post-header">
        <img src="${post.author.avatar}" alt="${post.author.name}" loading="lazy">
        <div class="post-info">
          <h3>${post.author.name}</h3>
          <span>${this.formatTime(post.timestamp)}</span>
        </div>
      </div>
      
      <div class="post-content">
        ${this.renderContent(post)}
      </div>
      
      <div class="post-actions">
        <button class="like-btn" data-post-id="${post.id}">
          ${post.isLiked ? '❤️' : '🤍'} ${post.likesCount}
        </button>
        <button class="comment-btn" data-post-id="${post.id}">
          💬 ${post.commentsCount}
        </button>
        <button class="share-btn" data-post-id="${post.id}">
          🔗 Share
        </button>
      </div>
      
      <div class="post-comments" id="comments-${post.id}"></div>
    `;
    
    this.observer.observe(postElement);
    return postElement;
  }
  
  renderContent(post) {
    switch (post.type) {
      case 'text':
        return `<p>${this.escapeHTML(post.content)}</p>`;
      
      case 'image':
        return `
          <p>${this.escapeHTML(post.content)}</p>
          <img 
            src="${post.media.thumbnail}" 
            data-full="${post.media.url}"
            loading="lazy"
            onclick="openLightbox('${post.media.url}')"
          >
        `;
      
      case 'video':
        return `
          <p>${this.escapeHTML(post.content)}</p>
          <video 
            src="${post.media.url}"
            poster="${post.media.thumbnail}"
            controls
            preload="metadata"
          ></video>
        `;
      
      default:
        return '';
    }
  }
  
  trackImpression(postId) {
    // Send analytics event
    analytics.track('post_impression', {
      postId,
      timestamp: Date.now()
    });
  }
}

// 4. Optimistic Updates for Interactions
class PostInteractionManager {
  async likePost(postId) {
    const post = feedStore.posts.get(postId);
    
    // Optimistic update
    feedStore.updatePost(postId, {
      isLiked: !post.isLiked,
      likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1
    });
    
    try {
      await api.post(`/posts/${postId}/like`, {
        action: post.isLiked ? 'unlike' : 'like'
      });
    } catch (error) {
      // Rollback on failure
      feedStore.updatePost(postId, {
        isLiked: post.isLiked,
        likesCount: post.likesCount
      });
      
      showError('Failed to like post');
    }
  }
  
  async addComment(postId, content) {
    const tempId = `temp_${Date.now()}`;
    
    // Optimistic update
    const comment = {
      id: tempId,
      postId,
      content,
      author: currentUser,
      timestamp: Date.now(),
      status: 'sending'
    };
    
    commentStore.addComment(comment);
    
    try {
      const response = await api.post(`/posts/${postId}/comments`, {
        content
      });
      
      // Replace temp comment with real one
      commentStore.replaceComment(tempId, response.data);
      
    } catch (error) {
      commentStore.updateCommentStatus(tempId, 'failed');
    }
  }
}

// 5. Real-time Updates via WebSocket
class FeedUpdater {
  constructor() {
    this.ws = null;
    this.updateQueue = [];
    this.connect();
  }
  
  connect() {
    this.ws = new WebSocket('wss://feed.api.com');
    
    this.ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      this.handleUpdate(update);
    };
  }
  
  handleUpdate(update) {
    switch (update.type) {
      case 'new_post':
        // Show "New posts available" banner
        this.showNewPostsIndicator(update.count);
        break;
      
      case 'post_updated':
        feedStore.updatePost(update.postId, update.data);
        break;
      
      case 'post_deleted':
        feedStore.removePost(update.postId);
        break;
      
      case 'like_update':
        this.updateLikeCount(update.postId, update.likesCount);
        break;
    }
  }
  
  showNewPostsIndicator(count) {
    const banner = document.getElementById('new-posts-banner');
    banner.textContent = `${count} new posts available`;
    banner.style.display = 'block';
    banner.onclick = () => this.loadNewPosts();
  }
  
  async loadNewPosts() {
    const latestPost = feedStore.feedOrder[0];
    const newPosts = await api.get('/feed', {
      after: latestPost,
      limit: 20
    });
    
    feedStore.addPosts(newPosts.data);
    // Prepend to feed
    this.prependPosts(newPosts.data);
  }
}

// 6. Feed API with Caching
class FeedAPI {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }
  
  async getFeed(options = {}) {
    const cacheKey = this.getCacheKey(options);
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    
    const response = await fetch('/api/feed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    });
    
    const data = await response.json();
    
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  }
  
  getCacheKey(options) {
    return JSON.stringify(options);
  }
  
  invalidateCache() {
    this.cache.clear();
  }
}

// 7. Image Optimization
class ImageOptimizer {
  constructor() {
    this.observer = null;
    this.setupLazyLoading();
  }
  
  setupLazyLoading() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '200px' }
    );
  }
  
  loadImage(img) {
    // Load progressive image
    if (img.dataset.lowres) {
      img.src = img.dataset.lowres;
      
      const fullImage = new Image();
      fullImage.onload = () => {
        img.src = fullImage.src;
        img.classList.add('loaded');
      };
      fullImage.src = img.dataset.full;
    } else {
      img.src = img.dataset.src;
    }
  }
  
  observe(img) {
    this.observer.observe(img);
  }
}

// 8. Performance Monitoring
class FeedPerformance {
  constructor() {
    this.metrics = {
      firstPostRender: 0,
      feedLoadTime: 0,
      scrollPerformance: []
    };
    
    this.trackPerformance();
  }
  
  trackPerformance() {
    // Time to First Post
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.name === 'first-post-render') {
          this.metrics.firstPostRender = entry.startTime;
        }
      });
    });
    
    observer.observe({ entryTypes: ['measure'] });
    
    // Scroll Performance (FPS)
    let lastTimestamp = 0;
    const checkScrollPerformance = (timestamp) => {
      if (lastTimestamp) {
        const fps = 1000 / (timestamp - lastTimestamp);
        this.metrics.scrollPerformance.push(fps);
      }
      lastTimestamp = timestamp;
      requestAnimationFrame(checkScrollPerformance);
    };
    
    requestAnimationFrame(checkScrollPerformance);
  }
  
  reportMetrics() {
    const avgFPS = this.metrics.scrollPerformance.reduce((a, b) => a + b, 0) 
      / this.metrics.scrollPerformance.length;
    
    analytics.track('feed_performance', {
      firstPostRender: this.metrics.firstPostRender,
      feedLoadTime: this.metrics.feedLoadTime,
      avgFPS: avgFPS.toFixed(2)
    });
  }
}
```

### Key Design Decisions

**1. Pagination Strategy**:
- Cursor-based pagination for consistency
- Pre-fetch next page when user is 80% scrolled
- Keep last 200 posts in memory, evict older ones

**2. Rendering Strategy**:
- Server-side render initial 10 posts for fast FCP
- Client-side render for infinite scroll
- Virtual scrolling for lists > 100 items

**3. Caching Strategy**:
```
Level 1: Memory (Feed Store) - Immediate access
Level 2: IndexedDB - Offline support
Level 3: Service Worker - Network cache
Level 4: CDN - Static assets
```

**4. Real-time Updates**:
- WebSocket for live updates
- Batch updates every 5 seconds to reduce re-renders
- Show indicator instead of auto-inserting (prevents scroll jump)

---

## Design a Video Streaming Platform (YouTube/Netflix)

### Requirements
**Functional**:
- Video playback (play, pause, seek)
- Quality selection (auto, 1080p, 720p, 480p, 360p)
- Subtitles/captions
- Playback speed control
- Picture-in-Picture
- Recommendations
- Watch history
- Resume playback

**Non-Functional**:
- Low buffering (< 3s initial load)
- Adaptive bitrate streaming
- Support various formats (MP4, WebM, HLS, DASH)
- Handle network fluctuations
- Analytics tracking

### Architecture

```javascript
/**
 * Video Streaming Architecture
 */

// 1. Adaptive Bitrate Player
class VideoPlayer {
  constructor(container, options = {}) {
    this.container = container;
    this.video = null;
    this.hls = null;
    this.currentQuality = 'auto';
    this.buffering = false;
    this.analytics = new VideoAnalytics();
    
    this.init();
  }
  
  init() {
    this.createVideoElement();
    this.setupEventListeners();
    this.setupQualitySelector();
    this.setupProgressTracking();
  }
  
  createVideoElement() {
    this.video = document.createElement('video');
    this.video.controls = false; // Custom controls
    this.video.preload = 'metadata';
    this.container.appendChild(this.video);
  }
  
  async loadVideo(videoUrl, format = 'hls') {
    if (format === 'hls') {
      if (Hls.isSupported()) {
        this.hls = new Hls({
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          enableWorker: true,
          lowLatencyMode: false
        });
        
        this.hls.loadSource(videoUrl);
        this.hls.attachMedia(this.video);
        
        this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
          this.onManifestLoaded();
        });
        
        this.hls.on(Hls.Events.ERROR, (event, data) => {
          this.handleError(data);
        });
        
        this.hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          this.onQualityChange(data.level);
        });
        
      } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        this.video.src = videoUrl;
      }
    } else {
      this.video.src = videoUrl;
    }
  }
  
  setupEventListeners() {
    // Playback events
    this.video.addEventListener('play', () => {
      this.analytics.trackPlay();
    });
    
    this.video.addEventListener('pause', () => {
      this.analytics.trackPause();
    });
    
    this.video.addEventListener('ended', () => {
      this.analytics.trackComplete();
      this.onVideoEnd();
    });
    
    // Buffering events
    this.video.addEventListener('waiting', () => {
      this.buffering = true;
      this.showBufferingIndicator();
      this.analytics.trackBufferStart();
    });
    
    this.video.addEventListener('canplay', () => {
      if (this.buffering) {
        this.buffering = false;
        this.hideBufferingIndicator();
        this.analytics.trackBufferEnd();
      }
    });
    
    // Time updates
    this.video.addEventListener('timeupdate', () => {
      this.onTimeUpdate();
    });
    
    // Volume
    this.video.addEventListener('volumechange', () => {
      this.onVolumeChange();
    });
  }
  
  setupQualitySelector() {
    if (!this.hls) return;
    
    const qualities = this.hls.levels.map((level, index) => ({
      index,
      height: level.height,
      bitrate: level.bitrate,
      label: `${level.height}p`
    }));
    
    this.renderQualityMenu(qualities);
  }
  
  changeQuality(levelIndex) {
    if (this.hls) {
      this.hls.currentLevel = levelIndex;
      this.currentQuality = levelIndex === -1 ? 'auto' : `${this.hls.levels[levelIndex].height}p`;
    }
  }
  
  setupProgressTracking() {
    setInterval(() => {
      if (!this.video.paused) {
        this.saveProgress();
      }
    }, 10000); // Save every 10 seconds
  }
  
  async saveProgress() {
    const progress = {
      videoId: this.videoId,
      currentTime: this.video.currentTime,
      duration: this.video.duration,
      percentage: (this.video.currentTime / this.video.duration) * 100
    };
    
    await api.post('/video/progress', progress);
    
    // Also save locally for offline
    await db.saveProgress(progress);
  }
  
  async resumeFromProgress() {
    const progress = await api.get(`/video/progress/${this.videoId}`);
    
    if (progress && progress.percentage < 95) {
      this.showResumeDialog(progress.currentTime);
    }
  }
  
  showResumeDialog(time) {
    const dialog = document.createElement('div');
    dialog.className = 'resume-dialog';
    dialog.innerHTML = `
      <p>Resume from ${this.formatTime(time)}?</p>
      <button onclick="player.seek(${time})">Resume</button>
      <button onclick="player.play()">Start Over</button>
    `;
    this.container.appendChild(dialog);
  }
  
  // Playback controls
  play() {
    this.video.play();
  }
  
  pause() {
    this.video.pause();
  }
  
  seek(time) {
    this.video.currentTime = time;
  }
  
  setVolume(volume) {
    this.video.volume = volume;
  }
  
  setPlaybackRate(rate) {
    this.video.playbackRate = rate;
  }
  
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
  
  async togglePictureInPicture() {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await this.video.requestPictureInPicture();
      }
    } catch (error) {
      console.error('PiP error:', error);
    }
  }
  
  // Subtitles
  loadSubtitles(tracks) {
    tracks.forEach(track => {
      const textTrack = this.video.addTextTrack('subtitles', track.label, track.language);
      
      fetch(track.url)
        .then(res => res.text())
        .then(vtt => this.parseVTT(vtt, textTrack));
    });
  }
  
  parseVTT(vtt, track) {
    const cues = vtt.split('\n\n').slice(1); // Skip header
    
    cues.forEach(cue => {
      const lines = cue.split('\n');
      const timecode = lines[0].split(' --> ');
      const text = lines.slice(1).join('\n');
      
      track.addCue(new VTTCue(
        this.parseTime(timecode[0]),
        this.parseTime(timecode[1]),
        text
      ));
    });
  }
}

// 2. Video Analytics
class VideoAnalytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.events = [];
    this.heartbeatInterval = null;
  }
  
  trackPlay() {
    this.sendEvent('play', {
      timestamp: Date.now(),
      currentTime: player.video.currentTime
    });
    
    this.startHeartbeat();
  }
  
  trackPause() {
    this.sendEvent('pause', {
      timestamp: Date.now(),
      currentTime: player.video.currentTime
    });
    
    this.stopHeartbeat();
  }
  
  trackBufferStart() {
    this.bufferStartTime = Date.now();
  }
  
  trackBufferEnd() {
    const bufferDuration = Date.now() - this.bufferStartTime;
    
    this.sendEvent('buffer', {
      duration: bufferDuration,
      currentTime: player.video.currentTime
    });
  }
  
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.sendEvent('heartbeat', {
        currentTime: player.video.currentTime,
        buffered: this.getBufferedRanges(),
        quality: player.currentQuality
      });
    }, 30000); // Every 30 seconds
  }
  
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }
  
  getBufferedRanges() {
    const ranges = [];
    for (let i = 0; i < player.video.buffered.length; i++) {
      ranges.push({
        start: player.video.buffered.start(i),
        end: player.video.buffered.end(i)
      });
    }
    return ranges;
  }
  
  sendEvent(type, data) {
    const event = {
      sessionId: this.sessionId,
      videoId: player.videoId,
      type,
      data,
      timestamp: Date.now()
    };
    
    this.events.push(event);
    
    // Batch send events
    if (this.events.length >= 10) {
      this.flush();
    }
  }
  
  async flush() {
    if (this.events.length === 0) return;
    
    const eventsToSend = [...this.events];
    this.events = [];
    
    try {
      await api.post('/analytics/video-events', {
        events: eventsToSend
      });
    } catch (error) {
      // Re-add events on failure
      this.events = [...eventsToSend, ...this.events];
    }
  }
}

// 3. Recommendation Engine (Client-side)
class VideoRecommendations {
  constructor() {
    this.watchHistory = [];
    this.interactions = new Map();
  }
  
  async getRecommendations(videoId, count = 10) {
    // Hybrid approach: collaborative + content-based
    const [collaborative, contentBased] = await Promise.all([
      this.getCollaborativeRecommendations(videoId),
      this.getContentBasedRecommendations(videoId)
    ]);
    
    // Merge and rank
    const merged = this.mergeRecommendations(collaborative, contentBased);
    return merged.slice(0, count);
  }
  
  async getCollaborativeRecommendations(videoId) {
    // Users who watched this also watched...
    return api.get(`/recommendations/collaborative/${videoId}`);
  }
  
  async getContentBasedRecommendations(videoId) {
    // Similar content (tags, categories, duration)
    return api.get(`/recommendations/content-based/${videoId}`);
  }
  
  mergeRecommendations(list1, list2) {
    const scoreMap = new Map();
    
    // Weight collaborative more heavily
    list1.forEach((video, index) => {
      scoreMap.set(video.id, {
        ...video,
        score: (list1.length - index) * 1.5
      });
    });
    
    list2.forEach((video, index) => {
      const existing = scoreMap.get(video.id);
      const contentScore = (list2.length - index) * 1.0;
      
      if (existing) {
        existing.score += contentScore;
      } else {
        scoreMap.set(video.id, {
          ...video,
          score: contentScore
        });
      }
    });
    
    return Array.from(scoreMap.values())
      .sort((a, b) => b.score - a.score);
  }
  
  trackInteraction(videoId, type, value) {
    this.interactions.set(videoId, {
      type,
      value,
      timestamp: Date.now()
    });
    
    // Send to backend for model training
    api.post('/recommendations/interaction', {
      videoId,
      type,
      value
    });
  }
}

// 4. Thumbnail Preview on Hover
class ThumbnailPreview {
  constructor() {
    this.cache = new Map();
    this.previewContainer = null;
  }
  
  setup(videoElement) {
    videoElement.addEventListener('mouseenter', (e) => {
      this.showPreview(e.target);
    });
    
    videoElement.addEventListener('mousemove', (e) => {
      this.updatePreview(e.target, e);
    });
    
    videoElement.addEventListener('mouseleave', () => {
      this.hidePreview();
    });
  }
  
  async showPreview(element) {
    const videoId = element.dataset.videoId;
    const thumbnails = await this.getThumbnails(videoId);
    
    this.previewContainer = document.createElement('div');
    this.previewContainer.className = 'thumbnail-preview';
    
    const img = document.createElement('img');
    img.src = thumbnails[0];
    
    this.previewContainer.appendChild(img);
    element.appendChild(this.previewContainer);
  }
  
  updatePreview(element, event) {
    if (!this.previewContainer) return;
    
    const rect = element.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const thumbnailIndex = Math.floor(percent * 10); // 10 thumbnails
    
    const img = this.previewContainer.querySelector('img');
    img.src = this.cache.get(element.dataset.videoId)[thumbnailIndex];
  }
  
  async getThumbnails(videoId) {
    if (this.cache.has(videoId)) {
      return this.cache.get(videoId);
    }
    
    const thumbnails = await api.get(`/video/${videoId}/thumbnails`);
    this.cache.set(videoId, thumbnails);
    return thumbnails;
  }
}

// 5. Preloading Strategy
class VideoPreloader {
  constructor() {
    this.preloadQueue = [];
    this.maxPreload = 3;
  }
  
  preloadNext(videos) {
    const toPreload = videos.slice(0, this.maxPreload);
    
    toPreload.forEach(video => {
      if (!this.isPreloaded(video.id)) {
        this.preload(video);
      }
    });
  }
  
  preload(video) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'video';
    link.href = video.url;
    document.head.appendChild(link);
    
    this.preloadQueue.push(video.id);
  }
  
  isPreloaded(videoId) {
    return this.preloadQueue.includes(videoId);
  }
}
```

### Key Design Decisions

**1. Video Delivery**:
- Use HLS (HTTP Live Streaming) for adaptive bitrate
- Segment videos into 6-second chunks
- Multiple quality levels (360p to 4K)
- CDN for edge delivery

**2. Buffering Strategy**:
- Buffer ahead: 30 seconds
- Buffer behind: Keep last 10 seconds
- Auto-quality adjustment based on network speed

**3. Analytics**:
```
Client-side tracking:
- Playback events (play, pause, seek)
- Buffering events
- Quality changes
- Engagement metrics (watch time, completion rate)

Server-side aggregation:
- View counts
- Average watch time
- Drop-off points
- Quality distribution
```

**4. Performance Optimizations**:
- Lazy load video player
- Preload next video in playlist
- Thumbnail sprite sheets
- MSE (Media Source Extensions) for buffer control

**5. Offline Support**:
- Download videos for offline viewing
- Store in IndexedDB (up to storage quota)
- Resume downloads
- Manage downloaded content

---

[Continue with remaining system design questions...]

Would you like me to continue with the rest of the frontend system design questions, मालिक?

