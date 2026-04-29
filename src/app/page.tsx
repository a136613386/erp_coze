'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  Bell,
  Bot,
  ChevronLeft,
  ChevronRight,
  Eye,
  Package,
  RefreshCw,
  Rocket,
  Send,
  Settings,
  ShoppingCart,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import AddCustomerDialog from '@/components/AddCustomerDialog';
import AddOrderDialog from '@/components/AddOrderDialog';
import DifyChat from '@/components/DifyChat';
import FinanceRecordDialog from '@/components/FinanceRecordDialog';
import StockMovementDialog from '@/components/StockMovementDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { CreateCustomerInput, CustomerListItem } from '@/lib/customer-management';
import type {
  DashboardOverviewStats,
  FinanceListItem,
  InventoryListItem,
  OrderListItem,
} from '@/lib/erp-client';

type TabType = 'customers' | 'orders' | 'inventory' | 'finance' | 'dashboard';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

const navItems = [
  { id: 'dashboard', label: '经营概览', icon: BarChart3 },
  { id: 'customers', label: '客户管理', icon: Users },
  { id: 'orders', label: '订单管理', icon: ShoppingCart },
  { id: 'inventory', label: '库存管理', icon: Package },
  { id: 'finance', label: '财务管理', icon: Wallet },
] as const;

const statusColors: Record<string, string> = {
  VIP: 'bg-purple-100 text-purple-700',
  普通: 'bg-blue-100 text-blue-700',
  新客户: 'bg-green-100 text-green-700',
  已完成: 'bg-green-100 text-green-700',
  已发货: 'bg-blue-100 text-blue-700',
  待付款: 'bg-yellow-100 text-yellow-700',
  已付款: 'bg-emerald-100 text-emerald-700',
  已取消: 'bg-slate-100 text-slate-700',
  已确认: 'bg-green-100 text-green-700',
  待确认: 'bg-yellow-100 text-yellow-700',
  low: 'bg-red-100 text-red-700',
  normal: 'bg-green-100 text-green-700',
  收款: 'bg-green-100 text-green-700',
  付款: 'bg-red-100 text-red-700',
};

async function parseErrorMessage(response: Response) {
  try {
    const data = await response.json();
    return typeof data?.message === 'string' ? data.message : '请求失败，请稍后重试';
  } catch {
    return '请求失败，请稍后重试';
  }
}

function customerNumericId(customerId: string) {
  return Number(customerId.replace(/\D/g, ''));
}

export default function ERPDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [difyOpen, setDifyOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '您好，我是 ERP 智能助手，可以帮您查询客户、订单、库存、财务，并生成经营报表。',
      timestamp: new Date().toISOString(),
    },
  ]);

  const [dashboard, setDashboard] = useState<DashboardOverviewStats>({
    customerCount: 0,
    orderCount: 0,
    productCount: 0,
    cumulativeSales: 0,
    pendingPaymentCount: 0,
    lowStockCount: 0,
    recentOrders: [],
    lowStockProducts: [],
  });
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [inventory, setInventory] = useState<InventoryListItem[]>([]);
  const [financeRecords, setFinanceRecords] = useState<FinanceListItem[]>([]);

  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [customerLoading, setCustomerLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [financeLoading, setFinanceLoading] = useState(true);

  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [stockInDialogOpen, setStockInDialogOpen] = useState(false);
  const [stockOutDialogOpen, setStockOutDialogOpen] = useState(false);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderListItem | null>(null);

  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [creatingStockMovement, setCreatingStockMovement] = useState(false);
  const [creatingFinanceRecord, setCreatingFinanceRecord] = useState(false);

  const customerOptions = useMemo(
    () =>
      customers.map((customer) => ({
        id: customerNumericId(customer.id),
        label: `${customer.name} / ${customer.company}`,
      })),
    [customers]
  );

  const inventoryOptions = useMemo(
    () =>
      inventory.map((product) => ({
        id: product.id,
        label: `${product.name} (${product.code})`,
        unit: product.unit,
        price: product.price,
        stock: product.stock,
      })),
    [inventory]
  );

  const orderOptions = useMemo(
    () =>
      orders.map((order) => ({
        id: order.id,
        label: `${order.orderNo} / ${order.customerName}`,
        customerId: order.customerId,
        customerName: order.customerName,
        amount: order.amount,
      })),
    [orders]
  );

  const loadDashboard = useCallback(async (showErrorToast = true) => {
    try {
      setDashboardLoading(true);
      const response = await fetch('/api/dashboard/overview', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }
      const data = (await response.json()) as DashboardOverviewStats;
      setDashboard(data);
    } catch (error) {
      if (showErrorToast) {
        toast.error(error instanceof Error ? error.message : '经营概览加载失败');
      }
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  const loadCustomers = useCallback(async (showErrorToast = true) => {
    try {
      setCustomerLoading(true);
      const response = await fetch('/api/customers', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }
      const data = (await response.json()) as { customers: CustomerListItem[] };
      setCustomers(data.customers);
    } catch (error) {
      if (showErrorToast) {
        toast.error(error instanceof Error ? error.message : '客户列表加载失败');
      }
    } finally {
      setCustomerLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async (showErrorToast = true) => {
    try {
      setOrdersLoading(true);
      const response = await fetch('/api/orders', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }
      const data = (await response.json()) as { orders: OrderListItem[] };
      setOrders(data.orders);
    } catch (error) {
      if (showErrorToast) {
        toast.error(error instanceof Error ? error.message : '订单列表加载失败');
      }
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const loadInventory = useCallback(async (showErrorToast = true) => {
    try {
      setInventoryLoading(true);
      const response = await fetch('/api/inventory', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }
      const data = (await response.json()) as { inventory: InventoryListItem[] };
      setInventory(data.inventory);
    } catch (error) {
      if (showErrorToast) {
        toast.error(error instanceof Error ? error.message : '库存列表加载失败');
      }
    } finally {
      setInventoryLoading(false);
    }
  }, []);

  const loadFinance = useCallback(async (showErrorToast = true) => {
    try {
      setFinanceLoading(true);
      const response = await fetch('/api/finance', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }
      const data = (await response.json()) as { records: FinanceListItem[] };
      setFinanceRecords(data.records);
    } catch (error) {
      if (showErrorToast) {
        toast.error(error instanceof Error ? error.message : '财务列表加载失败');
      }
    } finally {
      setFinanceLoading(false);
    }
  }, []);

  const reloadCoreData = useCallback(async () => {
    await Promise.all([
      loadDashboard(false),
      loadCustomers(false),
      loadOrders(false),
      loadInventory(false),
      loadFinance(false),
    ]);
  }, [loadCustomers, loadDashboard, loadFinance, loadInventory, loadOrders]);

  useEffect(() => {
    void reloadCoreData();
  }, [reloadCoreData]);

  const handleCreateCustomer = async (values: CreateCustomerInput) => {
    try {
      setCreatingCustomer(true);
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        toast.error(await parseErrorMessage(response));
        return false;
      }

      await Promise.all([loadCustomers(false), loadDashboard(false)]);
      setCustomerDialogOpen(false);
      toast.success('客户新增成功');
      return true;
    } catch {
      toast.error('网络异常，请稍后重试');
      return false;
    } finally {
      setCreatingCustomer(false);
    }
  };

  const handleCreateOrder = async (values: {
    customerId: number;
    dealDate: string;
    status: OrderListItem['status'];
    items: { productId: number; quantity: number }[];
  }) => {
    try {
      setCreatingOrder(true);
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        toast.error(await parseErrorMessage(response));
        return false;
      }

      await Promise.all([loadOrders(false), loadInventory(false), loadCustomers(false), loadDashboard(false)]);
      setOrderDialogOpen(false);
      toast.success('订单创建成功');
      return true;
    } catch {
      toast.error('网络异常，请稍后重试');
      return false;
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleStockMovement = async (values: {
    productId: number;
    type: '入库' | '出库';
    status: '正常' | '库存不足';
    quantity: number;
    operatorName: string;
    remark: string;
  }) => {
    try {
      setCreatingStockMovement(true);
      const response = await fetch('/api/inventory/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        toast.error(await parseErrorMessage(response));
        return false;
      }

      await Promise.all([loadInventory(false), loadDashboard(false)]);
      if (values.type === '入库') {
        setStockInDialogOpen(false);
      } else {
        setStockOutDialogOpen(false);
      }
      toast.success(`${values.type}成功`);
      return true;
    } catch {
      toast.error('网络异常，请稍后重试');
      return false;
    } finally {
      setCreatingStockMovement(false);
    }
  };

  const handleCreateFinance = async (values: {
    type: FinanceListItem['type'];
    financeDate: string;
    amount: number;
    paymentMethod: FinanceListItem['paymentMethod'];
    status: FinanceListItem['status'];
    customerId?: number;
    orderId?: number;
    counterparty?: string;
    remark?: string;
  }) => {
    try {
      setCreatingFinanceRecord(true);
      const response = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        toast.error(await parseErrorMessage(response));
        return false;
      }

      await loadFinance(false);
      if (values.type === '收款') {
        setReceiveDialogOpen(false);
      } else {
        setPayDialogOpen(false);
      }
      toast.success(`${values.type}记录新增成功`);
      return true;
    } catch {
      toast.error('网络异常，请稍后重试');
      return false;
    } finally {
      setCreatingFinanceRecord(false);
    }
  };

  const handleChat = async (event: React.FormEvent) => {
    event.preventDefault();
    const message = chatInput.trim();
    if (!message || chatLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const text = await response.text();
      setChatMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: text || '暂未收到有效回复，请稍后重试。',
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: '服务暂时不可用，请稍后再试。',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside
        className={cn(
          'flex flex-col bg-slate-800 text-white transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <span className="font-bold">ERP 系统</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="text-white hover:bg-slate-700"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-700',
                activeTab === item.id && 'border-r-2 border-blue-500 bg-slate-700'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
              {!sidebarCollapsed && item.id === 'inventory' && dashboard.lowStockCount > 0 && (
                <Badge variant="destructive" className="ml-auto text-xs">
                  {dashboard.lowStockCount}
                </Badge>
              )}
              {!sidebarCollapsed && item.id === 'orders' && dashboard.pendingPaymentCount > 0 && (
                <Badge variant="destructive" className="ml-auto text-xs">
                  {dashboard.pendingPaymentCount}
                </Badge>
              )}
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-700 p-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-slate-700">
            <Settings className="h-5 w-5" />
            {!sidebarCollapsed && <span>系统设置</span>}
          </button>
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <h2 className="text-lg font-semibold text-slate-800">
            {navItems.find((item) => item.id === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {(dashboard.lowStockCount > 0 || dashboard.pendingPaymentCount > 0) && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {dashboard.lowStockCount + dashboard.pendingPaymentCount}
                </span>
              )}
            </Button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-medium text-white">
              管
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">客户总数</p>
                        <p className="text-3xl font-bold text-slate-800">
                          {dashboardLoading ? '--' : dashboard.customerCount}
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">订单总数</p>
                        <p className="text-3xl font-bold text-slate-800">
                          {dashboardLoading ? '--' : dashboard.orderCount}
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                        <ShoppingCart className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">商品种类</p>
                        <p className="text-3xl font-bold text-slate-800">
                          {dashboardLoading ? '--' : dashboard.productCount}
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                        <Package className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">累计销售额</p>
                        <p className="text-3xl font-bold text-slate-800">
                          {dashboardLoading ? '--' : `¥${dashboard.cumulativeSales.toLocaleString()}`}
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                        <Wallet className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {(dashboard.lowStockCount > 0 || dashboard.pendingPaymentCount > 0) && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-orange-700">
                      <AlertCircle className="h-5 w-5" />
                      待处理事项
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-orange-600">
                    {dashboard.pendingPaymentCount > 0 && <p>当前有 {dashboard.pendingPaymentCount} 笔订单待付款</p>}
                    {dashboard.lowStockCount > 0 && <p>当前有 {dashboard.lowStockCount} 个商品低于安全库存</p>}
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>最近订单</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {dashboard.recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
                        <div>
                          <p className="font-medium text-slate-800">{order.orderNo}</p>
                          <p className="text-sm text-slate-500">{order.customerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">¥{order.amount.toLocaleString()}</p>
                          <Badge className={statusColors[order.status]}>{order.status}</Badge>
                        </div>
                      </div>
                    ))}
                    {dashboard.recentOrders.length === 0 && (
                      <div className="py-8 text-center text-sm text-slate-500">暂无订单数据</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>库存预警</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {dashboard.lowStockProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
                        <div>
                          <p className="font-medium text-slate-800">{product.name}</p>
                          <p className="text-sm text-slate-500">
                            安全库存：{product.safeStock}
                            {product.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-red-600">
                            {product.stock}
                            {product.unit}
                          </p>
                          <Badge className="bg-red-100 text-red-700">库存不足</Badge>
                        </div>
                      </div>
                    ))}
                    {dashboard.lowStockProducts.length === 0 && (
                      <div className="py-8 text-center text-sm text-slate-500">暂无库存预警</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>客户列表</CardTitle>
                  <p className="mt-1 text-sm text-slate-500">支持新增客户、自动统计订单数与累计金额。</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => void loadCustomers()} disabled={customerLoading}>
                    <RefreshCw className={cn('mr-2 h-4 w-4', customerLoading && 'animate-spin')} />
                    刷新
                  </Button>
                  <Button onClick={() => setCustomerDialogOpen(true)}>添加客户</Button>
                </div>
              </CardHeader>
              <CardContent>
                {customerLoading ? (
                  <div className="py-16 text-center text-slate-500">正在加载客户数据...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="px-4 py-3 text-left font-medium text-slate-600">客户名称</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">公司名称</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">联系电话</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">客户等级</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">订单数</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">累计金额</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((customer) => (
                          <tr key={customer.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-800">{customer.name}</td>
                            <td className="px-4 py-3 text-slate-600">{customer.company}</td>
                            <td className="px-4 py-3 text-slate-600">{customer.phone}</td>
                            <td className="px-4 py-3">
                              <Badge className={statusColors[customer.level]}>{customer.level}</Badge>
                            </td>
                            <td className="px-4 py-3">{customer.totalOrders}</td>
                            <td className="px-4 py-3">¥{customer.totalAmount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'orders' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>订单列表</CardTitle>
                  <p className="text-sm text-slate-500">创建订单会自动写入明细并扣减库存。</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => void loadOrders()} disabled={ordersLoading}>
                    <RefreshCw className={cn('mr-2 h-4 w-4', ordersLoading && 'animate-spin')} />
                    刷新
                  </Button>
                  <Button onClick={() => setOrderDialogOpen(true)}>创建订单</Button>
                </div>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="py-16 text-center text-slate-500">正在加载订单数据...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="px-4 py-3 text-left font-medium text-slate-600">订单号</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">客户</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">日期</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">金额</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">状态</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">明细数</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium">{order.orderNo}</td>
                            <td className="px-4 py-3 text-slate-600">{order.customerName}</td>
                            <td className="px-4 py-3 text-slate-600">{order.dealDate}</td>
                            <td className="px-4 py-3">¥{order.amount.toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <Badge className={statusColors[order.status]}>{order.status}</Badge>
                            </td>
                            <td className="px-4 py-3">{order.itemCount}</td>
                            <td className="px-4 py-3">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                                <Eye className="mr-2 h-4 w-4" />
                                详情
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'inventory' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>库存列表</CardTitle>
                  <p className="text-sm text-slate-500">支持手动入库、出库，并自动刷新库存预警。</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => void loadInventory()} disabled={inventoryLoading}>
                    <RefreshCw className={cn('mr-2 h-4 w-4', inventoryLoading && 'animate-spin')} />
                    刷新
                  </Button>
                  <Button variant="outline" onClick={() => setStockInDialogOpen(true)}>
                    入库
                  </Button>
                  <Button variant="outline" onClick={() => setStockOutDialogOpen(true)}>
                    出库
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {inventoryLoading ? (
                  <div className="py-16 text-center text-slate-500">正在加载库存数据...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="px-4 py-3 text-left font-medium text-slate-600">商品编码</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">商品名称</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">分类</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">当前库存</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">安全库存</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">单价</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">状态</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.map((product) => (
                          <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono text-sm">{product.code}</td>
                            <td className="px-4 py-3 font-medium">{product.name}</td>
                            <td className="px-4 py-3 text-slate-600">{product.category}</td>
                            <td className="px-4 py-3">
                              <span className={product.status === 'low' ? 'font-medium text-red-600' : ''}>
                                {product.stock}
                                {product.unit}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {product.safeStock}
                              {product.unit}
                            </td>
                            <td className="px-4 py-3">¥{product.price.toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <Badge className={statusColors[product.status]}>
                                {product.status === 'low' ? '库存不足' : '正常'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'finance' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>财务记录</CardTitle>
                  <p className="text-sm text-slate-500">支持新增收款与付款，并关联客户或订单。</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => void loadFinance()} disabled={financeLoading}>
                    <RefreshCw className={cn('mr-2 h-4 w-4', financeLoading && 'animate-spin')} />
                    刷新
                  </Button>
                  <Button variant="outline" onClick={() => setReceiveDialogOpen(true)}>
                    收款
                  </Button>
                  <Button variant="outline" onClick={() => setPayDialogOpen(true)}>
                    付款
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {financeLoading ? (
                  <div className="py-16 text-center text-slate-500">正在加载财务数据...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="px-4 py-3 text-left font-medium text-slate-600">日期</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">类型</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">对方</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">订单</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">金额</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">方式</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">状态</th>
                        </tr>
                      </thead>
                      <tbody>
                        {financeRecords.map((record) => (
                          <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="px-4 py-3 text-slate-600">{record.financeDate}</td>
                            <td className="px-4 py-3">
                              <Badge className={statusColors[record.type]}>{record.type}</Badge>
                            </td>
                            <td className="px-4 py-3">{record.customerName ?? record.counterparty}</td>
                            <td className="px-4 py-3 text-slate-600">{record.orderNo ?? '-'}</td>
                            <td className="px-4 py-3 font-medium">
                              <span className={record.type === '收款' ? 'text-green-600' : 'text-red-600'}>
                                {record.type === '收款' ? '+' : '-'}¥{record.amount.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{record.paymentMethod}</td>
                            <td className="px-4 py-3">
                              <Badge className={statusColors[record.status]}>{record.status}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <AddCustomerDialog
        existingCustomers={customers}
        onOpenChange={setCustomerDialogOpen}
        onSubmit={handleCreateCustomer}
        open={customerDialogOpen}
        submitting={creatingCustomer}
      />

      <AddOrderDialog
        customers={customerOptions}
        open={orderDialogOpen}
        products={inventoryOptions}
        submitting={creatingOrder}
        onOpenChange={setOrderDialogOpen}
        onSubmit={handleCreateOrder}
      />

      <StockMovementDialog
        open={stockInDialogOpen}
        products={inventoryOptions}
        submitting={creatingStockMovement}
        title="入库"
        onOpenChange={setStockInDialogOpen}
        onSubmit={handleStockMovement}
      />

      <StockMovementDialog
        open={stockOutDialogOpen}
        products={inventoryOptions}
        submitting={creatingStockMovement}
        title="出库"
        onOpenChange={setStockOutDialogOpen}
        onSubmit={handleStockMovement}
      />

      <FinanceRecordDialog
        customers={customerOptions}
        open={receiveDialogOpen}
        orders={orderOptions}
        submitting={creatingFinanceRecord}
        title="收款"
        onOpenChange={setReceiveDialogOpen}
        onSubmit={handleCreateFinance}
      />

      <FinanceRecordDialog
        customers={customerOptions}
        open={payDialogOpen}
        orders={orderOptions}
        submitting={creatingFinanceRecord}
        title="付款"
        onOpenChange={setPayDialogOpen}
        onSubmit={handleCreateFinance}
      />

      <Dialog open={Boolean(selectedOrder)} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>订单详情</DialogTitle>
            <DialogDescription>{selectedOrder?.orderNo}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 text-sm">
                <div>客户：{selectedOrder.customerName}</div>
                <div>日期：{selectedOrder.dealDate}</div>
                <div>状态：{selectedOrder.status}</div>
                <div>金额：¥{selectedOrder.amount.toLocaleString()}</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="px-3 py-2">商品编码</th>
                      <th className="px-3 py-2">商品名称</th>
                      <th className="px-3 py-2">数量</th>
                      <th className="px-3 py-2">单价</th>
                      <th className="px-3 py-2">小计</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100">
                        <td className="px-3 py-2">{item.productCode}</td>
                        <td className="px-3 py-2">{item.productName}</td>
                        <td className="px-3 py-2">{item.quantity}</td>
                        <td className="px-3 py-2">¥{item.unitPrice.toLocaleString()}</td>
                        <td className="px-3 py-2">¥{item.subtotal.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <button
        onClick={() => setChatOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition-transform hover:scale-110',
          chatOpen && 'hidden'
        )}
      >
        <Bot className="h-7 w-7" />
      </button>

      <button
        onClick={() => setDifyOpen(true)}
        className={cn(
          'fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 transition-transform hover:scale-110',
          difyOpen && 'hidden'
        )}
      >
        <Rocket className="h-7 w-7" />
      </button>

      {difyOpen && <DifyChat onClose={() => setDifyOpen(false)} />}

      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/50 p-6">
          <div className="flex h-[600px] w-full max-w-md animate-in flex-col rounded-2xl bg-white shadow-2xl duration-300 slide-in-from-bottom-4">
            <div className="flex h-16 shrink-0 items-center justify-between rounded-t-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">ERP 智能助手</h3>
                  <p className="text-xs text-blue-100">在线</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setChatOpen(false)} className="text-white hover:bg-white/20">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatMessages.map((message) => (
                  <div key={message.id} className={cn('flex gap-3', message.role === 'user' && 'flex-row-reverse')}>
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
                        message.role === 'user' ? 'bg-emerald-500' : 'bg-blue-500'
                      )}
                    >
                      {message.role === 'user' ? (
                        <span className="text-xs font-medium text-white">我</span>
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-2',
                        message.role === 'user' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700'
                      )}
                    >
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{message.content}</pre>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="rounded-2xl bg-slate-100 px-4 py-3">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0ms' }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '150ms' }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="shrink-0 border-t border-slate-200 p-4">
              <form onSubmit={handleChat} className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  placeholder="输入您的问题..."
                  className="flex-1"
                  disabled={chatLoading}
                />
                <Button type="submit" disabled={!chatInput.trim() || chatLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <div className="mt-2 flex gap-2">
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setChatInput('查看客户列表')}>
                  客户列表
                </Button>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setChatInput('查看订单')}>
                  订单查询
                </Button>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setChatInput('生成经营报表')}>
                  经营报表
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
