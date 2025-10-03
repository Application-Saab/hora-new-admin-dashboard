import { create } from 'zustand';
import { v4 as uuid } from 'uuid';

const PAGE_LAYOUTS = {
  '3-large': [
    { x: 100, y: 200, width: 400, height: 300 },
    { x: 600, y: 200, width: 400, height: 300 },
    { x: 350, y: 600, width: 400, height: 300 }
  ],
  '5-small': [
    { x: 100, y: 150, width: 200, height: 150 },
    { x: 350, y: 150, width: 200, height: 150 },
    { x: 600, y: 150, width: 200, height: 150 },
    { x: 225, y: 350, width: 200, height: 150 },
    { x: 475, y: 350, width: 200, height: 150 }
  ]
};

export const useProjectStore = create((set, get) => ({
  // Project data
  pages: [],
  images: {}, // { imageId: url }

  // Initialize from template
  initFromTemplate: async (templateId) => {
    const res = await fetch(`/templates/${templateId}.json`);
    const template = await res.json();
    const pages = template.pages.map(page => ({
      ...page,
      frames: page.frames.map(f => ({ ...f, imageId: null }))
    }));
    set({ pages });
  },

  // Add new page
  addPage: (layoutType) => {
    const layout = PAGE_LAYOUTS[layoutType];
    if (!layout) return;
    const newPage = {
      id: `page-${uuid()}`,
      layout: layoutType,
      frames: layout.map((frame, i) => ({
        ...frame,
        id: `frame-${uuid()}`,
        imageId: null
      }))
    };
    set(state => ({ pages: [...state.pages, newPage] }));
  },

  // Remove page
  removePage: (pageId) => {
    set(state => ({ pages: state.pages.filter(p => p.id !== pageId) }));
  },

  // Assign image to frame
  assignImageToFrame: (pageId, frameId, imageFile) => {
    const imageUrl = URL.createObjectURL(imageFile);
    const imageId = uuid();
    set(state => {
      const pages = state.pages.map(page => {
        if (page.id === pageId) {
          return {
            ...page,
            frames: page.frames.map(f =>
              f.id === frameId ? { ...f, imageId } : f
            )
          };
        }
        return page;
      });
      return {
        pages,
        images: { ...state.images, [imageId]: imageUrl }
      };
    });
  }
}));