CREATE TABLE customer_t
(
    id            INT UNSIGNED AUTO_INCREMENT COMMENT '自增主键'
        PRIMARY KEY,
    customer_name VARCHAR(100)                        NOT NULL COMMENT '客户名称',
    company_name  VARCHAR(200)                        NOT NULL COMMENT '公司名称',
    phone         VARCHAR(20)                         NOT NULL COMMENT '联系电话',
    level         ENUM ('vip', '普通', '新客户')           NOT NULL COMMENT '客户等级',
    create_time   TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL COMMENT '创建时间',
    update_time   TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
)
    COMMENT '客户表';

INSERT INTO erp_local.customer_t (id, customer_name, company_name, phone, level, create_time, update_time) VALUES (1, '张三', '北京科技有限公司', '13800138001', 'vip', '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.customer_t (id, customer_name, company_name, phone, level, create_time, update_time) VALUES (2, '李四', '上海贸易集团', '13800138002', '普通', '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.customer_t (id, customer_name, company_name, phone, level, create_time, update_time) VALUES (3, '王五', '广州制造业公司', '13800138003', '新客户', '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.customer_t (id, customer_name, company_name, phone, level, create_time, update_time) VALUES (4, '赵六', '深圳电子科技', '13800138004', 'vip', '2026-04-29 17:03:08', '2026-04-29 17:03:08');
INSERT INTO erp_local.customer_t (id, customer_name, company_name, phone, level, create_time, update_time) VALUES (5, '孙七', '成都软件园', '13800138005', '普通', '2026-04-29 17:03:08', '2026-04-29 17:03:08');