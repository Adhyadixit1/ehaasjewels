-- =============================================
-- ADMIN PANEL SQL EXTENSIONS
-- For Ehsaas Jewelry E-commerce Platform
-- =============================================

USE ehsaas_jewelry;

-- =============================================
-- 1. ADMIN ROLES AND PERMISSIONS
-- =============================================

-- Admin permissions table
CREATE TABLE admin_permissions (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- products, orders, users, analytics, settings
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_permission_name (permission_name),
    INDEX idx_category (category)
);

-- Admin roles table  
CREATE TABLE admin_roles (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_system_role BOOLEAN DEFAULT FALSE, -- cannot be deleted
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_role_name (role_name)
);

-- Role permissions mapping
CREATE TABLE admin_role_permissions (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (role_id) REFERENCES admin_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES admin_permissions(id) ON DELETE CASCADE,
    INDEX idx_role_id (role_id),
    INDEX idx_permission_id (permission_id),
    
    -- Prevent duplicate role-permission assignments
    UNIQUE KEY unique_role_permission (role_id, permission_id)
);

-- User role assignments
CREATE TABLE admin_user_roles (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    assigned_by UUID NOT NULL,
    expires_at TIMESTAMP NULL, -- NULL means no expiration
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES admin_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id),
    INDEX idx_expires_at (expires_at)
);

-- =============================================
-- 2. ADMIN ACTIVITY LOGS
-- =============================================

CREATE TABLE admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    user_id UUID NOT NULL,
    action_type ENUM('create', 'update', 'delete', 'view', 'export', 'import', 'login', 'logout') NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- products, orders, users, categories, etc.
    entity_id VARCHAR(100), -- ID of the affected entity
    
    -- Action details
    description TEXT NOT NULL,
    old_values JSON, -- Previous values for updates
    new_values JSON, -- New values for creates/updates
    
    -- Request details
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_url VARCHAR(500),
    request_method VARCHAR(10),
    
    -- Additional metadata
    metadata JSON,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id),
    INDEX idx_action_type (action_type),
    INDEX idx_entity_type (entity_type),
    INDEX idx_entity_id (entity_id),
    INDEX idx_created_at (created_at),
    INDEX idx_severity (severity)
);

-- =============================================
-- 3. SITE ANALYTICS AND VISITOR TRACKING
-- =============================================

CREATE TABLE site_analytics (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    analytics_date DATE NOT NULL,
    
    -- Visitor metrics
    unique_visitors INT DEFAULT 0,
    total_page_views INT DEFAULT 0,
    new_visitors INT DEFAULT 0,
    returning_visitors INT DEFAULT 0,
    
    -- Engagement metrics
    avg_session_duration_seconds INT DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0.00, -- percentage
    pages_per_session DECIMAL(4,2) DEFAULT 0.00,
    
    -- E-commerce metrics
    total_orders INT DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    conversion_rate DECIMAL(5,2) DEFAULT 0.00, -- percentage
    avg_order_value DECIMAL(10,2) DEFAULT 0.00,
    
    -- Product metrics
    products_viewed INT DEFAULT 0,
    products_added_to_cart INT DEFAULT 0,
    products_added_to_wishlist INT DEFAULT 0,
    
    -- Traffic sources
    organic_traffic INT DEFAULT 0,
    direct_traffic INT DEFAULT 0,
    social_traffic INT DEFAULT 0,
    referral_traffic INT DEFAULT 0,
    paid_traffic INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_analytics_date (analytics_date),
    UNIQUE KEY unique_daily_analytics (analytics_date)
);

-- Page analytics for tracking individual page performance
CREATE TABLE page_analytics (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    page_url VARCHAR(500) NOT NULL,
    page_title VARCHAR(200),
    analytics_date DATE NOT NULL,
    
    -- Page metrics
    page_views INT DEFAULT 0,
    unique_page_views INT DEFAULT 0,
    avg_time_on_page_seconds INT DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0.00,
    exit_rate DECIMAL(5,2) DEFAULT 0.00,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_page_url (page_url),
    INDEX idx_analytics_date (analytics_date),
    UNIQUE KEY unique_page_daily_analytics (page_url, analytics_date)
);

-- User sessions for detailed visitor tracking
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID NULL, -- NULL for anonymous sessions
    
    -- Session details
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type ENUM('desktop', 'mobile', 'tablet', 'other') DEFAULT 'other',
    browser VARCHAR(100),
    operating_system VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    
    -- Session metrics
    session_start TIMESTAMP NOT NULL,
    session_end TIMESTAMP NULL,
    duration_seconds INT DEFAULT 0,
    page_views INT DEFAULT 0,
    is_bounce BOOLEAN DEFAULT FALSE,
    
    -- E-commerce session data
    products_viewed INT DEFAULT 0,
    items_added_to_cart INT DEFAULT 0,
    order_placed BOOLEAN DEFAULT FALSE,
    order_id UUID NULL,
    
    -- Traffic source
    traffic_source ENUM('organic', 'direct', 'social', 'referral', 'paid', 'email', 'other') DEFAULT 'direct',
    referrer_url VARCHAR(500),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id),
    INDEX idx_session_start (session_start),
    INDEX idx_traffic_source (traffic_source),
    INDEX idx_device_type (device_type)
);

-- =============================================
-- 4. ADMIN DASHBOARD WIDGETS
-- =============================================

CREATE TABLE admin_dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    user_id UUID NOT NULL,
    widget_type VARCHAR(50) NOT NULL, -- sales_overview, recent_orders, top_products, etc.
    widget_config JSON, -- Widget configuration and settings
    position_x INT DEFAULT 0,
    position_y INT DEFAULT 0,
    width INT DEFAULT 4,
    height INT DEFAULT 3,
    is_visible BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_widget_type (widget_type)
);

-- =============================================
-- 5. SYSTEM SETTINGS
-- =============================================

CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json', 'text') DEFAULT 'string',
    category VARCHAR(50) NOT NULL, -- general, payment, shipping, email, etc.
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- Can be accessed by frontend
    is_editable BOOLEAN DEFAULT TRUE, -- Can be changed via admin panel
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_setting_key (setting_key),
    INDEX idx_category (category),
    INDEX idx_is_public (is_public)
);

-- =============================================
-- 6. NOTIFICATION SYSTEM
-- =============================================

CREATE TABLE admin_notifications (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    recipient_id UUID, -- NULL means notification for all admins
    sender_id UUID,
    
    -- Notification content
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('info', 'success', 'warning', 'error', 'order', 'review', 'system') DEFAULT 'info',
    
    -- Notification data
    entity_type VARCHAR(50), -- orders, products, users, etc.
    entity_id VARCHAR(100),
    action_url VARCHAR(500), -- URL to navigate when clicked
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    is_archived BOOLEAN DEFAULT FALSE,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    
    -- Auto-delete settings
    expires_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_recipient_id (recipient_id),
    INDEX idx_notification_type (notification_type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    INDEX idx_priority (priority)
);

-- =============================================
-- 7. INVENTORY ALERTS
-- =============================================

CREATE TABLE inventory_alerts (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    product_id UUID NOT NULL,
    alert_type ENUM('low_stock', 'out_of_stock', 'overstock', 'price_change') NOT NULL,
    current_stock INT,
    threshold_value INT,
    previous_value INT,
    
    -- Alert status
    is_active BOOLEAN DEFAULT TRUE,
    acknowledged_by UUID NULL,
    acknowledged_at TIMESTAMP NULL,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (acknowledged_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_product_id (product_id),
    INDEX idx_alert_type (alert_type),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
);

-- =============================================
-- 8. INSERT DEFAULT ADMIN DATA
-- =============================================

-- Insert default admin permissions
INSERT INTO admin_permissions (permission_name, description, category) VALUES
-- Product management
('product.create', 'Create new products', 'products'),
('product.read', 'View products', 'products'),
('product.update', 'Edit existing products', 'products'),
('product.delete', 'Delete products', 'products'),
('product.export', 'Export product data', 'products'),
('product.import', 'Import product data', 'products'),

-- Order management
('order.create', 'Create new orders', 'orders'),
('order.read', 'View orders', 'orders'),
('order.update', 'Update order status', 'orders'),
('order.delete', 'Cancel/delete orders', 'orders'),
('order.export', 'Export order data', 'orders'),
('order.refund', 'Process refunds', 'orders'),

-- User management
('user.create', 'Create new users', 'users'),
('user.read', 'View user profiles', 'users'),
('user.update', 'Edit user information', 'users'),
('user.delete', 'Delete user accounts', 'users'),
('user.impersonate', 'Login as another user', 'users'),

-- Analytics
('analytics.read', 'View analytics data', 'analytics'),
('analytics.export', 'Export analytics reports', 'analytics'),

-- Settings
('settings.read', 'View system settings', 'settings'),
('settings.update', 'Modify system settings', 'settings'),

-- Admin management
('admin.roles.manage', 'Manage admin roles', 'admin'),
('admin.permissions.manage', 'Manage permissions', 'admin'),
('admin.logs.read', 'View activity logs', 'admin');

-- Insert default admin roles
INSERT INTO admin_roles (role_name, description, is_system_role) VALUES
('Super Admin', 'Full system access with all permissions', TRUE),
('Admin', 'General admin access for most operations', TRUE),
('Product Manager', 'Manage products and inventory', TRUE),
('Order Manager', 'Manage orders and customer service', TRUE),
('Analytics Viewer', 'View reports and analytics only', TRUE),
('Content Manager', 'Manage website content and reviews', TRUE);

-- Get role IDs for permission assignments
SET @super_admin_role = (SELECT id FROM admin_roles WHERE role_name = 'Super Admin' LIMIT 1);
SET @admin_role = (SELECT id FROM admin_roles WHERE role_name = 'Admin' LIMIT 1);
SET @product_manager_role = (SELECT id FROM admin_roles WHERE role_name = 'Product Manager' LIMIT 1);
SET @order_manager_role = (SELECT id FROM admin_roles WHERE role_name = 'Order Manager' LIMIT 1);
SET @analytics_viewer_role = (SELECT id FROM admin_roles WHERE role_name = 'Analytics Viewer' LIMIT 1);

-- Assign all permissions to Super Admin
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT @super_admin_role, id FROM admin_permissions;

-- Assign selected permissions to other roles
-- Admin role (most permissions except user impersonation)
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT @admin_role, id FROM admin_permissions 
WHERE permission_name NOT IN ('user.impersonate', 'admin.roles.manage', 'admin.permissions.manage');

-- Product Manager permissions
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT @product_manager_role, id FROM admin_permissions 
WHERE category IN ('products', 'analytics') AND permission_name NOT LIKE '%.delete';

-- Order Manager permissions
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT @order_manager_role, id FROM admin_permissions 
WHERE category IN ('orders', 'users') AND permission_name NOT LIKE 'user.delete';

-- Analytics Viewer permissions
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT @analytics_viewer_role, id FROM admin_permissions 
WHERE permission_name LIKE 'analytics.%' OR permission_name LIKE '%.read';

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
('site_name', 'एहसास Jewelry', 'string', 'general', 'Site name displayed across the platform', TRUE),
('site_description', 'Exquisite handcrafted jewelry with premium materials', 'text', 'general', 'Site description for SEO', TRUE),
('default_currency', 'INR', 'string', 'general', 'Default currency for the store', TRUE),
('tax_rate', '18.00', 'number', 'general', 'Default tax rate percentage', FALSE),
('low_stock_threshold', '5', 'number', 'inventory', 'Default low stock alert threshold', FALSE),
('order_auto_cancel_hours', '24', 'number', 'orders', 'Hours after which unpaid orders are auto-cancelled', FALSE),
('enable_reviews', 'true', 'boolean', 'products', 'Allow customers to leave product reviews', TRUE),
('max_images_per_product', '10', 'number', 'products', 'Maximum images allowed per product', FALSE),
('admin_notification_email', 'admin@ehsaas.com', 'string', 'notifications', 'Email for admin notifications', FALSE),
('enable_inventory_alerts', 'true', 'boolean', 'inventory', 'Send alerts for inventory changes', FALSE);

-- =============================================
-- 9. STORED PROCEDURES FOR ADMIN OPERATIONS
-- =============================================

DELIMITER //

-- Procedure to create admin activity log
CREATE PROCEDURE LogAdminActivity(
    IN p_user_id UUID,
    IN p_action_type VARCHAR(20),
    IN p_entity_type VARCHAR(50),
    IN p_entity_id VARCHAR(100),
    IN p_description TEXT,
    IN p_old_values JSON,
    IN p_new_values JSON,
    IN p_ip_address VARCHAR(45),
    IN p_user_agent TEXT
)
BEGIN
    INSERT INTO admin_activity_logs (
        user_id, action_type, entity_type, entity_id, description,
        old_values, new_values, ip_address, user_agent
    ) VALUES (
        p_user_id, p_action_type, p_entity_type, p_entity_id, p_description,
        p_old_values, p_new_values, p_ip_address, p_user_agent
    );
END //

-- Procedure to update daily site analytics
CREATE PROCEDURE UpdateSiteAnalytics(
    IN p_date DATE,
    IN p_metric_name VARCHAR(50),
    IN p_metric_value INT
)
BEGIN
    INSERT INTO site_analytics (analytics_date, unique_visitors)
    VALUES (p_date, 0)
    ON DUPLICATE KEY UPDATE
        unique_visitors = CASE WHEN p_metric_name = 'unique_visitors' THEN p_metric_value ELSE unique_visitors END,
        total_page_views = CASE WHEN p_metric_name = 'total_page_views' THEN total_page_views + p_metric_value ELSE total_page_views END,
        new_visitors = CASE WHEN p_metric_name = 'new_visitors' THEN p_metric_value ELSE new_visitors END,
        returning_visitors = CASE WHEN p_metric_name = 'returning_visitors' THEN p_metric_value ELSE returning_visitors END,
        updated_at = CURRENT_TIMESTAMP;
END //

-- Procedure to check user permissions
CREATE FUNCTION CheckUserPermission(p_user_id UUID, p_permission_name VARCHAR(100))
RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE permission_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO permission_count
    FROM admin_user_roles aur
    JOIN admin_role_permissions arp ON aur.role_id = arp.role_id
    JOIN admin_permissions ap ON arp.permission_id = ap.id
    WHERE aur.user_id = p_user_id 
    AND ap.permission_name = p_permission_name
    AND aur.is_active = TRUE
    AND (aur.expires_at IS NULL OR aur.expires_at > NOW())
    AND ap.is_active = TRUE;
    
    RETURN permission_count > 0;
END //

DELIMITER ;

-- =============================================
-- 10. VIEWS FOR ADMIN DASHBOARD
-- =============================================

-- Admin users with roles view
CREATE VIEW admin_users_with_roles AS
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.last_login,
    u.account_status,
    GROUP_CONCAT(ar.role_name SEPARATOR ', ') as roles,
    MAX(aur.created_at) as role_assigned_at
FROM users u
JOIN admin_user_roles aur ON u.id = aur.user_id
JOIN admin_roles ar ON aur.role_id = ar.id
WHERE u.account_type IN ('admin', 'moderator')
AND aur.is_active = TRUE
GROUP BY u.id;

-- Dashboard summary view
CREATE VIEW dashboard_summary AS
SELECT
    (SELECT COUNT(*) FROM products WHERE status = 'published') as total_products,
    (SELECT COUNT(*) FROM products WHERE stock_status = 'out_of_stock') as out_of_stock_products,
    (SELECT COUNT(*) FROM orders WHERE created_at >= CURDATE()) as today_orders,
    (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
    (SELECT SUM(total_amount) FROM orders WHERE created_at >= CURDATE()) as today_revenue,
    (SELECT COUNT(*) FROM users WHERE created_at >= CURDATE()) as new_users_today,
    (SELECT COUNT(*) FROM product_reviews WHERE status = 'pending') as pending_reviews,
    (SELECT COUNT(*) FROM inventory_alerts WHERE is_active = TRUE) as active_alerts;

-- =============================================
-- 11. TRIGGERS FOR AUTOMATED ADMIN TASKS
-- =============================================

-- Trigger to create inventory alerts when stock is low
DELIMITER //

CREATE TRIGGER check_low_stock_after_update
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
    DECLARE threshold_val INT DEFAULT 5;
    
    -- Get the low stock threshold from settings
    SELECT CAST(setting_value AS UNSIGNED) INTO threshold_val
    FROM system_settings 
    WHERE setting_key = 'low_stock_threshold';
    
    -- Check if stock dropped to or below threshold
    IF NEW.stock_quantity <= threshold_val AND OLD.stock_quantity > threshold_val THEN
        INSERT INTO inventory_alerts (
            product_id, alert_type, current_stock, threshold_value
        ) VALUES (
            NEW.id, 'low_stock', NEW.stock_quantity, threshold_val
        );
    END IF;
    
    -- Check if stock went to zero
    IF NEW.stock_quantity = 0 AND OLD.stock_quantity > 0 THEN
        INSERT INTO inventory_alerts (
            product_id, alert_type, current_stock, threshold_value
        ) VALUES (
            NEW.id, 'out_of_stock', NEW.stock_quantity, 0
        );
    END IF;
END //

DELIMITER ;

-- =============================================
-- END OF ADMIN SQL EXTENSIONS
-- =============================================