CREATE TABLE order_item_t
(
    id          INT UNSIGNED AUTO_INCREMENT COMMENT '自增主键'
        PRIMARY KEY,
    order_id    INT UNSIGNED                        NOT NULL COMMENT '关联订单ID',
    product_id  INT UNSIGNED                        NOT NULL COMMENT '关联商品ID',
    quantity    INT                                 NOT NULL COMMENT '数量',
    unit_price  DECIMAL(10, 2)                      NOT NULL COMMENT '成交单价',
    subtotal    DECIMAL(10, 2)                      NOT NULL COMMENT '小计',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL COMMENT '创建时间',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
)
    COMMENT '订单明细表';

CREATE INDEX idx_order_id
    ON order_item_t (order_id);

CREATE INDEX idx_product_id
    ON order_item_t (product_id);

INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (1, 1, 1, 10, 5000.00, 50000.00, '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (2, 1, 2, 20, 150.00, 3000.00, '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (3, 2, 3, 5, 2800.00, 14000.00, '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (4, 3, 4, 10, 1800.00, 18000.00, '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (5, 3, 8, 15, 800.00, 12000.00, '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (6, 4, 6, 1, 25000.00, 25000.00, '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (7, 4, 7, 5, 3000.00, 15000.00, '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (8, 5, 9, 10, 4500.00, 45000.00, '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (9, 5, 10, 10, 2000.00, 20000.00, '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10, 6, 5, 25, 300.00, 7500.00, '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10001, 1001, 1, 2, 5000.00, 10000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10002, 1001, 4, 3, 1800.00, 5400.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10003, 1002, 2, 3, 150.00, 450.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10004, 1002, 5, 1, 200.00, 200.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10005, 1003, 3, 4, 2800.00, 11200.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10006, 1003, 6, 2, 25000.00, 50000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10007, 1004, 4, 1, 1800.00, 1800.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10008, 1004, 7, 3, 3000.00, 9000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10009, 1005, 5, 2, 200.00, 400.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10010, 1005, 8, 1, 800.00, 800.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10011, 1006, 6, 3, 25000.00, 75000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10012, 1006, 9, 2, 4500.00, 9000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10013, 1007, 7, 4, 3000.00, 12000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10014, 1007, 10, 3, 2200.00, 6600.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10015, 1008, 8, 1, 800.00, 800.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10016, 1008, 1, 1, 5000.00, 5000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10017, 1009, 9, 2, 4500.00, 9000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10018, 1009, 2, 2, 150.00, 300.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10019, 1010, 10, 3, 2200.00, 6600.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10020, 1010, 3, 3, 2800.00, 8400.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10021, 1011, 1, 4, 5000.00, 20000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10022, 1011, 4, 1, 1800.00, 1800.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10023, 1012, 2, 1, 150.00, 150.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10024, 1012, 5, 2, 200.00, 400.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10025, 1013, 3, 2, 2800.00, 5600.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10026, 1013, 6, 3, 25000.00, 75000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10027, 1014, 4, 3, 1800.00, 5400.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10028, 1014, 7, 1, 3000.00, 3000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10029, 1015, 5, 4, 200.00, 800.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10030, 1015, 8, 2, 800.00, 1600.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10031, 1016, 6, 1, 25000.00, 25000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10032, 1016, 9, 3, 4500.00, 13500.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10033, 1017, 7, 2, 3000.00, 6000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10034, 1017, 10, 1, 2200.00, 2200.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10035, 1018, 8, 3, 800.00, 2400.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10036, 1018, 1, 2, 5000.00, 10000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10037, 1019, 9, 4, 4500.00, 18000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10038, 1019, 2, 3, 150.00, 450.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10039, 1020, 10, 1, 2200.00, 2200.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10040, 1020, 3, 1, 2800.00, 2800.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10041, 1021, 1, 2, 5000.00, 10000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10042, 1021, 4, 2, 1800.00, 3600.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10043, 1022, 2, 3, 150.00, 450.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10044, 1022, 5, 3, 200.00, 600.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10045, 1023, 3, 4, 2800.00, 11200.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10046, 1023, 6, 1, 25000.00, 25000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10047, 1024, 4, 1, 1800.00, 1800.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10048, 1024, 7, 2, 3000.00, 6000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10049, 1025, 5, 2, 200.00, 400.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10050, 1025, 8, 3, 800.00, 2400.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10051, 1026, 6, 3, 25000.00, 75000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10052, 1026, 9, 1, 4500.00, 4500.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10053, 1027, 7, 4, 3000.00, 12000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10054, 1027, 10, 2, 2200.00, 4400.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10055, 1028, 8, 1, 800.00, 800.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10056, 1028, 1, 3, 5000.00, 15000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10057, 1029, 9, 2, 4500.00, 9000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10058, 1029, 2, 1, 150.00, 150.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10059, 1030, 10, 3, 2200.00, 6600.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10060, 1030, 3, 2, 2800.00, 5600.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10061, 1031, 1, 4, 5000.00, 20000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10062, 1031, 4, 3, 1800.00, 5400.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10063, 1032, 2, 1, 150.00, 150.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10064, 1032, 5, 1, 200.00, 200.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10065, 1033, 3, 2, 2800.00, 5600.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10066, 1033, 6, 2, 25000.00, 50000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10067, 1034, 4, 3, 1800.00, 5400.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10068, 1034, 7, 3, 3000.00, 9000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10069, 1035, 5, 4, 200.00, 800.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10070, 1035, 8, 1, 800.00, 800.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10071, 1036, 6, 1, 25000.00, 25000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10072, 1036, 9, 2, 4500.00, 9000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10073, 1037, 7, 2, 3000.00, 6000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10074, 1037, 10, 3, 2200.00, 6600.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10075, 1038, 8, 3, 800.00, 2400.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10076, 1038, 1, 1, 5000.00, 5000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10077, 1039, 9, 4, 4500.00, 18000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10078, 1039, 2, 2, 150.00, 300.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10079, 1040, 10, 1, 2200.00, 2200.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10080, 1040, 3, 3, 2800.00, 8400.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10081, 1041, 1, 2, 5000.00, 10000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10082, 1041, 4, 1, 1800.00, 1800.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10083, 1042, 2, 3, 150.00, 450.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10084, 1042, 5, 2, 200.00, 400.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10085, 1043, 3, 4, 2800.00, 11200.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10086, 1043, 6, 3, 25000.00, 75000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10087, 1044, 4, 1, 1800.00, 1800.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10088, 1044, 7, 1, 3000.00, 3000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10089, 1045, 5, 2, 200.00, 400.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10090, 1045, 8, 2, 800.00, 1600.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10091, 1046, 6, 3, 25000.00, 75000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10092, 1046, 9, 3, 4500.00, 13500.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10093, 1047, 7, 4, 3000.00, 12000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10094, 1047, 10, 1, 2200.00, 2200.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10095, 1048, 8, 1, 800.00, 800.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10096, 1048, 1, 2, 5000.00, 10000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10097, 1049, 9, 2, 4500.00, 9000.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10098, 1049, 2, 3, 150.00, 450.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10099, 1050, 10, 3, 2200.00, 6600.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (10100, 1050, 3, 1, 2800.00, 2800.00, '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (12001, 1051, 1, 2, 5000.00, 10000.00, '2026-05-02 23:49:28', '2026-05-02 23:49:28');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (12002, 1051, 5, 2, 200.00, 400.00, '2026-05-02 23:49:28', '2026-05-02 23:49:28');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (12003, 1052, 4, 2, 1800.00, 3600.00, '2026-05-02 23:49:28', '2026-05-02 23:49:28');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (12004, 1052, 2, 4, 150.00, 600.00, '2026-05-02 23:49:28', '2026-05-02 23:49:28');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (12005, 1053, 6, 1, 25000.00, 25000.00, '2026-05-02 23:49:28', '2026-05-02 23:49:28');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (12006, 1053, 8, 3, 800.00, 2400.00, '2026-05-02 23:49:28', '2026-05-02 23:49:28');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (12007, 1054, 9, 1, 4500.00, 4500.00, '2026-05-02 23:49:28', '2026-05-02 23:49:28');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (12008, 1054, 2, 2, 150.00, 300.00, '2026-05-02 23:49:28', '2026-05-02 23:49:28');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (12009, 1055, 7, 3, 3000.00, 9000.00, '2026-05-02 23:49:28', '2026-05-02 23:49:28');
INSERT INTO erp_local.order_item_t (id, order_id, product_id, quantity, unit_price, subtotal, create_time, update_time) VALUES (12010, 1055, 10, 1, 2200.00, 2200.00, '2026-05-02 23:49:28', '2026-05-02 23:49:28');