import 'server-only';

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  createCustomerSchema,
  type CreateCustomerInput,
  type CustomerListItem,
} from '@/lib/customer-management';

const dataDir = path.join(process.cwd(), 'src', 'data');
const customerFilePath = path.join(dataDir, 'customers.json');

function byCreatedAtDesc(a: CustomerListItem, b: CustomerListItem) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

async function ensureCustomerFile() {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(customerFilePath, 'utf8');
  } catch {
    await writeFile(customerFilePath, '[]\n', 'utf8');
  }
}

export async function getCustomers(): Promise<CustomerListItem[]> {
  await ensureCustomerFile();
  const raw = await readFile(customerFilePath, 'utf8');
  const parsed = JSON.parse(raw) as CustomerListItem[];
  return parsed.slice().sort(byCreatedAtDesc);
}

function nextCustomerId(customers: CustomerListItem[]) {
  const maxId = customers.reduce((max, customer) => {
    const numericId = Number(customer.id.replace(/^C/, ''));
    return Number.isFinite(numericId) ? Math.max(max, numericId) : max;
  }, 0);

  return `C${String(maxId + 1).padStart(3, '0')}`;
}

export async function createCustomer(input: CreateCustomerInput): Promise<CustomerListItem> {
  const payload = createCustomerSchema.parse(input);
  const customers = await getCustomers();

  const duplicatedPhone = customers.some((customer) => customer.phone === payload.phone);
  if (duplicatedPhone) {
    throw new Error('该手机号已存在客户');
  }

  const now = new Date().toISOString();
  const customer: CustomerListItem = {
    id: nextCustomerId(customers),
    name: payload.name,
    company: payload.company,
    phone: payload.phone,
    level: payload.level,
    totalOrders: 0,
    totalAmount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const nextCustomers = [customer, ...customers];
  await writeFile(customerFilePath, `${JSON.stringify(nextCustomers, null, 2)}\n`, 'utf8');
  return customer;
}
