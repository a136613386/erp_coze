'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { inventoryStatusOptions, type InventoryOption } from '@/lib/erp-client';
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

const stockMovementSchema = z.object({
  productId: z.string().min(1, '请选择商品'),
  status: z.enum(inventoryStatusOptions),
  quantity: z.coerce.number().int().positive('数量必须大于 0'),
  operatorName: z.string().trim().min(1, '请输入操作人'),
  remark: z.string().trim().optional().default(''),
});

type StockMovementFormValues = z.infer<typeof stockMovementSchema>;

interface StockMovementDialogProps {
  open: boolean;
  products: InventoryOption[];
  submitting: boolean;
  title: '入库' | '出库';
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: {
    productId: number;
    type: '入库' | '出库';
    status: '正常' | '库存不足';
    quantity: number;
    operatorName: string;
    remark: string;
  }) => Promise<boolean>;
}

export default function StockMovementDialog({
  open,
  products,
  submitting,
  title,
  onOpenChange,
  onSubmit,
}: StockMovementDialogProps) {
  const form = useForm<z.input<typeof stockMovementSchema>, unknown, StockMovementFormValues>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: {
      productId: '',
      status: '正常',
      quantity: 1,
      operatorName: '管理员',
      remark: '',
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        productId: '',
        status: '正常',
        quantity: 1,
        operatorName: '管理员',
        remark: '',
      });
    }
  }, [form, open]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const ok = await onSubmit({
      productId: Number(values.productId),
      type: title,
      status: values.status,
      quantity: values.quantity,
      operatorName: values.operatorName,
      remark: values.remark ?? '',
    });

    if (ok) {
      form.reset({
        productId: '',
        status: '正常',
        quantity: 1,
        operatorName: '管理员',
        remark: '',
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !submitting && onOpenChange(nextOpen)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>执行 {title} 后，库存数量与状态会一起刷新。</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>商品</FormLabel>
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

            <div className="grid gap-4 sm:grid-cols-2">
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
                        {inventoryStatusOptions.map((status) => (
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

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>数量</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="operatorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>操作人</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入操作人" {...field} />
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
