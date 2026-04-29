-- =============================================
-- 1. 创建ERP数据库（指定字符集和排序规则）
-- =============================================
CREATE DATABASE IF NOT EXISTS erp_db 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 切换到erp_db数据库
USE erp_db;

-- =============================================
-- 2. 创建客户管理表（customer_t）
-- =============================================
CREATE TABLE IF NOT EXISTS customer_t (
    `customer_name` VARCHAR(100) NOT NULL COMMENT '客户名称',
    `company_name` VARCHAR(200) NOT NULL COMMENT '公司名称',
    `phone` VARCHAR(20) NOT NULL COMMENT '电话',
    `level` ENUM('vip','普通','新客户') NOT NULL COMMENT '客户等级',
    `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    -- 主键（无天然唯一字段，新增自增主键）
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户管理表';

-- =============================================
-- 3. 创建订单表（order_t）
-- =============================================
CREATE TABLE IF NOT EXISTS order_t (
    `order_no` VARCHAR(50) NOT NULL COMMENT '订单号',
    `deal_date` DATE NOT NULL COMMENT '成交日期',
    `amount` DECIMAL(10,2) NOT NULL COMMENT '订单金额',
    `status` ENUM('已完成','已发货','待付款','已付款','已取消') NOT NULL COMMENT '订单状态',
    `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    -- 主键（订单号天然唯一）
    PRIMARY KEY (`order_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- =============================================
-- 4. 创建库存表（inventory_t）
-- =============================================
CREATE TABLE IF NOT EXISTS inventory_t (
    `product_code` VARCHAR(50) NOT NULL COMMENT '产品编码',
    `product_name` VARCHAR(200) NOT NULL COMMENT '产品名称',
    `current_stock` INT NOT NULL DEFAULT 0 COMMENT '当前库存',
    `safe_stock` INT NOT NULL DEFAULT 0 COMMENT '安全库存',
    `unit_price` DECIMAL(10,2) NOT NULL COMMENT '产品单价',
    `status` ENUM('正常','库存不足') NOT NULL COMMENT '库存状态',
    `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    -- 主键（产品编码天然唯一）
    PRIMARY KEY (`product_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库存表';

-- =============================================
-- 5. 创建财务表（finance_t）
-- =============================================
CREATE TABLE IF NOT EXISTS finance_t (
    `finance_date` DATE NOT NULL COMMENT '财务日期',
    `type` ENUM('收款','付款') NOT NULL COMMENT '收支类型',
    `counterparty` VARCHAR(200) NOT NULL COMMENT '交易对方',
    `amount` DECIMAL(10,2) NOT NULL COMMENT '交易金额（保留2位小数）',
    `payment_method` ENUM('银行转账','微信') NOT NULL COMMENT '支付方式',
    `status` ENUM('已确认','待确认') NOT NULL COMMENT '财务状态',
    `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    -- 主键（无天然唯一字段，新增自增主键）
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='财务表';