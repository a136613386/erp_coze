CREATE TABLE order_t
(
    id          INT UNSIGNED AUTO_INCREMENT COMMENT '自增主键'
        PRIMARY KEY,
    customer_id INT UNSIGNED                             NULL COMMENT '关联客户ID',
    order_no    VARCHAR(50)                              NOT NULL COMMENT '订单号',
    deal_date   DATE                                     NOT NULL COMMENT '成交日期',
    amount      DECIMAL(10, 2)                           NOT NULL COMMENT '订单金额',
    status      ENUM ('已完成', '已发货', '待付款', '已付款', '已取消') NOT NULL COMMENT '订单状态',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP      NULL COMMENT '创建时间',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP      NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    CONSTRAINT idx_order_no
        UNIQUE (order_no)
)
    COMMENT '订单表';

CREATE INDEX idx_customer_id
    ON order_t (customer_id);

INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1, 1, 'ORD20260401001', '2026-04-01', 53000.00, '已完成', '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (2, 2, 'ORD20260406002', '2026-04-06', 14000.00, '已发货', '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (3, 1, 'ORD20260411003', '2026-04-11', 30000.00, '待付款', '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (4, 3, 'ORD20260415004', '2026-04-15', 40000.00, '已付款', '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (5, 4, 'ORD20260419005', '2026-04-19', 65000.00, '待付款', '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (6, 2, 'ORD20260422006', '2026-04-22', 7500.00, '已取消', '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1001, 1, 'ORD202605001', '2026-05-01', 15400.00, '待付款', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1002, 2, 'ORD202605002', '2026-04-30', 650.00, '已付款', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1003, 3, 'ORD202605003', '2026-04-29', 61200.00, '已发货', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1004, 4, 'ORD202605004', '2026-04-28', 10800.00, '已取消', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1005, 5, 'ORD202605005', '2026-04-27', 1200.00, '已完成', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1006, 1, 'ORD202605006', '2026-04-26', 84000.00, '待付款', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1007, 2, 'ORD202605007', '2026-04-25', 18600.00, '已付款', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1008, 3, 'ORD202605008', '2026-04-24', 5800.00, '已发货', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1009, 4, 'ORD202605009', '2026-04-23', 9300.00, '已取消', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1010, 5, 'ORD202605010', '2026-04-22', 15000.00, '已完成', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1011, 1, 'ORD202605011', '2026-04-21', 21800.00, '待付款', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1012, 2, 'ORD202605012', '2026-04-20', 550.00, '已付款', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1013, 3, 'ORD202605013', '2026-04-19', 80600.00, '已发货', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1014, 4, 'ORD202605014', '2026-04-18', 8400.00, '已取消', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1015, 5, 'ORD202605015', '2026-04-17', 2400.00, '已完成', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1016, 1, 'ORD202605016', '2026-04-16', 38500.00, '待付款', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1017, 2, 'ORD202605017', '2026-04-15', 8200.00, '已付款', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1018, 3, 'ORD202605018', '2026-04-14', 12400.00, '已发货', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1019, 4, 'ORD202605019', '2026-04-13', 18450.00, '已取消', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1020, 5, 'ORD202605020', '2026-04-12', 5000.00, '已完成', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1021, 1, 'ORD202605021', '2026-04-11', 13600.00, '待付款', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1022, 2, 'ORD202605022', '2026-04-10', 1050.00, '已付款', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1023, 3, 'ORD202605023', '2026-04-09', 36200.00, '已发货', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1024, 4, 'ORD202605024', '2026-04-08', 7800.00, '已取消', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1025, 5, 'ORD202605025', '2026-04-07', 2800.00, '已完成', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1026, 1, 'ORD202605026', '2026-04-06', 79500.00, '待付款', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1027, 2, 'ORD202605027', '2026-04-05', 16400.00, '已付款', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1028, 3, 'ORD202605028', '2026-04-04', 15800.00, '已发货', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1029, 4, 'ORD202605029', '2026-04-03', 9150.00, '已取消', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1030, 5, 'ORD202605030', '2026-04-02', 12200.00, '已完成', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1031, 1, 'ORD202605031', '2026-04-01', 25400.00, '待付款', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1032, 2, 'ORD202605032', '2026-03-31', 350.00, '已付款', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1033, 3, 'ORD202605033', '2026-03-30', 55600.00, '已发货', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1034, 4, 'ORD202605034', '2026-03-29', 14400.00, '已取消', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1035, 5, 'ORD202605035', '2026-03-28', 1600.00, '已完成', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1036, 1, 'ORD202605036', '2026-03-27', 34000.00, '待付款', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1037, 2, 'ORD202605037', '2026-03-26', 12600.00, '已付款', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1038, 3, 'ORD202605038', '2026-03-25', 7400.00, '已发货', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1039, 4, 'ORD202605039', '2026-03-24', 18300.00, '已取消', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1040, 5, 'ORD202605040', '2026-03-23', 10600.00, '已完成', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1041, 1, 'ORD202605041', '2026-03-22', 11800.00, '待付款', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1042, 2, 'ORD202605042', '2026-03-21', 850.00, '已付款', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1043, 3, 'ORD202605043', '2026-03-20', 86200.00, '已发货', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1044, 4, 'ORD202605044', '2026-03-19', 4800.00, '已取消', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1045, 5, 'ORD202605045', '2026-03-18', 2000.00, '已完成', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1046, 1, 'ORD202605046', '2026-03-17', 88500.00, '待付款', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1047, 2, 'ORD202605047', '2026-03-16', 14200.00, '已付款', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1048, 3, 'ORD202605048', '2026-03-15', 10800.00, '已发货', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1049, 4, 'ORD202605049', '2026-03-14', 9450.00, '已取消', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1050, 5, 'ORD202605050', '2026-03-13', 9400.00, '已完成', '2026-05-02 22:59:35', '2026-05-02 22:59:35');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1051, 1, 'ORD202605101', '2026-05-02', 10400.00, '已付款', '2026-05-02 23:49:28', '2026-05-02 23:49:28');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1052, 2, 'ORD202605102', '2026-05-03', 4200.00, '已发货', '2026-05-02 23:49:28', '2026-05-02 23:49:28');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1053, 3, 'ORD202605103', '2026-05-04', 27400.00, '已完成', '2026-05-02 23:49:28', '2026-05-02 23:49:28');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1054, 4, 'ORD202605104', '2026-05-05', 4800.00, '待付款', '2026-05-02 23:49:28', '2026-05-02 23:49:28');
INSERT INTO erp_local.order_t (id, customer_id, order_no, deal_date, amount, status, create_time, update_time) VALUES (1055, 5, 'ORD202605105', '2026-05-06', 11200.00, '已付款', '2026-05-02 23:49:28', '2026-05-02 23:49:28');