-- =============================================
USE erp_local;

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
    `unit` VARCHAR(20) NOT NULL DEFAULT 'pcs' COMMENT '计量单位',
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

-- =============================================
-- 7. 测试数据
-- 说明：用于经营概览、客户列表、订单列表、本月销售额等页面联调
-- =============================================
INSERT INTO customer_t (`id`, `customer_name`, `company_name`, `phone`, `level`)
VALUES
    (1, '张三', '北京科技有限公司', '13800138001', 'vip'),
    (2, '李四', '上海贸易集团', '13800138002', '普通'),
    (3, '王五', '广州制造业公司', '13800138003', '新客户'),
    (4, '赵六', '深圳电子科技', '13800138004', 'vip'),
    (5, '孙七', '成都软件园', '13800138005', '普通')
ON DUPLICATE KEY UPDATE
    `customer_name` = VALUES(`customer_name`),
    `company_name` = VALUES(`company_name`),
    `phone` = VALUES(`phone`),
    `level` = VALUES(`level`);

INSERT INTO inventory_t (`id`, `product_code`, `product_name`, `category`, `unit`, `current_stock`, `safe_stock`, `unit_price`, `cost`, `status`)
VALUES
    (1, 'IT001', '笔记本电脑', '办公设备', '台', 25, 10, 5000.00, 4200.00, '正常'),
    (2, 'IT002', '无线鼠标', '办公外设', '个', 80, 30, 150.00, 90.00, '正常'),
    (3, 'IT003', '激光打印机', '办公设备', '台', 12, 5, 2800.00, 2300.00, '正常'),
    (4, 'IT004', '显示器', '显示设备', '台', 8, 10, 1800.00, 1450.00, '库存不足'),
    (5, 'IT005', '键盘', '办公外设', '个', 45, 20, 200.00, 120.00, '正常'),
    (6, 'IT006', '服务器', '服务器', '台', 5, 2, 25000.00, 21000.00, '正常'),
    (7, 'IT007', '网络交换机', '网络设备', '台', 15, 5, 3000.00, 2400.00, '正常'),
    (8, 'IT008', '固态硬盘', '存储设备', '个', 3, 15, 800.00, 620.00, '库存不足'),
    (9, 'IT009', '投影仪', '会议设备', '台', 6, 3, 4500.00, 3600.00, '正常'),
    (10, 'IT010', 'UPS电源', '机房设备', '台', 10, 4, 2200.00, 1850.00, '正常')
ON DUPLICATE KEY UPDATE
    `product_name` = VALUES(`product_name`),
    `category` = VALUES(`category`),
    `unit` = VALUES(`unit`),
    `current_stock` = VALUES(`current_stock`),
    `safe_stock` = VALUES(`safe_stock`),
    `unit_price` = VALUES(`unit_price`),
    `cost` = VALUES(`cost`),
    `status` = VALUES(`status`);

INSERT INTO order_t (`id`, `customer_id`, `order_no`, `deal_date`, `amount`, `status`)
VALUES
    (1, 1, 'ORD20260401001', DATE_SUB(CURDATE(), INTERVAL 28 DAY), 53000.00, '已完成'),
    (2, 2, 'ORD20260406002', DATE_SUB(CURDATE(), INTERVAL 23 DAY), 14000.00, '已发货'),
    (3, 1, 'ORD20260411003', DATE_SUB(CURDATE(), INTERVAL 18 DAY), 30000.00, '待付款'),
    (4, 3, 'ORD20260415004', DATE_SUB(CURDATE(), INTERVAL 14 DAY), 40000.00, '已付款'),
    (5, 4, 'ORD20260419005', DATE_SUB(CURDATE(), INTERVAL 10 DAY), 65000.00, '待付款'),
    (6, 2, 'ORD20260422006', DATE_SUB(CURDATE(), INTERVAL 7 DAY), 7500.00, '已取消')
ON DUPLICATE KEY UPDATE
    `customer_id` = VALUES(`customer_id`),
    `deal_date` = VALUES(`deal_date`),
    `amount` = VALUES(`amount`),
    `status` = VALUES(`status`);

INSERT INTO order_item_t (`id`, `order_id`, `product_id`, `quantity`, `unit_price`, `subtotal`)
VALUES
    (1, 1, 1, 10, 5000.00, 50000.00),
    (2, 1, 2, 20, 150.00, 3000.00),
    (3, 2, 3, 5, 2800.00, 14000.00),
    (4, 3, 4, 10, 1800.00, 18000.00),
    (5, 3, 8, 15, 800.00, 12000.00),
    (6, 4, 6, 1, 25000.00, 25000.00),
    (7, 4, 7, 5, 3000.00, 15000.00),
    (8, 5, 9, 10, 4500.00, 45000.00),
    (9, 5, 10, 10, 2000.00, 20000.00),
    (10, 6, 5, 25, 300.00, 7500.00)
ON DUPLICATE KEY UPDATE
    `order_id` = VALUES(`order_id`),
    `product_id` = VALUES(`product_id`),
    `quantity` = VALUES(`quantity`),
    `unit_price` = VALUES(`unit_price`),
    `subtotal` = VALUES(`subtotal`);

INSERT INTO stock_record_t (`id`, `product_id`, `order_id`, `type`, `quantity`, `operator_name`, `remark`)
VALUES
    (1, 1, 1, '出库', 10, '管理员', '订单出库'),
    (2, 2, 1, '出库', 20, '管理员', '订单出库'),
    (3, 3, 2, '出库', 5, '管理员', '订单出库'),
    (4, 4, 3, '出库', 10, '管理员', '订单出库'),
    (5, 8, 3, '出库', 15, '管理员', '订单出库'),
    (6, 6, 4, '出库', 1, '管理员', '订单出库'),
    (7, 7, 4, '出库', 5, '管理员', '订单出库'),
    (8, 9, 5, '出库', 10, '管理员', '订单出库'),
    (9, 10, 5, '出库', 10, '管理员', '订单出库'),
    (10, 5, 6, '出库', 25, '管理员', '订单取消前出库记录')
ON DUPLICATE KEY UPDATE
    `product_id` = VALUES(`product_id`),
    `order_id` = VALUES(`order_id`),
    `type` = VALUES(`type`),
    `quantity` = VALUES(`quantity`),
    `operator_name` = VALUES(`operator_name`),
    `remark` = VALUES(`remark`);

INSERT INTO finance_t (`id`, `customer_id`, `order_id`, `finance_date`, `type`, `counterparty`, `amount`, `payment_method`, `status`, `remark`)
VALUES
    (1, 1, 1, DATE_SUB(CURDATE(), INTERVAL 27 DAY), '收款', '北京科技有限公司', 53000.00, '银行转账', '已确认', '订单回款'),
    (2, 2, 2, DATE_SUB(CURDATE(), INTERVAL 22 DAY), '收款', '上海贸易集团', 14000.00, '微信', '已确认', '订单回款'),
    (3, 3, 4, DATE_SUB(CURDATE(), INTERVAL 13 DAY), '收款', '广州制造业公司', 40000.00, '银行转账', '已确认', '订单回款'),
    (4, 4, 5, DATE_SUB(CURDATE(), INTERVAL 9 DAY), '收款', '深圳电子科技', 65000.00, '银行转账', '待确认', '待确认回款'),
    (5, NULL, NULL, DATE_SUB(CURDATE(), INTERVAL 25 DAY), '付款', '联想科技', 126000.00, '银行转账', '已确认', '采购付款'),
    (6, NULL, NULL, DATE_SUB(CURDATE(), INTERVAL 24 DAY), '付款', '戴尔中国', 11000.00, '银行转账', '已确认', '采购付款')
ON DUPLICATE KEY UPDATE
    `customer_id` = VALUES(`customer_id`),
    `order_id` = VALUES(`order_id`),
    `finance_date` = VALUES(`finance_date`),
    `type` = VALUES(`type`),
    `counterparty` = VALUES(`counterparty`),
    `amount` = VALUES(`amount`),
    `payment_method` = VALUES(`payment_method`),
    `status` = VALUES(`status`),
    `remark` = VALUES(`remark`);
