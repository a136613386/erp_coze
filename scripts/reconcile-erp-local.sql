USE erp_local;

SET NAMES utf8mb4;

DELETE FROM finance_t WHERE order_id BETWEEN 1051 AND 1055;
DELETE FROM stock_record_t WHERE order_id BETWEEN 1051 AND 1055;
DELETE FROM order_item_t WHERE order_id BETWEEN 1051 AND 1055;
DELETE FROM order_t WHERE id BETWEEN 1051 AND 1055;

INSERT INTO order_t (`id`, `customer_id`, `order_no`, `deal_date`, `amount`, `status`)
VALUES
  (1051, 1, 'ORD202605101', '2026-05-02', 10400.00, '已付款'),
  (1052, 2, 'ORD202605102', '2026-05-03',  4200.00, '已发货'),
  (1053, 3, 'ORD202605103', '2026-05-04', 27400.00, '已完成'),
  (1054, 4, 'ORD202605104', '2026-05-05',  4800.00, '待付款'),
  (1055, 5, 'ORD202605105', '2026-05-06', 11200.00, '已付款');

INSERT INTO order_item_t (`id`, `order_id`, `product_id`, `quantity`, `unit_price`, `subtotal`)
VALUES
  (12001, 1051, 1, 2, 5000.00, 10000.00),
  (12002, 1051, 5, 2,  200.00,   400.00),
  (12003, 1052, 4, 2, 1800.00,  3600.00),
  (12004, 1052, 2, 4,  150.00,   600.00),
  (12005, 1053, 6, 1, 25000.00, 25000.00),
  (12006, 1053, 8, 3,   800.00,  2400.00),
  (12007, 1054, 9, 1,  4500.00,  4500.00),
  (12008, 1054, 2, 2,   150.00,   300.00),
  (12009, 1055, 7, 3,  3000.00,  9000.00),
  (12010, 1055, 10, 1, 2200.00,  2200.00);

INSERT INTO finance_t (
  `id`,
  `customer_id`,
  `order_id`,
  `finance_date`,
  `type`,
  `counterparty`,
  `amount`,
  `payment_method`,
  `status`,
  `remark`
)
SELECT
  7000 + ROW_NUMBER() OVER (ORDER BY o.id) AS id,
  o.customer_id,
  o.id AS order_id,
  o.deal_date AS finance_date,
  '收款' AS type,
  COALESCE(c.company_name, CONCAT('客户', o.customer_id)) AS counterparty,
  o.amount,
  CASE
    WHEN o.status IN ('已付款', '已发货') THEN '微信'
    ELSE '银行转账'
  END AS payment_method,
  CASE
    WHEN o.status IN ('已付款', '已发货', '已完成') THEN '已确认'
    ELSE '待确认'
  END AS status,
  CONCAT('订单回款 - ', o.order_no) AS remark
FROM order_t o
LEFT JOIN customer_t c ON c.id = o.customer_id
LEFT JOIN finance_t f ON f.order_id = o.id
WHERE f.id IS NULL;

INSERT INTO stock_record_t (
  `id`,
  `product_id`,
  `order_id`,
  `type`,
  `quantity`,
  `operator_name`,
  `remark`
)
SELECT
  20000 + ROW_NUMBER() OVER (ORDER BY oi.order_id, oi.id) AS id,
  oi.product_id,
  oi.order_id,
  '出库' AS type,
  oi.quantity,
  '系统补录' AS operator_name,
  CASE
    WHEN o.status = '已取消' THEN CONCAT('订单取消前出库补录 - ', o.order_no)
    ELSE CONCAT('订单出库补录 - ', o.order_no)
  END AS remark
FROM order_item_t oi
INNER JOIN order_t o ON o.id = oi.order_id
LEFT JOIN stock_record_t sr
  ON sr.order_id = oi.order_id
 AND sr.product_id = oi.product_id
 AND sr.quantity = oi.quantity
 AND sr.type = '出库'
WHERE sr.id IS NULL;

UPDATE inventory_t
SET status = CASE
  WHEN current_stock < safe_stock THEN '库存不足'
  ELSE '正常'
END;
