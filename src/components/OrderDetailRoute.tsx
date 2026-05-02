'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, MapPin, Package2, UserRound } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  formatCurrency,
  mergeOrderDetail,
  readOrderOverrides,
  statusColors,
  type OrderDetailRecord,
} from '@/lib/order-detail-data';

interface Props {
  orderId: string;
}

export default function OrderDetailRoute({ orderId }: Props) {
  const [order, setOrder] = useState<OrderDetailRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadOrder() {
      setLoading(true);

      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          if (!cancelled) {
            setOrder(null);
          }
          return;
        }

        const data = (await response.json()) as { order?: OrderDetailRecord };
        const nextOrder = data.order ? mergeOrderDetail(data.order, readOrderOverrides()[data.order.id]) : null;

        if (!cancelled) {
          setOrder(nextOrder);
        }
      } catch {
        if (!cancelled) {
          setOrder(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-slate-500">订单详情加载中...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-slate-500">订单不存在或已被删除</p>
          <Link href="/?tab=orders" className="mt-4 inline-flex text-sm font-medium text-blue-600">
            返回订单管理
          </Link>
        </div>
      </div>
    );
  }

  const itemCount = order.detailItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/?tab=orders" className="inline-flex items-center gap-1 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" />
              返回订单管理
            </Link>
            <span>/</span>
            <span>订单详情</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">{order.orderNo}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Badge className={statusColors[order.status]}>{order.status}</Badge>
              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  下单日期：{order.date}
                </span>
                <span className="inline-flex items-center gap-1">
                  <UserRound className="h-4 w-4" />
                  客户：{order.customer} / {order.customerId}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Package2 className="h-4 w-4" />
                  商品数量：{itemCount}
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900 px-4 py-5 text-white">
              <p className="text-sm text-slate-300">订单金额</p>
              <p className="mt-2 text-3xl font-semibold">{formatCurrency(order.amount)}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>基础信息</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">客户名称</p>
                  <p className="mt-1 font-medium text-slate-900">
                    {order.contactName} / {order.company}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">联系电话</p>
                  <p className="mt-1 font-medium text-slate-900">{order.phone}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">客户 ID</p>
                  <p className="mt-1 font-medium text-slate-900">{order.customerId}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">销售负责人</p>
                  <p className="mt-1 font-medium text-slate-900">{order.salesperson}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 md:col-span-2">
                  <p className="text-sm text-slate-500">收货地址</p>
                  <p className="mt-1 font-medium text-slate-900">{order.address}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>商品明细</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-3 py-3 text-left text-sm font-medium text-slate-500">商品ID</th>
                        <th className="px-3 py-3 text-left text-sm font-medium text-slate-500">商品名称</th>
                        <th className="px-3 py-3 text-left text-sm font-medium text-slate-500">规格型号</th>
                        <th className="px-3 py-3 text-left text-sm font-medium text-slate-500">数量</th>
                        <th className="px-3 py-3 text-left text-sm font-medium text-slate-500">成交单价</th>
                        <th className="px-3 py-3 text-right text-sm font-medium text-slate-500">小计金额</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.detailItems.map((item) => (
                        <tr key={`${order.id}-${item.productId}-${item.productName}`} className="border-b border-slate-100 last:border-0">
                          <td className="px-3 py-4 font-mono text-sm text-slate-700">{item.productId}</td>
                          <td className="px-3 py-4 font-medium text-slate-900">{item.productName}</td>
                          <td className="px-3 py-4 text-slate-600">{item.spec}</td>
                          <td className="px-3 py-4 text-slate-600">{item.quantity}</td>
                          <td className="px-3 py-4 text-slate-600">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-3 py-4 text-right font-medium text-slate-900">{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>金额汇总</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 px-4 py-5 text-white">
                  <p className="text-sm text-slate-300">订单金额</p>
                  <p className="mt-2 text-3xl font-semibold">{formatCurrency(order.amount)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>配送信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="h-4 w-4" />
                    配送地址
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{order.address}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                  <p>物流公司：{order.shippingCompany}</p>
                  <p className="mt-2">物流单号：{order.trackingNo}</p>
                  <p className="mt-2">付款方式：{order.paymentMethod}</p>
                  <p className="mt-2">发票抬头：{order.invoiceTitle}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
