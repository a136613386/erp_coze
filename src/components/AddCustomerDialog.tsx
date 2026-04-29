'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  createCustomerSchema,
  customerLevelOptions,
  type CreateCustomerInput,
  type CustomerListItem,
} from '@/lib/customer-management';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddCustomerDialogProps {
  existingCustomers: CustomerListItem[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateCustomerInput) => Promise<boolean>;
  open: boolean;
  submitting: boolean;
}

type CreateCustomerFormValues = z.input<typeof createCustomerSchema>;

export default function AddCustomerDialog({
  existingCustomers,
  onOpenChange,
  onSubmit,
  open,
  submitting,
}: AddCustomerDialogProps) {
  const form = useForm<CreateCustomerFormValues, unknown, CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: '',
      company: '',
      phone: '',
      level: '新客户',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        name: '',
        company: '',
        phone: '',
        level: '新客户',
      });
    }
  }, [form, open]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const ok = await onSubmit(values);
    if (ok) {
      form.reset({
        name: '',
        company: '',
        phone: '',
        level: '新客户',
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !submitting && onOpenChange(nextOpen)}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>添加客户</DialogTitle>
          <DialogDescription>
            录入客户基础信息后，系统将自动生成客户 ID、订单数、累计金额、创建时间和更新时间。
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>客户名称</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入客户名称" maxLength={30} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>公司名称</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入公司名称" maxLength={60} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                rules={{
                  validate: (value) => {
                    if (!/^1\d{10}$/.test(value)) return true;
                    const duplicated = existingCustomers.some((customer) => customer.phone === value);
                    return duplicated ? '该手机号已存在客户' : true;
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>联系电话</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        placeholder="请输入 11 位手机号"
                        maxLength={11}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>仅支持中国大陆 11 位手机号。</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>客户等级</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="请选择客户等级" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customerLevelOptions.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>选填，默认值为“新客户”。</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-800">系统自动生成</p>
              <p className="mt-2">客户 ID、订单数（默认 0）、累计金额（默认 0）、创建时间、更新时间</p>
            </div>

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
