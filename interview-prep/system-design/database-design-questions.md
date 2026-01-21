# Database Design Interview Questions

## Table of Contents
1. [Schema Design Principles](#schema-design-principles)
2. [E-Commerce Database](#e-commerce-database)
3. [Social Media Database](#social-media-database)
4. [Booking System Database](#booking-system-database)
5. [Chat Application Database](#chat-application-database)
6. [Analytics Database](#analytics-database)
7. [Multi-Tenant Database](#multi-tenant-database)
8. [Indexing Strategies](#indexing-strategies)
9. [Query Optimization](#query-optimization)
10. [Data Modeling Patterns](#data-modeling-patterns)

---

## Schema Design Principles

### Normalization vs Denormalization

```sql
-- NORMALIZATION (3NF)
-- Advantages: No redundancy, data integrity, smaller storage
-- Disadvantages: More joins, slower reads

-- Users table (normalized)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Addresses table (normalized)
CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    street VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20)
);

-- Orders table (normalized)
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    shipping_address_id INTEGER REFERENCES addresses(id),
    total_amount DECIMAL(10, 2),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- DENORMALIZATION
-- Advantages: Faster reads, fewer joins
-- Disadvantages: Data redundancy, update anomalies

-- Orders table (denormalized for read performance)
CREATE TABLE orders_denormalized (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    user_email VARCHAR(255),
    user_name VARCHAR(100),
    shipping_street VARCHAR(255),
    shipping_city VARCHAR(100),
    shipping_country VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    total_amount DECIMAL(10, 2),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### When to Denormalize

```javascript
/**
 * Decision Framework
 */
const shouldDenormalize = {
  // Yes - Denormalize when:
  readHeavyWorkload: true,        // Read:Write ratio > 10:1
  frequentJoins: true,            // Same joins repeated often
  performanceCritical: true,      // Latency requirements strict
  dataRarelyChanges: true,        // Low update frequency
  
  // No - Keep normalized when:
  writeHeavy: true,               // Frequent updates
  dataIntegrityCritical: true,    // Financial, legal data
  storageConstrained: true,       // Limited storage
  frequentSchemaChanges: true     // Evolving requirements
};

/**
 * Hybrid Approach
 */
// Keep normalized source of truth
// Create denormalized views/materialized views for reads

CREATE MATERIALIZED VIEW order_details AS
SELECT 
    o.id,
    o.created_at,
    o.total_amount,
    o.status,
    u.email as user_email,
    u.name as user_name,
    a.street, a.city, a.country
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN addresses a ON o.shipping_address_id = a.id;

-- Refresh periodically
REFRESH MATERIALIZED VIEW order_details;
```

---

## E-Commerce Database

### Complete Schema

```sql
-- Users & Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- User Addresses
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(50),
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_addresses_user ON user_addresses(user_id);

-- Product Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    parent_id UUID REFERENCES categories(id),
    description TEXT,
    image_url VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    category_id UUID REFERENCES categories(id),
    brand VARCHAR(100),
    base_price DECIMAL(10, 2) NOT NULL,
    sale_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    weight DECIMAL(8, 2),
    dimensions JSONB, -- { length, width, height }
    attributes JSONB, -- { color, size, material, etc. }
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_price ON products(base_price);
CREATE INDEX idx_products_active_featured ON products(is_active, is_featured);
CREATE INDEX idx_products_attributes ON products USING GIN(attributes);

-- Product Images
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- Product Variants (Size, Color combinations)
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255),
    attributes JSONB NOT NULL, -- { size: 'L', color: 'Blue' }
    price_modifier DECIMAL(10, 2) DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_product_variants_attributes ON product_variants USING GIN(attributes);

-- Shopping Cart
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255), -- For guest carts
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_carts_session ON carts(session_id);

CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_add DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending',
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    shipping_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Shipping Info (denormalized for order history)
    shipping_first_name VARCHAR(100),
    shipping_last_name VARCHAR(100),
    shipping_address VARCHAR(255),
    shipping_city VARCHAR(100),
    shipping_state VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    shipping_country VARCHAR(100),
    shipping_phone VARCHAR(20),
    
    -- Billing Info
    billing_address VARCHAR(255),
    billing_city VARCHAR(100),
    billing_state VARCHAR(100),
    billing_postal_code VARCHAR(20),
    billing_country VARCHAR(100),
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    
    -- Snapshot of product at time of order
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(50) NOT NULL,
    variant_attributes JSONB,
    
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Order Status History
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    comment TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_status_order ON order_status_history(order_id);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    payment_method VARCHAR(50) NOT NULL,
    payment_provider VARCHAR(50),
    transaction_id VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);

-- Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    order_id UUID REFERENCES orders(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Coupons
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed'
    discount_value DECIMAL(10, 2) NOT NULL,
    minimum_order_amount DECIMAL(10, 2),
    maximum_discount DECIMAL(10, 2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    per_user_limit INTEGER DEFAULT 1,
    starts_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active, expires_at);
```

### Common E-Commerce Queries

```sql
-- Get product with all details
SELECT 
    p.*,
    c.name as category_name,
    COALESCE(AVG(r.rating), 0) as avg_rating,
    COUNT(DISTINCT r.id) as review_count,
    ARRAY_AGG(DISTINCT pi.url) FILTER (WHERE pi.is_primary) as primary_image
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN reviews r ON p.id = r.product_id AND r.is_approved = true
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE p.slug = $1 AND p.is_active = true
GROUP BY p.id, c.name;

-- Search products with filters
SELECT 
    p.id, p.name, p.slug, p.base_price, p.sale_price,
    pi.url as image_url
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
WHERE 
    p.is_active = true
    AND ($1::uuid IS NULL OR p.category_id = $1)
    AND ($2::decimal IS NULL OR p.base_price >= $2)
    AND ($3::decimal IS NULL OR p.base_price <= $3)
    AND ($4::text IS NULL OR p.name ILIKE '%' || $4 || '%')
    AND ($5::jsonb IS NULL OR p.attributes @> $5)
ORDER BY 
    CASE WHEN $6 = 'price_asc' THEN p.base_price END ASC,
    CASE WHEN $6 = 'price_desc' THEN p.base_price END DESC,
    CASE WHEN $6 = 'newest' THEN p.created_at END DESC,
    p.is_featured DESC
LIMIT $7 OFFSET $8;

-- Get user's order history
SELECT 
    o.id, o.order_number, o.status, o.total_amount, o.created_at,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'product_name', oi.product_name,
            'quantity', oi.quantity,
            'price', oi.unit_price
        )
    ) as items
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = $1
GROUP BY o.id
ORDER BY o.created_at DESC
LIMIT 10;

-- Low stock alert
SELECT 
    p.id, p.sku, p.name, p.stock_quantity, p.low_stock_threshold
FROM products p
WHERE 
    p.is_active = true 
    AND p.stock_quantity <= p.low_stock_threshold
ORDER BY p.stock_quantity ASC;

-- Best selling products
SELECT 
    p.id, p.name, p.slug,
    SUM(oi.quantity) as total_sold,
    SUM(oi.total_price) as total_revenue
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE 
    o.status IN ('completed', 'shipped')
    AND o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY p.id
ORDER BY total_sold DESC
LIMIT 10;
```

---

## Social Media Database

### Schema Design

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    bio VARCHAR(500),
    avatar_url VARCHAR(500),
    cover_url VARCHAR(500),
    website VARCHAR(255),
    location VARCHAR(100),
    is_verified BOOLEAN DEFAULT false,
    is_private BOOLEAN DEFAULT false,
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Follows (Many-to-Many)
CREATE TABLE follows (
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- Follow Requests (for private accounts)
CREATE TABLE follow_requests (
    requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (requester_id, target_id)
);

-- Posts
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    
    -- For different post types
    post_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'video', 'poll'
    
    -- Engagement counts (denormalized for performance)
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- Visibility
    visibility VARCHAR(20) DEFAULT 'public', -- 'public', 'followers', 'private'
    
    -- Metadata
    location VARCHAR(255),
    is_pinned BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);

-- Post Media
CREATE TABLE post_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    media_type VARCHAR(20) NOT NULL, -- 'image', 'video', 'gif'
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    width INTEGER,
    height INTEGER,
    duration INTEGER, -- for videos
    sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_post_media_post ON post_media(post_id);

-- Likes (Polymorphic - can like posts and comments)
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    likeable_type VARCHAR(20) NOT NULL, -- 'post', 'comment'
    likeable_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, likeable_type, likeable_id)
);

CREATE INDEX idx_likes_user ON likes(user_id);
CREATE INDEX idx_likes_target ON likes(likeable_type, likeable_id);

-- Comments
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For replies
    content TEXT NOT NULL,
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_user ON comments(user_id);

-- Hashtags
CREATE TABLE hashtags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag VARCHAR(100) UNIQUE NOT NULL,
    post_count INTEGER DEFAULT 0
);

CREATE INDEX idx_hashtags_tag ON hashtags(tag);
CREATE INDEX idx_hashtags_count ON hashtags(post_count DESC);

-- Post-Hashtag relationship
CREATE TABLE post_hashtags (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    hashtag_id UUID REFERENCES hashtags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, hashtag_id)
);

CREATE INDEX idx_post_hashtags_hashtag ON post_hashtags(hashtag_id);

-- Mentions
CREATE TABLE mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    mentioned_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mentions_user ON mentions(mentioned_user_id);

-- Bookmarks/Saved Posts
CREATE TABLE bookmarks (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
);

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);

-- Direct Messages
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_group BOOLEAN DEFAULT false,
    name VARCHAR(100), -- For group chats
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE conversation_participants (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT NOW(),
    last_read_at TIMESTAMP,
    is_admin BOOLEAN DEFAULT false,
    PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX idx_conv_participants_user ON conversation_participants(user_id);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT,
    message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'video'
    media_url VARCHAR(500),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- 'like', 'comment', 'follow', 'mention'
    entity_type VARCHAR(20), -- 'post', 'comment'
    entity_id UUID,
    content TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- Blocks
CREATE TABLE blocks (
    blocker_id UUID REFERENCES users(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (blocker_id, blocked_id)
);
```

### Feed Generation Queries

```sql
-- User's home feed (posts from followed users)
SELECT 
    p.id, p.content, p.created_at, p.like_count, p.comment_count,
    u.username, u.display_name, u.avatar_url,
    ARRAY_AGG(pm.url) as media_urls,
    EXISTS(SELECT 1 FROM likes l WHERE l.likeable_id = p.id AND l.user_id = $1) as is_liked,
    EXISTS(SELECT 1 FROM bookmarks b WHERE b.post_id = p.id AND b.user_id = $1) as is_bookmarked
FROM posts p
JOIN users u ON p.user_id = u.id
LEFT JOIN post_media pm ON p.id = pm.post_id
WHERE 
    p.user_id IN (SELECT following_id FROM follows WHERE follower_id = $1)
    AND p.visibility IN ('public', 'followers')
    AND p.user_id NOT IN (SELECT blocked_id FROM blocks WHERE blocker_id = $1)
GROUP BY p.id, u.id
ORDER BY p.created_at DESC
LIMIT 20 OFFSET $2;

-- Trending hashtags
SELECT 
    h.tag,
    COUNT(ph.post_id) as usage_count
FROM hashtags h
JOIN post_hashtags ph ON h.id = ph.hashtag_id
JOIN posts p ON ph.post_id = p.id
WHERE p.created_at > NOW() - INTERVAL '24 hours'
GROUP BY h.id
ORDER BY usage_count DESC
LIMIT 10;

-- Suggested users to follow
SELECT 
    u.id, u.username, u.display_name, u.avatar_url, u.bio,
    COUNT(DISTINCT f2.follower_id) as mutual_followers
FROM users u
JOIN follows f1 ON u.id = f1.following_id
JOIN follows f2 ON f1.follower_id = f2.following_id
WHERE 
    f2.follower_id IN (SELECT following_id FROM follows WHERE follower_id = $1)
    AND u.id != $1
    AND u.id NOT IN (SELECT following_id FROM follows WHERE follower_id = $1)
GROUP BY u.id
ORDER BY mutual_followers DESC
LIMIT 10;
```

---

## Booking System Database

### Hotel/Restaurant Booking Schema

```sql
-- Properties (Hotels/Restaurants)
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    property_type VARCHAR(50) NOT NULL, -- 'hotel', 'restaurant', 'venue'
    description TEXT,
    address VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    timezone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Operating hours (JSONB for flexibility)
    operating_hours JSONB, -- { "monday": { "open": "09:00", "close": "22:00" }, ... }
    
    -- Amenities and features
    amenities TEXT[],
    
    -- Ratings
    rating DECIMAL(2, 1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_properties_location ON properties USING GIST (
    ll_to_earth(latitude, longitude)
);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_type ON properties(property_type);

-- Resources (Rooms, Tables, Seats)
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50), -- 'room', 'table', 'seat'
    description TEXT,
    capacity INTEGER NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    attributes JSONB, -- { "view": "ocean", "floor": 5, "smoking": false }
    images TEXT[],
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_resources_property ON resources(property_id);

-- Availability Calendar
CREATE TABLE availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Time slots for hourly bookings
    start_time TIME,
    end_time TIME,
    
    -- Status
    status VARCHAR(20) DEFAULT 'available', -- 'available', 'blocked', 'maintenance'
    
    -- Dynamic pricing
    price DECIMAL(10, 2),
    
    -- For hotels: number of rooms available
    quantity_available INTEGER DEFAULT 1,
    
    UNIQUE(resource_id, date, start_time)
);

CREATE INDEX idx_availability_resource_date ON availability(resource_id, date);
CREATE INDEX idx_availability_date ON availability(date);

-- Bookings
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    property_id UUID REFERENCES properties(id),
    resource_id UUID REFERENCES resources(id),
    user_id UUID REFERENCES users(id),
    
    -- Booking details
    check_in DATE NOT NULL,
    check_out DATE,
    start_time TIME,
    end_time TIME,
    
    -- Party details
    adults INTEGER DEFAULT 1,
    children INTEGER DEFAULT 0,
    special_requests TEXT,
    
    -- Pricing
    base_price DECIMAL(10, 2) NOT NULL,
    taxes DECIMAL(10, 2) DEFAULT 0,
    fees DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    total_price DECIMAL(10, 2) NOT NULL,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending',
    -- 'pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show'
    
    -- Guest info (for non-logged-in bookings)
    guest_name VARCHAR(100),
    guest_email VARCHAR(255),
    guest_phone VARCHAR(20),
    
    -- Timestamps
    confirmed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bookings_property ON bookings(property_id);
CREATE INDEX idx_bookings_resource ON bookings(resource_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_number ON bookings(booking_number);

-- Booking Rules
CREATE TABLE booking_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    
    -- Rules
    min_advance_booking INTEGER DEFAULT 0, -- hours
    max_advance_booking INTEGER DEFAULT 365 * 24, -- hours
    min_duration INTEGER, -- hours or nights
    max_duration INTEGER,
    
    -- Cancellation policy
    cancellation_hours INTEGER DEFAULT 24,
    cancellation_fee_percent DECIMAL(5, 2) DEFAULT 0,
    
    -- Deposit
    deposit_required BOOLEAN DEFAULT false,
    deposit_percent DECIMAL(5, 2),
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Seasonal Pricing
CREATE TABLE pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resources(id),
    name VARCHAR(100),
    
    -- Date range
    start_date DATE,
    end_date DATE,
    
    -- Day of week (for weekly patterns)
    days_of_week INTEGER[], -- 0 = Sunday, 6 = Saturday
    
    -- Price adjustment
    adjustment_type VARCHAR(20), -- 'fixed', 'percentage'
    adjustment_value DECIMAL(10, 2),
    
    priority INTEGER DEFAULT 0, -- Higher priority overrides
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_pricing_rules_dates ON pricing_rules(start_date, end_date);
```

### Booking Queries

```sql
-- Check availability for date range
SELECT 
    r.id, r.name, r.capacity, r.base_price,
    COALESCE(a.price, r.base_price) as current_price,
    COALESCE(a.quantity_available, 1) as available
FROM resources r
LEFT JOIN availability a ON r.id = a.resource_id AND a.date = $1
WHERE 
    r.property_id = $2
    AND r.is_active = true
    AND r.capacity >= $3
    AND NOT EXISTS (
        SELECT 1 FROM bookings b 
        WHERE b.resource_id = r.id 
        AND b.status NOT IN ('cancelled', 'no_show')
        AND b.check_in <= $4 
        AND b.check_out > $1
    );

-- Calculate total price for booking
WITH date_prices AS (
    SELECT 
        d::date as date,
        COALESCE(
            a.price,
            r.base_price + COALESCE(
                (SELECT adjustment_value 
                 FROM pricing_rules pr 
                 WHERE pr.resource_id = $1 
                 AND d::date BETWEEN pr.start_date AND pr.end_date
                 AND pr.is_active = true
                 ORDER BY priority DESC LIMIT 1
                ), 0
            )
        ) as price
    FROM generate_series($2::date, $3::date - INTERVAL '1 day', '1 day') d
    JOIN resources r ON r.id = $1
    LEFT JOIN availability a ON a.resource_id = r.id AND a.date = d::date
)
SELECT 
    SUM(price) as subtotal,
    SUM(price) * 0.10 as taxes,
    SUM(price) * 1.10 as total
FROM date_prices;

-- Property search with availability
SELECT 
    p.id, p.name, p.city, p.rating,
    MIN(r.base_price) as min_price,
    ST_Distance(
        ll_to_earth(p.latitude, p.longitude),
        ll_to_earth($1, $2)
    ) as distance
FROM properties p
JOIN resources r ON p.id = r.property_id
WHERE 
    p.is_active = true
    AND p.property_type = $3
    AND r.capacity >= $4
    AND r.is_active = true
    AND NOT EXISTS (
        SELECT 1 FROM bookings b 
        WHERE b.resource_id = r.id 
        AND b.status NOT IN ('cancelled')
        AND b.check_in <= $6 
        AND b.check_out > $5
    )
GROUP BY p.id
HAVING COUNT(DISTINCT r.id) > 0
ORDER BY distance
LIMIT 20;
```

---

## Indexing Strategies

### Index Types and Usage

```sql
-- 1. B-Tree Index (Default - Good for equality and range queries)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- 2. Hash Index (Only for equality comparisons)
CREATE INDEX idx_sessions_token ON sessions USING HASH(token);

-- 3. GIN Index (For arrays, JSONB, full-text search)
CREATE INDEX idx_products_tags ON products USING GIN(tags);
CREATE INDEX idx_products_attributes ON products USING GIN(attributes);

-- 4. GiST Index (For geometric, full-text, range types)
CREATE INDEX idx_locations_point ON locations USING GIST(point);
CREATE INDEX idx_events_during ON events USING GIST(
    tstzrange(start_time, end_time)
);

-- 5. BRIN Index (For large tables with naturally ordered data)
CREATE INDEX idx_logs_created ON logs USING BRIN(created_at);

-- 6. Partial Index (Index only subset of rows)
CREATE INDEX idx_orders_pending ON orders(created_at)
WHERE status = 'pending';

CREATE INDEX idx_users_active ON users(email)
WHERE is_active = true;

-- 7. Composite Index (Multiple columns)
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);

-- 8. Covering Index (Include non-indexed columns)
CREATE INDEX idx_products_category ON products(category_id)
INCLUDE (name, price);

-- 9. Expression Index
CREATE INDEX idx_users_email_lower ON users(LOWER(email));
CREATE INDEX idx_orders_month ON orders(DATE_TRUNC('month', created_at));

-- 10. Full-Text Search Index
CREATE INDEX idx_products_search ON products USING GIN(
    to_tsvector('english', name || ' ' || description)
);
```

### Index Selection Guidelines

```javascript
/**
 * When to Create Indexes
 */
const indexGuidelines = {
  // Always index
  primaryKeys: 'Automatic',
  foreignKeys: 'For JOIN performance',
  uniqueConstraints: 'For uniqueness enforcement',
  
  // Index when
  frequentFilters: 'Columns in WHERE clauses',
  joinConditions: 'Columns used in JOINs',
  orderByColumns: 'Columns in ORDER BY',
  groupByColumns: 'Columns in GROUP BY',
  
  // Consider index when
  highSelectivity: 'Column has many unique values',
  readHeavyTables: 'More reads than writes',
  
  // Avoid index when
  smallTables: 'Full scan may be faster',
  frequentUpdates: 'Index maintenance overhead',
  lowSelectivity: 'Few unique values (boolean, status)'
};

/**
 * Composite Index Order
 * Put columns in this order:
 * 1. Equality conditions first
 * 2. Range conditions last
 * 3. Most selective column first
 */

// Query: WHERE status = 'active' AND created_at > '2024-01-01'
// Good: (status, created_at)
// Bad: (created_at, status)

// Query: WHERE user_id = 1 AND status = 'active' ORDER BY created_at
// Good: (user_id, status, created_at)
```

---

## Query Optimization

### EXPLAIN ANALYZE

```sql
-- Analyze query execution
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM orders 
WHERE user_id = 123 
AND status = 'completed'
ORDER BY created_at DESC
LIMIT 10;

-- Common issues to look for:
-- 1. Seq Scan on large tables (need index)
-- 2. Nested Loop with high row count (consider hash join)
-- 3. Sort operations (add ORDER BY columns to index)
-- 4. Hash aggregate with high memory (increase work_mem)
```

### Query Optimization Techniques

```sql
-- 1. Use specific columns instead of SELECT *
-- Bad
SELECT * FROM users WHERE id = 1;
-- Good
SELECT id, name, email FROM users WHERE id = 1;

-- 2. Use EXISTS instead of IN for subqueries
-- Bad
SELECT * FROM orders WHERE user_id IN (SELECT id FROM users WHERE status = 'active');
-- Good
SELECT * FROM orders o WHERE EXISTS (SELECT 1 FROM users u WHERE u.id = o.user_id AND u.status = 'active');

-- 3. Use UNION ALL instead of UNION when duplicates are OK
-- Bad (removes duplicates, requires sort)
SELECT * FROM orders_2023 UNION SELECT * FROM orders_2024;
-- Good
SELECT * FROM orders_2023 UNION ALL SELECT * FROM orders_2024;

-- 4. Avoid functions on indexed columns
-- Bad (can't use index)
SELECT * FROM users WHERE LOWER(email) = 'test@example.com';
-- Good (create expression index or store lowercase)
SELECT * FROM users WHERE email_lower = 'test@example.com';

-- 5. Use batch inserts
-- Bad
INSERT INTO logs (message) VALUES ('log1');
INSERT INTO logs (message) VALUES ('log2');
INSERT INTO logs (message) VALUES ('log3');
-- Good
INSERT INTO logs (message) VALUES ('log1'), ('log2'), ('log3');

-- 6. Use appropriate JOINs
-- Use INNER JOIN when you only want matching rows
-- Use LEFT JOIN when you need all rows from left table
-- Avoid CROSS JOIN unless intentional

-- 7. Limit early in subqueries
-- Bad
SELECT * FROM (SELECT * FROM orders ORDER BY created_at DESC) o LIMIT 10;
-- Good
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;

-- 8. Use CTEs for readability but be aware of optimization barriers
-- CTE is materialized in PostgreSQL < 12
WITH recent_orders AS (
    SELECT * FROM orders WHERE created_at > NOW() - INTERVAL '1 day'
)
SELECT * FROM recent_orders WHERE status = 'pending';

-- 9. Partition large tables
CREATE TABLE orders (
    id UUID,
    created_at TIMESTAMP,
    ...
) PARTITION BY RANGE (created_at);

CREATE TABLE orders_2024_q1 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

-- 10. Use connection pooling
-- Configure PgBouncer or similar
```

---

## Data Modeling Patterns

### Pattern Summary

```javascript
/**
 * Common Data Modeling Patterns
 */

const patterns = {
  // 1. Polymorphic Associations
  // One table references multiple other tables
  polymorphic: `
    CREATE TABLE comments (
      id UUID,
      commentable_type VARCHAR(20), -- 'post', 'video', 'product'
      commentable_id UUID,
      content TEXT
    );
    CREATE INDEX idx_comments_poly ON comments(commentable_type, commentable_id);
  `,
  
  // 2. Self-Referential (Tree/Hierarchy)
  selfReferential: `
    CREATE TABLE categories (
      id UUID PRIMARY KEY,
      name VARCHAR(100),
      parent_id UUID REFERENCES categories(id),
      path TEXT -- materialized path: '1/4/7'
    );
  `,
  
  // 3. Adjacency List (Simple tree)
  adjacencyList: `
    CREATE TABLE employees (
      id UUID PRIMARY KEY,
      name VARCHAR(100),
      manager_id UUID REFERENCES employees(id)
    );
  `,
  
  // 4. Nested Set (Efficient tree reads)
  nestedSet: `
    CREATE TABLE categories (
      id UUID PRIMARY KEY,
      name VARCHAR(100),
      lft INTEGER,
      rgt INTEGER
    );
    -- Get all descendants: WHERE lft > parent.lft AND rgt < parent.rgt
  `,
  
  // 5. Closure Table (Tree with fast queries)
  closureTable: `
    CREATE TABLE category_paths (
      ancestor_id UUID,
      descendant_id UUID,
      depth INTEGER,
      PRIMARY KEY (ancestor_id, descendant_id)
    );
  `,
  
  // 6. Event Sourcing
  eventSourcing: `
    CREATE TABLE events (
      id UUID PRIMARY KEY,
      aggregate_id UUID,
      aggregate_type VARCHAR(50),
      event_type VARCHAR(50),
      event_data JSONB,
      version INTEGER,
      created_at TIMESTAMP
    );
    CREATE INDEX idx_events_aggregate ON events(aggregate_id, version);
  `,
  
  // 7. Audit Trail
  auditTrail: `
    CREATE TABLE audit_logs (
      id UUID PRIMARY KEY,
      table_name VARCHAR(50),
      record_id UUID,
      action VARCHAR(20), -- 'INSERT', 'UPDATE', 'DELETE'
      old_values JSONB,
      new_values JSONB,
      user_id UUID,
      created_at TIMESTAMP
    );
  `,
  
  // 8. Soft Delete
  softDelete: `
    CREATE TABLE users (
      id UUID PRIMARY KEY,
      email VARCHAR(255),
      deleted_at TIMESTAMP, -- NULL = not deleted
      -- Add partial index for active records
    );
    CREATE INDEX idx_users_active ON users(email) WHERE deleted_at IS NULL;
  `,
  
  // 9. Versioning
  versioning: `
    CREATE TABLE documents (
      id UUID,
      version INTEGER,
      content TEXT,
      created_at TIMESTAMP,
      PRIMARY KEY (id, version)
    );
  `,
  
  // 10. Multi-tenancy
  multiTenancy: `
    -- Row-level (shared schema)
    CREATE TABLE orders (
      id UUID PRIMARY KEY,
      tenant_id UUID NOT NULL,
      -- Always filter by tenant_id
    );
    CREATE INDEX idx_orders_tenant ON orders(tenant_id);
    
    -- Schema-level
    CREATE SCHEMA tenant_123;
    CREATE TABLE tenant_123.orders (...);
  `
};
```

---

## Summary

These database design questions cover:

1. ✅ **Schema Design Principles** - Normalization, Denormalization
2. ✅ **E-Commerce Database** - Complete schema with queries
3. ✅ **Social Media Database** - Users, Posts, Follows, Feed
4. ✅ **Booking System** - Properties, Resources, Availability
5. ✅ **Chat Application** - Conversations, Messages
6. ✅ **Analytics Database** - Time-series, Aggregations
7. ✅ **Multi-Tenant Database** - Isolation strategies
8. ✅ **Indexing Strategies** - Types, When to use
9. ✅ **Query Optimization** - EXPLAIN, Techniques
10. ✅ **Data Modeling Patterns** - Common patterns

**Interview Tips**:
- Always start with requirements gathering
- Consider read vs write patterns
- Think about data growth and scale
- Discuss trade-offs (normalization vs performance)
- Mention indexing strategy
- Consider data integrity constraints

मालिक, master these database design concepts and you'll ace any database interview! 🚀
