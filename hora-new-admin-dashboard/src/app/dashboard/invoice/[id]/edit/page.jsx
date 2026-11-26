'use client';
import { useParams } from 'next/navigation';
import InvoiceForm from '../../../../component/invoice/InvoiceForm';

export default function EditInvoice() {
  const { id } = useParams();
  return <InvoiceForm id={id} />;
}