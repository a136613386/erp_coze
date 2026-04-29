import { z } from 'zod';

export const customerLevelOptions = ['VIP', '普通', '新客户'] as const;

export type CustomerLevel = (typeof customerLevelOptions)[number];

export interface CustomerListItem {
  id: string;
  name: string;
  company: string;
  phone: string;
  level: CustomerLevel;
  totalOrders: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1, '请输入客户名称'),
  company: z.string().trim().min(1, '请输入公司名称'),
  phone: z
    .string()
    .trim()
    .regex(/^1\d{10}$/, '请输入 11 位手机号'),
  level: z.enum(customerLevelOptions, {
    error: () => ({ message: '客户等级不合法' }),
  }).default('新客户'),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
