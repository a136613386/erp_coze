'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { zhCN } from 'date-fns/locale';
import { 
  Users, ShoppingCart, Package, Wallet, BarChart3, 
  Settings, Bell, ChevronLeft, ChevronRight, Bot,
  X, AlertCircle, Rocket, Send, Download, CalendarDays, CircleX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  createDashboardOverviewCards,
  createDashboardOverviewMetrics,
  type DashboardOverviewCard,
  type DashboardOverviewMetrics,
  type DashboardOverviewCardKey,
  type DashboardOverviewPayload,
} from '@/lib/dashboard-overview';
import { cn } from '@/lib/utils';
import {
  formatCurrency,
  mergeOrderRow,
  normalizeOrderStatus,
  orderStatusOptions,
  readOrderOverrides,
  writeOrderOverride,
  writeOrderOverrides,
  type OrderRow,
} from '@/lib/order-detail-data';
import DifyChat from '@/components/DifyChat';

type TabType = 'customers' | 'orders' | 'inventory' | 'finance' | 'dashboard';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface OrderFormState {
  customerId: string;
  orderDate: string;
  productName: string;
  quantity: string;
  price: string;
  status: OrderRow['status'];
  shippingAddress: string;
}

interface CustomerRow {
  id: string;
  name: string;
  company: string;
  phone: string;
  level: 'VIP' | '普通' | '新客户';
  totalOrders: number;
  totalAmount: number;
}

interface ApiLoadError {
  source: string;
  message: string;
  status?: number;
}

const pendingOrderStatus: OrderRow['status'] = '待付款';

const mockInventory = [
  { id: 'P001', name: '笔记本电脑', code: 'IT001', stock: 25, safeStock: 10, price: 5000, unit: '台', status: 'normal' },
  { id: 'P002', name: '无线鼠标', code: 'IT002', stock: 80, safeStock: 30, price: 150, unit: '个', status: 'normal' },
  { id: 'P003', name: '激光打印机', code: 'IT003', stock: 12, safeStock: 5, price: 2800, unit: '台', status: 'normal' },
  { id: 'P004', name: '显示器', code: 'IT004', stock: 8, safeStock: 10, price: 1800, unit: '台', status: 'low' },
  { id: 'P005', name: '键盘', code: 'IT005', stock: 45, safeStock: 20, price: 200, unit: '个', status: 'normal' },
  { id: 'P006', name: '服务器', code: 'IT006', stock: 5, safeStock: 2, price: 25000, unit: '台', status: 'normal' },
  { id: 'P007', name: '网络交换机', code: 'IT007', stock: 15, safeStock: 5, price: 3000, unit: '台', status: 'normal' },
  { id: 'P008', name: '固态硬盘', code: 'IT008', stock: 3, safeStock: 15, price: 800, unit: '个', status: 'low' },
  { id: 'P009', name: '投影仪', code: 'IT009', stock: 6, safeStock: 3, price: 4500, unit: '台', status: 'normal' },
  { id: 'P010', name: 'UPS电源', code: 'IT010', stock: 10, safeStock: 4, price: 2200, unit: '台', status: 'normal' },
];

const mockFinance = [
  { id: 'F001', type: '收款', amount: 53000, customer: '张三', method: '银行转账', status: '已确认', date: '2024-01-17' },
  { id: 'F002', type: '收款', amount: 40000, customer: '王五', method: '银行转账', status: '已确认', date: '2024-02-06' },
  { id: 'F003', type: '付款', amount: 126000, supplier: '联想科技', method: '银行转账', status: '已确认', date: '2024-01-05' },
  { id: 'F004', type: '付款', amount: 11000, supplier: '戴尔中国', method: '银行转账', status: '已确认', date: '2024-01-08' },
  { id: 'F005', type: '收款', amount: 14000, customer: '李四', method: '微信', status: '已确认', date: '2024-01-21' },
];

const statusColors: Record<string, string> = {
  'VIP': 'bg-purple-100 text-purple-700',
  '普通': 'bg-blue-100 text-blue-700',
  '新客户': 'bg-green-100 text-green-700',
  '已完成': 'bg-green-100 text-green-700',
  '已发货': 'bg-blue-100 text-blue-700',
  '待付款': 'bg-yellow-100 text-yellow-700',
  '已付款': 'bg-green-100 text-green-700',
  '已取消': 'bg-gray-100 text-gray-700',
  '已确认': 'bg-green-100 text-green-700',
  'low': 'bg-red-100 text-red-700',
  'normal': 'bg-green-100 text-green-700',
};

const overviewCardIcons: Record<DashboardOverviewCardKey, typeof Users> = {
  customerTotal: Users,
  orderTotal: ShoppingCart,
  productTotal: Package,
  monthlySales: Wallet,
};

const overviewCardTargets: Record<DashboardOverviewCardKey, TabType> = {
  customerTotal: 'customers',
  orderTotal: 'orders',
  productTotal: 'inventory',
  monthlySales: 'finance',
};

const emptyDashboardOverview: DashboardOverviewPayload = {
  metrics: createDashboardOverviewMetrics({
    customerTotal: 0,
    orderTotal: 0,
    productTotal: 0,
    monthlySales: 0,
  }),
  pendingPaymentCount: 0,
  lowStockCount: 0,
  recentOrders: [],
  lowStockItems: [],
};

const dayMs = 24 * 60 * 60 * 1000;

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toDateInputValue(date: Date) {
  return formatLocalDate(date);
}

function fromDateInputValue(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function shiftDate(date: Date, amount: number) {
  return new Date(date.getTime() + amount * dayMs);
}

function getStartOfWeek(date: Date) {
  const weekday = date.getDay();
  const diff = weekday === 0 ? 6 : weekday - 1;
  return shiftDate(date, -diff);
}

function getStartOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function normalizeRange(range: DateRange | undefined) {
  if (!range?.from && !range?.to) {
    return undefined;
  }

  if (range?.from && range?.to && range.to < range.from) {
    return { from: range.to, to: range.from };
  }

  return range;
}

function formatDateRangeLabel(start: string, end: string) {
  if (!start && !end) return '';
  if (start && end) return `${start} ~ ${end}`;
  return start || end;
}

export default function ERPDashboard() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [difyOpen, setDifyOpen] = useState(false);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [orderKeyword, setOrderKeyword] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'全部' | OrderRow['status']>('全部');
  const [orderDateStart, setOrderDateStart] = useState('');
  const [orderDateEnd, setOrderDateEnd] = useState('');
  const [orderDateRange, setOrderDateRange] = useState<DateRange | undefined>();
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [dateRangeError, setDateRangeError] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [orderForm, setOrderForm] = useState<OrderFormState>({
    customerId: '',
    orderDate: formatLocalDate(new Date()),
    productName: '',
    quantity: '1',
    price: '',
    status: pendingOrderStatus,
    shippingAddress: '',
  });

  // ‘false’：隐藏coze助手开关；‘true’：显示coze助手开关
  const showErpAssistant = false;

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '您好！我是ERP智能助手，可以帮您查询客户、订单、库存、财务等信息，也可以帮您生成经营报表或检查异常情况。',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [dashboardOverview, setDashboardOverview] = useState<DashboardOverviewPayload>(emptyDashboardOverview);
  const [apiErrors, setApiErrors] = useState<ApiLoadError[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'customers' || tab === 'orders' || tab === 'inventory' || tab === 'finance' || tab === 'dashboard') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      const nextErrors: ApiLoadError[] = [];

      async function fetchJson<T>(url: string, source: string): Promise<T | null> {
        try {
          const response = await fetch(url);

          if (!response.ok) {
            let message = `${source}接口请求失败`;

            try {
              const errorData = await response.json();
              message = errorData.message ?? errorData.error ?? message;
            } catch {
              message = await response.text();
            }

            nextErrors.push({ source, message, status: response.status });
            return null;
          }

          return await response.json();
        } catch (error) {
          nextErrors.push({
            source,
            message: error instanceof Error ? error.message : `${source}接口请求失败`,
          });
          return null;
        }
      }

      const [customersData, ordersData, overviewData] = await Promise.all([
        fetchJson<{ customers?: CustomerRow[] }>('/api/customers', '客户数据'),
        fetchJson<{ orders?: OrderRow[] }>('/api/orders', '订单数据'),
        fetchJson<DashboardOverviewPayload>('/api/dashboard/overview', '经营概览'),
      ]);

      if (customersData) {
        setCustomers(customersData.customers ?? []);
      }

      if (ordersData) {
        const overrides = readOrderOverrides();
        const nextOrders = (ordersData.orders ?? []).map((order: OrderRow) => {
          const mergedOrder = mergeOrderRow(order, overrides[order.id]);

          return {
            ...mergedOrder,
            status: normalizeOrderStatus(mergedOrder.status),
          };
        });
        setOrders(nextOrders);
        setSelectedOrderIds([]);
      }

      if (overviewData) {
        setDashboardOverview({
          metrics: overviewData.metrics ?? emptyDashboardOverview.metrics,
          pendingPaymentCount: overviewData.pendingPaymentCount ?? 0,
          lowStockCount: overviewData.lowStockCount ?? 0,
          recentOrders: overviewData.recentOrders ?? [],
          lowStockItems: overviewData.lowStockItems ?? [],
        });
      }

      setApiErrors(nextErrors);
    }

    void loadData();
  }, []);

  useEffect(() => {
    if (!orderForm.customerId && customers.length > 0) {
      setOrderForm(prev => ({ ...prev, customerId: customers[0].id }));
    }
  }, [customers, orderForm.customerId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [orderKeyword, orderStatusFilter, orderDateStart, orderDateEnd, pageSize]);

  useEffect(() => {
    if (!orderDateStart && !orderDateEnd) {
      setOrderDateRange(undefined);
      return;
    }

    const nextRange = normalizeRange({
      from: orderDateStart ? fromDateInputValue(orderDateStart) : undefined,
      to: orderDateEnd ? fromDateInputValue(orderDateEnd) : undefined,
    });

    setOrderDateRange(nextRange);
  }, [orderDateStart, orderDateEnd]);

  const handleOrderFormChange = (field: keyof OrderFormState, value: string) => {
    setOrderForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateOrder = () => {
    const customer = customers.find(item => item.id === orderForm.customerId);
    if (!customer) {
      return;
    }

    const quantity = Number(orderForm.quantity);
    const price = Number(orderForm.price);
    const totalAmount = quantity * price;
    const nextNumber = String(orders.length + 1).padStart(3, '0');
    const orderDateText = orderForm.orderDate.replaceAll('-', '');

    setOrders(prev => [
      {
        id: `ORD${nextNumber}`,
        customerId: customer.id,
        orderNo: `ORD${orderDateText}${nextNumber}`,
        customer: customer.name,
        amount: totalAmount,
        status: orderForm.status as OrderRow['status'],
        date: orderForm.orderDate,
        items: quantity,
        shippingAddress: orderForm.shippingAddress,
        productName: orderForm.productName,
      },
      ...prev,
    ]);
    setCustomers(prev =>
      prev.map(item =>
        item.id === customer.id
          ? {
              ...item,
              totalOrders: item.totalOrders + 1,
              totalAmount: item.totalAmount + totalAmount,
            }
          : item
      )
    );

    setCreateOrderOpen(false);
    setOrderForm({
      customerId: customers[0]?.id || '',
      orderDate: formatLocalDate(new Date()),
      productName: '',
      quantity: '1',
      price: '',
      status: pendingOrderStatus,
      shippingAddress: '',
    });
  };

  const filteredOrders = useMemo(() => {
    const keyword = orderKeyword.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesKeyword =
        !keyword ||
        order.orderNo.toLowerCase().includes(keyword) ||
        order.customerId.toLowerCase().includes(keyword) ||
        order.customer.toLowerCase().includes(keyword);

      const matchesStatus =
        orderStatusFilter === '全部' || order.status === orderStatusFilter;

      const matchesStart = !orderDateStart || order.date >= orderDateStart;
      const matchesEnd = !orderDateEnd || order.date <= orderDateEnd;

      return matchesKeyword && matchesStatus && matchesStart && matchesEnd;
    });
  }, [orders, orderKeyword, orderStatusFilter, orderDateStart, orderDateEnd]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedOrders = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, pageSize, safeCurrentPage]);
  const selectedOrders = filteredOrders.filter((order) => selectedOrderIds.includes(order.id));
  const allPageSelected =
    paginatedOrders.length > 0 && paginatedOrders.every((order) => selectedOrderIds.includes(order.id));

  const togglePageSelection = (checked: boolean) => {
    if (checked) {
      const merged = new Set([...selectedOrderIds, ...paginatedOrders.map((order) => order.id)]);
      setSelectedOrderIds([...merged]);
      return;
    }

    const pageIds = new Set(paginatedOrders.map((order) => order.id));
    setSelectedOrderIds((prev) => prev.filter((id) => !pageIds.has(id)));
  };

  const toggleOrderSelection = (orderId: string, checked: boolean) => {
    setSelectedOrderIds((prev) => {
      if (checked) {
        return [...new Set([...prev, orderId])];
      }

      return prev.filter((id) => id !== orderId);
    });
  };

  const handleBatchStatusChange = (status: OrderRow['status']) => {
    if (selectedOrderIds.length === 0) {
      return;
    }

    const currentOverrides = readOrderOverrides();
    const nextOverrides = { ...currentOverrides };

    selectedOrderIds.forEach((orderId) => {
      nextOverrides[orderId] = {
        ...nextOverrides[orderId],
        status,
      };
      writeOrderOverride(orderId, { status });
    });

    writeOrderOverrides(nextOverrides);
    setOrders((prev) =>
      prev.map((order) =>
        selectedOrderIds.includes(order.id)
          ? { ...order, status }
          : order
      )
    );
  };

  const handleBatchExport = () => {
    const exportRows = (selectedOrders.length > 0 ? selectedOrders : filteredOrders).map((order) => ({
      订单号: order.orderNo,
      客户ID: order.customerId,
      客户名称: order.customer,
      日期: order.date,
      金额: order.amount,
      状态: order.status,
    }));

    const csv = [
      ['订单号', '客户ID', '客户名称', '日期', '金额', '状态'].join(','),
      ...exportRows.map((row) =>
        [row.订单号, row.客户ID, row.客户名称, row.日期, row.金额, row.状态]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `orders-${formatLocalDate(new Date())}.csv`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const applyDateRange = (range: DateRange | undefined, errorMessage = '') => {
    const normalized = normalizeRange(range);
    setDateRangeError(errorMessage);
    setOrderDateRange(normalized);
    setOrderDateStart(normalized?.from ? toDateInputValue(normalized.from) : '');
    setOrderDateEnd(normalized?.to ? toDateInputValue(normalized.to) : '');
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to && range.to < range.from) {
      applyDateRange({ from: range.to, to: range.from }, '结束日期不能早于开始日期，已自动修正。');
      return;
    }

    const normalized = normalizeRange(range);
    applyDateRange(normalized, '');

    if (normalized?.from && normalized?.to) {
      setDateRangeOpen(false);
    }
  };

  const handleQuickDateRange = (preset: 'today' | 'yesterday' | 'week' | 'month') => {
    const today = new Date();
    const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let nextRange: DateRange;

    switch (preset) {
      case 'today':
        nextRange = { from: current, to: current };
        break;
      case 'yesterday': {
        const yesterday = shiftDate(current, -1);
        nextRange = { from: yesterday, to: yesterday };
        break;
      }
      case 'week':
        nextRange = { from: getStartOfWeek(current), to: current };
        break;
      case 'month':
        nextRange = { from: getStartOfMonth(current), to: current };
        break;
      default:
        nextRange = { from: getStartOfWeek(current), to: current };
        break;
    }

    applyDateRange(nextRange, '');
    setDateRangeOpen(false);
  };

  const clearDateRange = () => {
    applyDateRange(undefined, '');
  };

  const dateRangeLabel = formatDateRangeLabel(orderDateStart, orderDateEnd);

  const navItems = [
    { id: 'dashboard', label: '经营概览', icon: BarChart3 },
    { id: 'customers', label: '客户管理', icon: Users },
    { id: 'orders', label: '订单管理', icon: ShoppingCart },
    { id: 'inventory', label: '库存管理', icon: Package },
    { id: 'finance', label: '财务管理', icon: Wallet },
  ];

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date().toISOString(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput.trim() }),
      });

      const text = await response.text();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text || '抱歉，我没有收到有效的回复',
        timestamp: new Date().toISOString(),
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，服务暂时不可用，请稍后重试',
        timestamp: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const overviewMetrics: DashboardOverviewMetrics = dashboardOverview.metrics;
  const lowStockCount = dashboardOverview.lowStockCount;
  const orderPendingPaymentCount = dashboardOverview.pendingPaymentCount;
  const orderTotalAmount = Number(orderForm.quantity) * Number(orderForm.price || '0');
  const overviewCards: DashboardOverviewCard[] = createDashboardOverviewCards(overviewMetrics);
  const notificationCount = orderPendingPaymentCount + lowStockCount + apiErrors.length;

  const goToOrdersDetail = (status?: OrderRow['status']) => {
    setActiveTab('orders');
    setNotificationOpen(false);

    if (status) {
      setOrderStatusFilter(status);
    }
  };

  const goToInventoryDetail = () => {
    setActiveTab('inventory');
    setNotificationOpen(false);
  };

  const notificationItems = [
    ...(orderPendingPaymentCount > 0
      ? [
          {
            key: 'pending-orders',
            label: `有 ${orderPendingPaymentCount} 笔订单待收款`,
            action: () => goToOrdersDetail(pendingOrderStatus),
          },
        ]
      : []),
    ...(lowStockCount > 0
      ? [
          {
            key: 'low-stock',
            label: `有 ${lowStockCount} 种产品库存不足`,
            action: goToInventoryDetail,
          },
        ]
      : []),
    ...apiErrors.map((error, index) => ({
      key: `api-error-${index}`,
      label: `${error.source}加载失败`,
      action: () => setNotificationOpen(false),
    })),
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className={cn(
        'bg-slate-800 text-white transition-all duration-300 flex flex-col',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="font-bold">ERP系统</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-white hover:bg-slate-700"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors',
                activeTab === item.id && 'bg-slate-700 border-r-2 border-blue-500'
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
              {!sidebarCollapsed && item.id === 'inventory' && lowStockCount > 0 && (
                <Badge variant="destructive" className="ml-auto text-xs">{lowStockCount}</Badge>
              )}
              {!sidebarCollapsed && item.id === 'orders' && orderPendingPaymentCount > 0 && (
                <Badge variant="destructive" className="ml-auto text-xs">{orderPendingPaymentCount}</Badge>
              )}
            </button>
          ))}
        </nav>

        {/* Settings */}
        <div className="border-t border-slate-700 p-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
            {!sidebarCollapsed && <span>系统设置</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-slate-800">
            {navItems.find(n => n.id === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-4">
            <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">通知概览</p>
                  <p className="mt-1 text-xs text-slate-500">点击可跳转到对应详情页面</p>
                </div>
                <div className="p-2">
                  {notificationItems.length > 0 ? (
                    notificationItems.map((item) => (
                      <button
                        key={item.key}
                        onClick={item.action}
                        className="flex w-full items-start rounded-md px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <span className="mt-1 mr-2 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                        <span>{item.label}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-6 text-center text-sm text-slate-500">暂无待处理通知</div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              管
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {apiErrors.length > 0 && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-700 flex items-center gap-2 text-base">
                  <AlertCircle className="w-5 h-5" />
                  数据加载失败
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-red-700">
                {apiErrors.map(error => (
                  <div key={`${error.source}-${error.status ?? 'network'}`} className="rounded-md bg-white/70 px-3 py-2">
                    <p className="font-medium">
                      {error.source}
                      {error.status ? ` · HTTP ${error.status}` : ''}
                    </p>
                    <p className="mt-1 break-words text-red-600">{error.message}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {overviewCards.map(card => {
                  const Icon = overviewCardIcons[card.icon];
                  const targetTab = overviewCardTargets[card.key];

                  return (
                    <Card
                      key={card.key}
                      className="cursor-pointer transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                      onClick={() => setActiveTab(targetTab)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-500">{card.label}</p>
                            <p className="text-3xl font-bold text-slate-800">{card.value}</p>
                          </div>
                          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', card.iconWrapperClassName)}>
                            <Icon className={cn('w-6 h-6', card.iconClassName)} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Alerts */}
              {(lowStockCount > 0 || orderPendingPaymentCount > 0) && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-orange-700 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      待处理事项
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {orderPendingPaymentCount > 0 && (
                        <button
                          onClick={() => goToOrdersDetail(pendingOrderStatus)}
                          className="block text-orange-600 transition-colors hover:text-orange-700 hover:underline"
                        >
                          • 有 {orderPendingPaymentCount} 笔订单待收款
                        </button>
                      )}
                      {lowStockCount > 0 && (
                        <button
                          onClick={goToInventoryDetail}
                          className="block text-orange-600 transition-colors hover:text-orange-700 hover:underline"
                        >
                          • 有 {lowStockCount} 种产品库存不足
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Data */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>最近订单</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardOverview.recentOrders.map(order => (
                        <div key={order.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                          <div>
                            <p className="font-medium text-slate-800">{order.orderNo}</p>
                            <p className="text-sm text-slate-500">{order.customer}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(order.amount)}</p>
                            <Badge className={statusColors[order.status]}>{order.status}</Badge>
                          </div>
                        </div>
                      ))}
                      {dashboardOverview.recentOrders.length === 0 && (
                        <p className="text-slate-500 text-center py-4">暂无订单数据</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>库存预警</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardOverview.lowStockItems.map(product => (
                        <div key={product.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                          <div>
                            <p className="font-medium text-slate-800">{product.name}</p>
                            <p className="text-sm text-slate-500">安全库存: {product.safeStock}{product.unit}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-red-600">{product.stock}{product.unit}</p>
                            <Badge className="bg-red-100 text-red-700">库存不足</Badge>
                          </div>
                        </div>
                      ))}
                      {dashboardOverview.lowStockItems.length === 0 && (
                        <p className="text-slate-500 text-center py-4">库存状态良好</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Customers */}
          {activeTab === 'customers' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>客户列表</CardTitle>
                <Button>添加客户</Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-medium text-slate-600">客户名称</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">公司</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">电话</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">等级</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">订单数</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">累计金额</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map(customer => (
                        <tr key={customer.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 font-medium">{customer.name}</td>
                          <td className="py-3 px-4 text-slate-600">{customer.company}</td>
                          <td className="py-3 px-4 text-slate-600">{customer.phone}</td>
                          <td className="py-3 px-4">
                            <Badge className={statusColors[customer.level]}>{customer.level}</Badge>
                          </td>
                          <td className="py-3 px-4">{customer.totalOrders}</td>
                          <td className="py-3 px-4">¥{customer.totalAmount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Orders */}
          {activeTab === 'orders' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>订单列表</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleBatchExport}>
                    <Download className="mr-2 h-4 w-4" />
                    批量导出
                  </Button>
                  <Button onClick={() => setCreateOrderOpen(true)}>创建订单</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr_auto]">
                  <Input
                    value={orderKeyword}
                    onChange={(e) => setOrderKeyword(e.target.value)}
                    placeholder="搜索订单号、客户 ID、客户名称"
                  />
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value as '全部' | OrderRow['status'])}
                    className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none"
                  >
                    <option value="全部">全部状态</option>
                    {['待付款', '已付款', '已完成'].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <div className="space-y-1">
                    <Popover open={dateRangeOpen} onOpenChange={setDateRangeOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            'flex h-10 w-full items-center rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition-colors',
                            dateRangeError ? 'border-amber-400 ring-2 ring-amber-100' : 'hover:border-slate-300'
                          )}
                        >
                          <span className={cn('truncate text-left', dateRangeLabel ? 'text-slate-900' : 'text-slate-400')}>
                            {dateRangeLabel || '选择日期范围'}
                          </span>
                          <div className="ml-auto flex items-center gap-2 pl-3">
                            {dateRangeLabel && (
                              <CircleX
                                className="h-4 w-4 text-slate-400 transition-colors hover:text-slate-600"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  clearDateRange();
                                }}
                              />
                            )}
                            <CalendarDays className="h-4 w-4 text-slate-500" />
                          </div>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-auto p-0">
                        <div className="flex flex-col gap-3 p-3">
                          <div className="grid grid-cols-4 gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleQuickDateRange('today')}>今天</Button>
                            <Button variant="outline" size="sm" onClick={() => handleQuickDateRange('yesterday')}>昨天</Button>
                            <Button variant="outline" size="sm" onClick={() => handleQuickDateRange('week')}>本周</Button>
                            <Button variant="outline" size="sm" onClick={() => handleQuickDateRange('month')}>本月</Button>
                          </div>
                          <Calendar
                            mode="range"
                            selected={orderDateRange}
                            onSelect={handleDateRangeSelect}
                            defaultMonth={orderDateRange?.from}
                            locale={zhCN}
                            classNames={{
                              month_caption: 'flex items-center justify-center h-(--cell-size) w-full px-(--cell-size) text-sm font-medium',
                            }}
                            className="rounded-md border border-slate-100 bg-white"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    {dateRangeError && (
                      <p className="text-xs text-amber-600">{dateRangeError}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOrderKeyword('');
                      setOrderStatusFilter('全部');
                      clearDateRange();
                    }}
                  >
                    重置
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <span className="text-slate-600">
                    已选 {selectedOrderIds.length} 条 / 共 {filteredOrders.length} 条
                  </span>
                  {orderStatusOptions.map((status) => (
                    <Button
                      key={status}
                      variant="outline"
                      size="sm"
                      disabled={selectedOrderIds.length === 0}
                      onClick={() => handleBatchStatusChange(status)}
                    >
                      批量改为{status}
                    </Button>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="w-12 py-3 px-4">
                          <input
                            type="checkbox"
                            checked={allPageSelected}
                            onChange={(e) => togglePageSelection(e.target.checked)}
                          />
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">订单号</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">客户ID</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">客户</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">日期</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">金额</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">状态</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedOrders.map(order => (
                        <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={selectedOrderIds.includes(order.id)}
                              onChange={(e) => toggleOrderSelection(order.id, e.target.checked)}
                            />
                          </td>
                          <td className="py-3 px-4 font-medium">{order.orderNo}</td>
                          <td className="py-3 px-4 font-mono text-sm text-slate-600">{order.customerId}</td>
                          <td className="py-3 px-4 text-slate-600">{order.customer}</td>
                          <td className="py-3 px-4 text-slate-600">{order.date}</td>
                          <td className="py-3 px-4">{formatCurrency(order.amount)}</td>
                          <td className="py-3 px-4">
                            <Badge className={statusColors[order.status]}>{order.status}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/orders/${order.id}`}>详情</Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {paginatedOrders.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">
                            当前筛选条件下没有匹配的订单
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>每页</span>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm outline-none"
                    >
                      {[10, 20, 50].map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                    <span>条</span>
                    <span className="ml-3">
                      第 {safeCurrentPage} / {totalPages} 页
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={safeCurrentPage <= 1}
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    >
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={safeCurrentPage >= totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inventory */}
          {activeTab === 'inventory' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>库存列表</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline">入库</Button>
                  <Button variant="outline">出库</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-medium text-slate-600">产品编码</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">产品名称</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">当前库存</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">安全库存</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">单价</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockInventory.map(product => (
                        <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono text-sm">{product.code}</td>
                          <td className="py-3 px-4 font-medium">{product.name}</td>
                          <td className="py-3 px-4">
                            <span className={product.status === 'low' ? 'text-red-600 font-medium' : ''}>
                              {product.stock}{product.unit}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{product.safeStock}{product.unit}</td>
                          <td className="py-3 px-4">¥{product.price}</td>
                          <td className="py-3 px-4">
                            <Badge className={statusColors[product.status]}>
                              {product.status === 'low' ? '库存不足' : '正常'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Finance */}
          {activeTab === 'finance' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>财务记录</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline">收款</Button>
                  <Button variant="outline">付款</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-medium text-slate-600">日期</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">类型</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">对方</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">金额</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">方式</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockFinance.map(record => (
                        <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-600">{record.date}</td>
                          <td className="py-3 px-4">
                            <Badge className={record.type === '收款' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                              {record.type}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{record.customer || record.supplier}</td>
                          <td className="py-3 px-4 font-medium">
                            <span className={record.type === '收款' ? 'text-green-600' : 'text-red-600'}>
                              {record.type === '收款' ? '+' : '-'}¥{record.amount.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{record.method}</td>
                          <td className="py-3 px-4">
                            <Badge className="bg-green-100 text-green-700">{record.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* AI Chat Button - ERP智能助手 */}
      {showErpAssistant && (
        <button
        onClick={() => setChatOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center text-white hover:scale-110 transition-transform z-40',
          chatOpen && 'hidden'
        )}
      >
        <Bot className="w-7 h-7" />
      </button>
      )}
      {/* Dify Chat Button - 火箭图标 */}
      <button
        onClick={() => setDifyOpen(true)}
        className={cn(
          'fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-full shadow-lg shadow-orange-500/30 flex items-center justify-center text-white hover:scale-110 transition-transform z-40',
          difyOpen && 'hidden'
        )}
      >
        <Rocket className="w-7 h-7" />
      </button>

      {/* Dify Chat Panel */}
      {difyOpen && <DifyChat onClose={() => setDifyOpen(false)} />}

      <Dialog open={createOrderOpen} onOpenChange={setCreateOrderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建订单</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">客户</label>
              <select
                value={orderForm.customerId}
                onChange={(e) => handleOrderFormChange('customerId', e.target.value)}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none"
              >
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} / {customer.company}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">订单日期</label>
              <Input
                type="date"
                value={orderForm.orderDate}
                onChange={(e) => handleOrderFormChange('orderDate', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">商品名称</label>
              <Input
                value={orderForm.productName}
                onChange={(e) => handleOrderFormChange('productName', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">数量</label>
                <Input
                  type="number"
                  min="1"
                  value={orderForm.quantity}
                  onChange={(e) => handleOrderFormChange('quantity', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">单价</label>
                <Input
                  type="number"
                  min="0"
                  value={orderForm.price}
                  onChange={(e) => handleOrderFormChange('price', e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">收货地址</label>
              <Input
                value={orderForm.shippingAddress}
                onChange={(e) => handleOrderFormChange('shippingAddress', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">状态</label>
              <select
                value={orderForm.status}
                onChange={(e) => handleOrderFormChange('status', e.target.value)}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none"
              >
                {orderStatusOptions.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
              订单金额：¥ {orderTotalAmount.toLocaleString()}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOrderOpen(false)}>取消</Button>
            <Button
              onClick={handleCreateOrder}
              disabled={!orderForm.productName || !orderForm.price || !orderForm.shippingAddress}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Chat Panel */}
      {showErpAssistant && chatOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-end p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            {/* Chat Header */}
            <div className="h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">ERP 智能助手</h3>
                  <p className="text-xs text-blue-100">在线</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChatOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex gap-3',
                      msg.role === 'user' && 'flex-row-reverse'
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
                        msg.role === 'user'
                          ? 'bg-emerald-500'
                          : 'bg-blue-500'
                      )}
                    >
                      {msg.role === 'user' ? (
                        <span className="text-white text-xs font-medium">我</span>
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-2',
                        msg.role === 'user'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-700'
                      )}
                    >
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {msg.content}
                      </pre>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-100 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="p-4 border-t border-slate-200 shrink-0">
              <form onSubmit={handleChat} className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="输入您的问题..."
                  className="flex-1"
                  disabled={chatLoading}
                />
                <Button type="submit" disabled={!chatInput.trim() || chatLoading}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <div className="flex gap-2 mt-2">
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setChatInput('查看客户列表')}>客户列表</Button>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setChatInput('查看订单')}>订单查询</Button>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setChatInput('生成报表')}>经营报表</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
