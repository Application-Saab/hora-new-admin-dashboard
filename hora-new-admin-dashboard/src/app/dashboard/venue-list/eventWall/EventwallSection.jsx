// EventWallSection.jsx

"use client";
import React, { useState } from "react";
import VenueGallerySection from "./EventwallGalleryItem";
import {
  saveFileToOPFS,
  processImagesWithHeight,
} from "./eventWallHelpers";
import {
  addToQueue,
} from "./handleMediaUpload";

function EventWallSection({ customerId, venueId }) {
  const MAX_FILES = 10;
  const [allImages, setAllImages] = useState([]);

  /*
  =========================================
  UPLOAD IMAGES
  =========================================
  */

  const handleUploadPictureClick = async () => {

    const input = document.createElement("input");

    input.type = "file";

    input.accept = "image/*,video/*";

    input.multiple = true;

    input.onchange = async (e) => {

      const files = Array.from(e.target.files || []);

      if (files.length > MAX_FILES) {
        alert(`Maximum ${MAX_FILES} files allowed`);
        return;
      }

      const optimisticItems = [];

      const now = Date.now();

      for (const file of files) {

        const id = crypto.randomUUID();

        const isVideo = file.type.startsWith("video/");

        const localPreview = URL.createObjectURL(file);

        /*
        =========================================
        QUEUE ITEM
        =========================================
        */

        const queueItem = {
          id,
          venueId,
          customerId,
          fileName: file.name,
          mimeType: file.type,
          isVideo,
          status: "queued",
          progress: 0,
          retryCount: 0,
          createdAt: now,
        };

        /*
        =========================================
        SAVE TO OPFS CACHE
        =========================================
        */

        const saved = await saveFileToOPFS(
          file,
          venueId,
          id
        );

        if (!saved) {
          console.warn("OPFS save failed");
          continue;
        }

        /*
        =========================================
        SAVE TO INDEX DB
        =========================================
        */

        await addToQueue(queueItem);

        /*
        =========================================
        TEMP UI IMAGE
        =========================================
        */

        optimisticItems.push({
          id,
          localPreview,
          isVideo,
          progress: 0,
          status: "queued",
          postType: "selfUploaded",
        });
      }

      /*
      =========================================
      PROCESS IMAGE HEIGHT
      =========================================
      */

      if (optimisticItems.length > 0) {

        const processed =
          await processImagesWithHeight(
            optimisticItems
          );

        setAllImages((prev) => [
          ...processed,
          ...prev,
        ]);
      }
    };

    input.click();
  };

  return (
    <div className="event-wall-section">

      <button onClick={handleUploadPictureClick}>
        Upload Picture
      </button>

      <VenueGallerySection
        allImages={allImages}
      />

    </div>
  );
}

export default EventWallSection;