'use client';

import { useState } from 'react';
import { 
  Users, ShoppingCart, Package, Wallet, BarChart3, 
  Settings, Bell, ChevronLeft, ChevronRight, Bot,
  X, Send, RefreshCw, AlertCircle, Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import DifyChat from '@/components/DifyChat';

type TabType = 'customers' | 'orders' | 'inventory' | 'finance' | 'dashboard';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// 模拟数据
const mockCustomers = [
  { id: 'C001', name: '张三', company: '北京科技有限公司', phone: '13800138001', level: 'VIP', totalOrders: 2, totalAmount: 83000 },
  { id: 'C002', name: '李四', company: '上海贸易集团', phone: '13800138002', level: '普通', totalOrders: 2, totalAmount: 21500 },
  { id: 'C003', name: '王五', company: '广州制造业公司', phone: '13800138003', level: '新客户', totalOrders: 1, totalAmount: 40000 },
  { id: 'C004', name: '赵六', company: '深圳电子科技', phone: '13800138004', level: 'VIP', totalOrders: 1, totalAmount: 65000 },
  { id: 'C005', name: '孙七', company: '成都软件园', phone: '13800138005', level: '普通', totalOrders: 0, totalAmount: 0 },
];

const mockOrders = [
  { id: 'ORD001', orderNo: 'ORD20240115001', customer: '张三', amount: 53000, status: '已完成', date: '2024-01-15', items: 2 },
  { id: 'ORD002', orderNo: 'ORD20240120002', customer: '李四', amount: 14000, status: '已发货', date: '2024-01-20', items: 1 },
  { id: 'ORD003', orderNo: 'ORD20240201003', customer: '张三', amount: 30000, status: '待付款', date: '2024-02-01', items: 2 },
  { id: 'ORD004', orderNo: 'ORD20240205004', customer: '王五', amount: 40000, status: '已付款', date: '2024-02-05', items: 1 },
  { id: 'ORD005', orderNo: 'ORD20240210005', customer: '赵六', amount: 65000, status: '待付款', date: '2024-02-10', items: 2 },
  { id: 'ORD006', orderNo: 'ORD20240212006', customer: '李四', amount: 7500, status: '已取消', date: '2024-02-12', items: 1 },
];

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

export default function ERPDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [difyOpen, setDifyOpen] = useState(false);

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

  const lowStockCount = mockInventory.filter(p => p.status === 'low').length;
  const pendingPaymentCount = mockOrders.filter(o => o.status === '待付款').length;

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
              {!sidebarCollapsed && item.id === 'orders' && pendingPaymentCount > 0 && (
                <Badge variant="destructive" className="ml-auto text-xs">{pendingPaymentCount}</Badge>
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
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              {(lowStockCount > 0 || pendingPaymentCount > 0) && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {lowStockCount + pendingPaymentCount}
                </span>
              )}
            </Button>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              管
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">客户总数</p>
                        <p className="text-3xl font-bold text-slate-800">{mockCustomers.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">订单总数</p>
                        <p className="text-3xl font-bold text-slate-800">{mockOrders.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">产品种类</p>
                        <p className="text-3xl font-bold text-slate-800">{mockInventory.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">本月销售额</p>
                        <p className="text-3xl font-bold text-slate-800">10.7万</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Alerts */}
              {(lowStockCount > 0 || pendingPaymentCount > 0) && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-orange-700 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      待处理事项
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {pendingPaymentCount > 0 && (
                        <p className="text-orange-600">• 有 {pendingPaymentCount} 笔订单待收款</p>
                      )}
                      {lowStockCount > 0 && (
                        <p className="text-orange-600">• 有 {lowStockCount} 种产品库存不足</p>
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
                      {mockOrders.slice(0, 5).map(order => (
                        <div key={order.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                          <div>
                            <p className="font-medium text-slate-800">{order.orderNo}</p>
                            <p className="text-sm text-slate-500">{order.customer}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">¥{order.amount.toLocaleString()}</p>
                            <Badge className={statusColors[order.status]}>{order.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>库存预警</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockInventory.filter(p => p.status === 'low').map(product => (
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
                      {mockInventory.filter(p => p.status === 'low').length === 0 && (
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
                      {mockCustomers.map(customer => (
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
                <Button>创建订单</Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-medium text-slate-600">订单号</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">客户</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">日期</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">金额</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">状态</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockOrders.map(order => (
                        <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 font-medium">{order.orderNo}</td>
                          <td className="py-3 px-4 text-slate-600">{order.customer}</td>
                          <td className="py-3 px-4 text-slate-600">{order.date}</td>
                          <td className="py-3 px-4">¥{order.amount.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <Badge className={statusColors[order.status]}>{order.status}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm">详情</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
