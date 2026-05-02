USE erp_local;

SET NAMES utf8mb4;

DELETE FROM order_item_t WHERE order_id BETWEEN 1001 AND 1050;
DELETE FROM order_t WHERE id BETWEEN 1001 AND 1050;

INSERT INTO order_t (`id`, `customer_id`, `order_no`, `deal_date`, `amount`, `status`)
WITH RECURSIVE seq AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM seq WHERE n < 50
)
SELECT
  1000 + n AS id,
  ((n - 1) % 5) + 1 AS customer_id,
  CONCAT('ORD202605', LPAD(n, 3, '0')) AS order_no,
  DATE_SUB(CURDATE(), INTERVAL n DAY) AS deal_date,
  (
    ((n % 4) + 1) * p1.unit_price +
    (((n + 1) % 3) + 1) * p2.unit_price
  ) AS amount,
  CASE n % 5
    WHEN 0 THEN CONVERT(0xE5B7B2E5AE8CE68890 USING utf8mb4)
    WHEN 1 THEN CONVERT(0xE5BE85E4BB98E6ACBE USING utf8mb4)
    WHEN 2 THEN CONVERT(0xE5B7B2E4BB98E6ACBE USING utf8mb4)
    WHEN 3 THEN CONVERT(0xE5B7B2E58F91E8B4A7 USING utf8mb4)
    ELSE CONVERT(0xE5B7B2E58F96E6B688 USING utf8mb4)
  END AS status
FROM seq
JOIN inventory_t p1 ON p1.id = ((n - 1) % 10) + 1
JOIN inventory_t p2 ON p2.id = ((n + 2) % 10) + 1;

INSERT INTO order_item_t (`id`, `order_id`, `product_id`, `quantity`, `unit_price`, `subtotal`)
WITH RECURSIVE seq AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM seq WHERE n < 50
)
SELECT
  10000 + n * 2 - 1 AS id,
  1000 + n AS order_id,
  ((n - 1) % 10) + 1 AS product_id,
  (n % 4) + 1 AS quantity,
  p1.unit_price,
  ((n % 4) + 1) * p1.unit_price AS subtotal
FROM seq
JOIN inventory_t p1 ON p1.id = ((n - 1) % 10) + 1
UNION ALL
SELECT
  10000 + n * 2 AS id,
  1000 + n AS order_id,
  ((n + 2) % 10) + 1 AS product_id,
  ((n + 1) % 3) + 1 AS quantity,
  p2.unit_price,
  (((n + 1) % 3) + 1) * p2.unit_price AS subtotal
FROM seq
JOIN inventory_t p2 ON p2.id = ((n + 2) % 10) + 1;
