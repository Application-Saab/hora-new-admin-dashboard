import React from "react";
import ImageGalleryClient from "./ImageGalleryClient";

export default function Page() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <ImageGalleryClient />
    </React.Suspense>
  );
}