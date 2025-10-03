// import { useEffect, useRef } from 'react';
// import { useProjectStore } from '../testing/useProjectStore';
// import { fabric } from 'fabric';

// export default function Editor() {
//   const canvasRef = useRef(null);
//   const fabricCanvasRef = useRef(null);
//   const { pages, images, assignImageToFrame } = useProjectStore();

//   useEffect(() => {
//     if (!fabricCanvasRef.current) {
//       const canvas = new fabric.Canvas(canvasRef.current, {
//         width: 1200,
//         height: 900,
//         backgroundColor: '#fff'
//       });
//       fabricCanvasRef.current = canvas;
//     }

//     const canvas = fabricCanvasRef.current;
//     canvas.clear();

//     if (pages.length === 0) return;

//     const page = pages[0]; // for demo, just first page

//     page.frames.forEach(frame => {
//       // Draw frame
//       const rect = new fabric.Rect({
//         left: frame.x,
//         top: frame.y,
//         width: frame.width,
//         height: frame.height,
//         fill: 'transparent',
//         stroke: frame.imageId ? 'green' : '#aaa',
//         strokeWidth: 2,
//         selectable: false
//       });

//       // Make frame clickable
//       rect.on('mousedown', () => handleFrameClick(frame.id));
//       canvas.add(rect);

//       // Show image if already assigned
//       if (frame.imageId && images[frame.imageId]) {
//         fabric.Image.fromURL(images[frame.imageId], (img) => {
//           img.set({
//             left: frame.x,
//             top: frame.y,
//             width: frame.width,
//             height: frame.height,
//             selectable: true
//           });
//           canvas.add(img);
//           canvas.renderAll();
//         });
//       }
//     });

//     canvas.renderAll();
//   }, [pages, images]);

//   const handleFrameClick = (frameId) => {
//     const input = document.createElement('input');
//     input.type = 'file';
//     input.accept = 'image/*';
//     input.onchange = (e) => {
//       const file = e.target.files[0];
//       if (file) {
//         const pageId = pages[0].id;
//         assignImageToFrame(pageId, frameId, file);

//         const reader = new FileReader();
//         reader.onload = (f) => {
//           fabric.Image.fromURL(f.target.result, (img) => {
//             const frame = pages[0].frames.find(f => f.id === frameId);
//             img.set({
//               left: frame.x,
//               top: frame.y,
//               width: frame.width,
//               height: frame.height,
//               selectable: true
//             });
//             fabricCanvasRef.current.add(img);
//             fabricCanvasRef.current.renderAll();
//           });
//         };
//         reader.readAsDataURL(file);
//       }
//     };
//     input.click();
//   };

//   return (
//     <div className="inline-block relative border">
//       <canvas ref={canvasRef} />
//     </div>
//   );
// }

"use client";
import { useEffect, useRef, useState } from "react";
import { useProjectStore } from "../testing/useProjectStore";
import { fabric } from "fabric";

export default function Editor() {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const { pages, images, assignImageToFrame } = useProjectStore();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Initialize fabric canvas
  useEffect(() => {
    if (!fabricCanvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 1200,
        height: 900,
        backgroundColor: "#fff",
      });
      fabricCanvasRef.current = canvas;
    }
  }, []);

  // Render whenever pages/images/currentPageIndex changes
  useEffect(() => {
    if (!pages.length) return;

    const canvas = fabricCanvasRef.current;
    canvas.clear();

    const page = pages[currentPageIndex];
    if (!page) return;

    // Optional: load background if provided in template JSON
    if (page.background) {
      fabric.Image.fromURL(page.background, (bg) => {
        bg.set({
          left: 0,
          top: 0,
          selectable: false,
          evented: false,
        });
        bg.scaleToWidth(canvas.width);
        canvas.setBackgroundImage(bg, canvas.renderAll.bind(canvas));
      });
    }

    // Draw frames
    page.frames.forEach((frame) => {
      const rect = new fabric.Rect({
        left: frame.x,
        top: frame.y,
        width: frame.width,
        height: frame.height,
        fill: "transparent",
        stroke: frame.imageId ? "green" : "#aaa",
        strokeWidth: 2,
        selectable: false,
      });

      // Make frame clickable
      rect.on("mousedown", () => handleFrameClick(page.id, frame.id));
      canvas.add(rect);

      // Render existing images
      if (frame.imageId && images[frame.imageId]) {
        fabric.Image.fromURL(images[frame.imageId], (img) => {
          img.set({
            left: frame.x,
            top: frame.y,
            width: frame.width,
            height: frame.height,
            selectable: true, // allow resizing/moving if needed
          });
          img.scaleToWidth(frame.width);
          canvas.add(img);
          canvas.renderAll();
        });
      }
    });

    canvas.renderAll();
  }, [pages, images, currentPageIndex]);

  // Upload image handler
  const handleFrameClick = (pageId, frameId) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        assignImageToFrame(pageId, frameId, file);

        // Show immediately on canvas
        const reader = new FileReader();
        reader.onload = (f) => {
          fabric.Image.fromURL(f.target.result, (img) => {
            const page = pages.find((p) => p.id === pageId);
            const frame = page.frames.find((f) => f.id === frameId);
            img.set({
              left: frame.x,
              top: frame.y,
              width: frame.width,
              height: frame.height,
              selectable: true,
            });
            img.scaleToWidth(frame.width);
            fabricCanvasRef.current.add(img);
            fabricCanvasRef.current.renderAll();
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} className="border" />

      {/* Page navigation buttons */}
      <div className="flex gap-4 mt-4">
        <button
          className="px-4 py-2 bg-gray-200 rounded"
          onClick={() =>
            setCurrentPageIndex((i) => Math.max(0, i - 1))
          }
          disabled={currentPageIndex === 0}
        >
          ⬅ Prev Page
        </button>
        <span>
          Page {currentPageIndex + 1} / {pages.length}
        </span>
        <button
          className="px-4 py-2 bg-gray-200 rounded"
          onClick={() =>
            setCurrentPageIndex((i) =>
              Math.min(pages.length - 1, i + 1)
            )
          }
          disabled={currentPageIndex === pages.length - 1}
        >
          Next Page ➡
        </button>
      </div>
    </div>
  );
}
