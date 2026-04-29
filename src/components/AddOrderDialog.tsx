'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  orderStatusOptions,
  type CustomerOption,
  type InventoryOption,
  type OrderListItem,
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

const createOrderFormSchema = z.object({
  customerId: z.string().min(1, '请选择客户'),
  dealDate: z.string().min(1, '请选择成交日期'),
  status: z.enum(orderStatusOptions),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, '请选择商品'),
        quantity: z.coerce.number().int().positive('数量必须大于 0'),
      })
    )
    .min(1, '至少添加一个商品'),
});

type CreateOrderFormValues = z.infer<typeof createOrderFormSchema>;

interface AddOrderDialogProps {
  customers: CustomerOption[];
  open: boolean;
  products: InventoryOption[];
  submitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: {
    customerId: number;
    dealDate: string;
    status: OrderListItem['status'];
    items: { productId: number; quantity: number }[];
  }) => Promise<boolean>;
}

export default function AddOrderDialog({
  customers,
  open,
  products,
  submitting,
  onOpenChange,
  onSubmit,
}: AddOrderDialogProps) {
  const form = useForm<z.input<typeof createOrderFormSchema>, unknown, CreateOrderFormValues>({
    resolver: zodResolver(createOrderFormSchema),
    defaultValues: {
      customerId: '',
      dealDate: new Date().toISOString().slice(0, 10),
      status: '待付款',
      items: [{ productId: '', quantity: 1 }],
    },
  });

  const items = useFieldArray({
    control: form.control,
    name: 'items',
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        customerId: '',
        dealDate: new Date().toISOString().slice(0, 10),
        status: '待付款',
        items: [{ productId: '', quantity: 1 }],
      });
    }
  }, [form, open]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const ok = await onSubmit({
      customerId: Number(values.customerId),
      dealDate: values.dealDate,
      status: values.status,
      items: values.items.map((item) => ({
        productId: Number(item.productId),
        quantity: item.quantity,
      })),
    });

    if (ok) {
      form.reset({
        customerId: '',
        dealDate: new Date().toISOString().slice(0, 10),
        status: '待付款',
        items: [{ productId: '', quantity: 1 }],
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !submitting && onOpenChange(nextOpen)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>创建订单</DialogTitle>
          <DialogDescription>选择客户与商品后，系统会自动生成订单、订单明细并扣减库存。</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>客户</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="请选择客户" />
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
                name="dealDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>成交日期</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>订单状态</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="请选择状态" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {orderStatusOptions.map((status) => (
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

            <div className="space-y-3">
              {items.fields.map((item, index) => (
                <div key={item.id} className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1fr_120px_48px]">
                  <FormField
                    control={form.control}
                    name={`items.${index}.productId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{index === 0 ? '商品' : ' '}</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="请选择商品" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={String(product.id)}>
                                {product.label}
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
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{index === 0 ? '数量' : ' '}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
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

                  <div className="flex items-end pb-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => items.remove(index)}
                      disabled={items.fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={() => items.append({ productId: '', quantity: 1 })}>
                添加商品
              </Button>
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
