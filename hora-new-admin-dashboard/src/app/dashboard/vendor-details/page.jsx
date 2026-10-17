import { Suspense } from "react";
import EditVendorDetails from '../../component/EditVendorDetails';
// export const dynamic = "force-dynamic";

export default function VendorDetailsPage() {
  return (
    <Suspense fallback={
      <div className="ed-loader-wrap">
        <div className="ed-loader" />
      </div>
    }>
      <EditVendorDetails />
    </Suspense>
  );
}