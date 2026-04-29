import OrderDetailRoute from '@/components/OrderDetailRoute';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return <OrderDetailRoute orderId={orderId} />;
}
