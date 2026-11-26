'use client';
import { useParams } from 'next/navigation';
import InvoiceView from '../../../component/invoice/InvoiceView';

export default function ViewInvoice() {
  const { id } = useParams();
  return <InvoiceView id={id} />;
}
