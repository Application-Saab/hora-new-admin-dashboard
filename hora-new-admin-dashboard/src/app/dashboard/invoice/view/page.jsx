'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import InvoiceDetail from '@/app/component/invoice/InvoiceDetail';


// (static export has no dynamic [orderId] route, so the id comes from the query)
const Message = ({ children }) => <p style={{ padding: 16 }}>{children}</p>;

function Inner() {
  const orderId = useSearchParams().get('order');
  return orderId ? <InvoiceDetail key={orderId} orderId={orderId} /> : <Message>Order ID not found.</Message>;
}

export default function InvoiceViewPage() {
  return (
    <Suspense fallback={<Message>Loading...</Message>}>
      <Inner />
    </Suspense>
  );
}