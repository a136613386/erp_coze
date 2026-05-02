CREATE TABLE inventory_t
(
    id            INT UNSIGNED AUTO_INCREMENT COMMENT '自增主键'
        PRIMARY KEY,
    product_code  VARCHAR(50)                           NOT NULL COMMENT '商品编码',
    product_name  VARCHAR(200)                          NOT NULL COMMENT '商品名称',
    category      VARCHAR(100)                          NULL COMMENT '商品分类',
    unit          VARCHAR(20) DEFAULT 'pcs'             NOT NULL COMMENT '计量单位',
    current_stock INT         DEFAULT 0                 NOT NULL COMMENT '当前库存',
    safe_stock    INT         DEFAULT 0                 NOT NULL COMMENT '安全库存',
    unit_price    DECIMAL(10, 2)                        NOT NULL COMMENT '销售单价',
    cost          DECIMAL(10, 2)                        NULL COMMENT '成本价',
    status        ENUM ('正常', '库存不足')                   NOT NULL COMMENT '库存状态',
    create_time   TIMESTAMP   DEFAULT CURRENT_TIMESTAMP NULL COMMENT '创建时间',
    update_time   TIMESTAMP   DEFAULT CURRENT_TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    CONSTRAINT idx_product_code
        UNIQUE (product_code)
)
    COMMENT '库存表';

INSERT INTO erp_local.inventory_t (id, product_code, product_name, category, unit, current_stock, safe_stock, unit_price, cost, status, create_time, update_time) VALUES (1, 'IT001', '笔记本电脑', '办公设备', '台', 25, 10, 5000.00, 4200.00, '正常', '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.inventory_t (id, product_code, product_name, category, unit, current_stock, safe_stock, unit_price, cost, status, create_time, update_time) VALUES (2, 'IT002', '无线鼠标', '办公外设', '个', 80, 30, 150.00, 90.00, '正常', '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.inventory_t (id, product_code, product_name, category, unit, current_stock, safe_stock, unit_price, cost, status, create_time, update_time) VALUES (3, 'IT003', '激光打印机', '办公设备', '台', 12, 5, 2800.00, 2300.00, '正常', '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.inventory_t (id, product_code, product_name, category, unit, current_stock, safe_stock, unit_price, cost, status, create_time, update_time) VALUES (4, 'IT004', '显示器', '显示设备', '台', 8, 10, 1800.00, 1450.00, '库存不足', '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.inventory_t (id, product_code, product_name, category, unit, current_stock, safe_stock, unit_price, cost, status, create_time, update_time) VALUES (5, 'IT005', '键盘', '办公外设', '个', 45, 20, 200.00, 120.00, '正常', '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.inventory_t (id, product_code, product_name, category, unit, current_stock, safe_stock, unit_price, cost, status, create_time, update_time) VALUES (6, 'IT006', '服务器', '服务器', '台', 5, 2, 25000.00, 21000.00, '正常', '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.inventory_t (id, product_code, product_name, category, unit, current_stock, safe_stock, unit_price, cost, status, create_time, update_time) VALUES (7, 'IT007', '网络交换机', '网络设备', '台', 15, 5, 3000.00, 2400.00, '正常', '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.inventory_t (id, product_code, product_name, category, unit, current_stock, safe_stock, unit_price, cost, status, create_time, update_time) VALUES (8, 'IT008', '固态硬盘', '存储设备', '个', 3, 15, 800.00, 620.00, '库存不足', '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.inventory_t (id, product_code, product_name, category, unit, current_stock, safe_stock, unit_price, cost, status, create_time, update_time) VALUES (9, 'IT009', '投影仪', '会议设备', '台', 6, 3, 4500.00, 3600.00, '正常', '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.inventory_t (id, product_code, product_name, category, unit, current_stock, safe_stock, unit_price, cost, status, create_time, update_time) VALUES (10, 'IT010', 'UPS电源', '机房设备', '台', 10, 4, 2200.00, 1850.00, '正常', '2026-04-29 17:03:08', '2026-04-29 17:03:08');