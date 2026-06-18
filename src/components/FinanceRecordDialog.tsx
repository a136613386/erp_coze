'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  financeStatusOptions,
  paymentMethodOptions,
  type CustomerOption,
  type FinanceListItem,
  type OrderOption,
} from '@/lib/erp-client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const financeFormSchema = z.object({
  financeDate: z.string().min(1, '请选择日期'),
  amount: z.coerce.number().positive('金额必须大于 0'),
  paymentMethod: z.enum(paymentMethodOptions),
  status: z.enum(financeStatusOptions),
  customerId: z.string().optional().default(''),
  orderId: z.string().optional().default(''),
  counterparty: z.string().trim().optional().default(''),
  remark: z.string().trim().optional().default(''),
});

type FinanceFormValues = z.infer<typeof financeFormSchema>;

interface FinanceRecordDialogProps {
  customers: CustomerOption[];
  open: boolean;
  orders: OrderOption[];
  submitting: boolean;
  title: FinanceListItem['type'];
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: {
    type: FinanceListItem['type'];
    financeDate: string;
    amount: number;
    paymentMethod: FinanceListItem['paymentMethod'];
    status: FinanceListItem['status'];
    customerId?: number;
    orderId?: number;
    counterparty?: string;
    remark?: string;
  }) => Promise<boolean>;
}

export default function FinanceRecordDialog({
  customers,
  open,
  orders,
  submitting,
  title,
  onOpenChange,
  onSubmit,
}: FinanceRecordDialogProps) {
  const form = useForm<z.input<typeof financeFormSchema>, unknown, FinanceFormValues>({
    resolver: zodResolver(financeFormSchema),
    defaultValues: {
      financeDate: new Date().toISOString().slice(0, 10),
      amount: 0,
      paymentMethod: '银行转账',
      status: '已确认',
      customerId: '',
      orderId: '',
      counterparty: '',
      remark: '',
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        financeDate: new Date().toISOString().slice(0, 10),
        amount: 0,
        paymentMethod: '银行转账',
        status: '已确认',
        customerId: '',
        orderId: '',
        counterparty: '',
        remark: '',
      });
    }
  }, [form, open]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const ok = await onSubmit({
      type: title,
      financeDate: values.financeDate,
      amount: values.amount,
      paymentMethod: values.paymentMethod,
      status: values.status,
      customerId: values.customerId ? Number(values.customerId) : undefined,
      orderId: values.orderId ? Number(values.orderId) : undefined,
      counterparty: values.counterparty || undefined,
      remark: values.remark || undefined,
    });

    if (ok) {
      form.reset({
        financeDate: new Date().toISOString().slice(0, 10),
        amount: 0,
        paymentMethod: '银行转账',
        status: '已确认',
        customerId: '',
        orderId: '',
        counterparty: '',
        remark: '',
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !submitting && onOpenChange(nextOpen)}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>录入 {title} 记录后，财务表会实时刷新。</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="financeDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>日期</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>金额</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0.01}
                        step="0.01"
                        value={(field.value as string | number | undefined) ?? ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>客户</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="可选，选择客户" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={String(customer.id)}>
                            {customer.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="orderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>订单</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="可选，选择订单" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {orders.map((order) => (
                          <SelectItem key={order.id} value={String(order.id)}>
                            {order.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>支付方式</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="请选择支付方式" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethodOptions.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>状态</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="请选择状态" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {financeStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="counterparty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>对方名称</FormLabel>
                  <FormControl>
                    <Input placeholder={title === '付款' ? '付款时建议填写供应商或收款方' : '可选，未填会自动取客户名'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>备注</FormLabel>
                  <FormControl>
                    <Input placeholder="可选，填写备注" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                取消
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                提交
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
