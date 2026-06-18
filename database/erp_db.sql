-- =============================================
-- ERP 最小可用版表结构
-- 数据库：erp_db
-- 目标：满足当前导航中的经营概览、客户管理、订单管理、库存管理、财务管理
-- =============================================

-- =============================================
-- 1. 客户表
-- =============================================
CREATE TABLE IF NOT EXISTS customer_t (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增主键',
    `customer_name` VARCHAR(100) NOT NULL COMMENT '客户名称',
    `company_name` VARCHAR(200) NOT NULL COMMENT '公司名称',
    `phone` VARCHAR(20) NOT NULL COMMENT '联系电话',
    `level` ENUM('vip', '普通', '新客户') NOT NULL COMMENT '客户等级',
    `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户表';

-- =============================================
-- 2. 订单表
-- 说明：按你的要求，仅保留 customer_id 作为客户关联字段
-- =============================================
CREATE TABLE IF NOT EXISTS order_t (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增主键',
    `customer_id` INT UNSIGNED NULL COMMENT '关联客户ID',
    `order_no` VARCHAR(50) NOT NULL COMMENT '订单号',
    `deal_date` DATE NOT NULL COMMENT '成交日期',
    `amount` DECIMAL(10,2) NOT NULL COMMENT '订单金额',
    `status` ENUM('已完成', '已发货', '待付款', '已付款', '已取消') NOT NULL COMMENT '订单状态',
    `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE INDEX idx_order_no (`order_no`),
    INDEX idx_customer_id (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- =============================================
-- 3. 订单明细表
-- 说明：支持一个订单包含多个商品
-- =============================================
CREATE TABLE IF NOT EXISTS order_item_t (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增主键',
    `order_id` INT UNSIGNED NOT NULL COMMENT '关联订单ID',
    `product_id` INT UNSIGNED NOT NULL COMMENT '关联商品ID',
    `quantity` INT NOT NULL COMMENT '数量',
    `unit_price` DECIMAL(10,2) NOT NULL COMMENT '成交单价',
    `subtotal` DECIMAL(10,2) NOT NULL COMMENT '小计',
    `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX idx_order_id (`order_id`),
    INDEX idx_product_id (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单明细表';

-- =============================================
-- 4. 库存表
-- 说明：补 unit，满足库存页展示；补 category/cost，便于后续扩展
-- =============================================
CREATE TABLE IF NOT EXISTS inventory_t (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增主键',
    `product_code` VARCHAR(50) NOT NULL COMMENT '商品编码',
    `product_name` VARCHAR(200) NOT NULL COMMENT '商品名称',
    `category` VARCHAR(100) NULL COMMENT '商品分类',
    `unit` VARCHAR(20) NOT NULL DEFAULT '件' COMMENT '计量单位',
    `current_stock` INT NOT NULL DEFAULT 0 COMMENT '当前库存',
    `safe_stock` INT NOT NULL DEFAULT 0 COMMENT '安全库存',
    `unit_price` DECIMAL(10,2) NOT NULL COMMENT '销售单价',
    `cost` DECIMAL(10,2) NULL COMMENT '成本价',
    `status` ENUM('正常', '库存不足') NOT NULL COMMENT '库存状态',
    `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE INDEX idx_product_code (`product_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库存表';

-- =============================================
-- 5. 库存流水表
-- 说明：支持入库、出库、订单出库追溯
-- =============================================
CREATE TABLE IF NOT EXISTS stock_record_t (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增主键',
    `product_id` INT UNSIGNED NOT NULL COMMENT '关联商品ID',
    `order_id` INT UNSIGNED NULL COMMENT '关联订单ID',
    `type` ENUM('入库', '出库') NOT NULL COMMENT '出入库类型',
    `quantity` INT NOT NULL COMMENT '数量',
    `operator_name` VARCHAR(100) NOT NULL COMMENT '操作人',
    `remark` VARCHAR(255) NULL COMMENT '备注',
    `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX idx_product_id (`product_id`),
    INDEX idx_order_id (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库存流水表';

-- =============================================
-- 6. 财务表
-- 说明：最小可用版补 customer_id、order_id，满足收款和订单关联
-- =============================================
CREATE TABLE IF NOT EXISTS finance_t (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增主键',
    `customer_id` INT UNSIGNED NULL COMMENT '关联客户ID',
    `order_id` INT UNSIGNED NULL COMMENT '关联订单ID',
    `finance_date` DATE NOT NULL COMMENT '财务日期',
    `type` ENUM('收款', '付款') NOT NULL COMMENT '收支类型',
    `counterparty` VARCHAR(200) NOT NULL COMMENT '交易对方',
    `amount` DECIMAL(10,2) NOT NULL COMMENT '交易金额',
    `payment_method` ENUM('银行转账', '微信') NOT NULL COMMENT '支付方式',
    `status` ENUM('已确认', '待确认') NOT NULL COMMENT '财务状态',
    `remark` VARCHAR(255) NULL COMMENT '备注',
    `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX idx_customer_id (`customer_id`),
    INDEX idx_order_id (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='财务表';
