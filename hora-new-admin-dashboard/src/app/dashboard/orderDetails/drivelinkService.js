import axios from 'axios';
import {BASE_URL} from '../../../utils/apiconstant'

export const saveOrderDriveLinks = async (currentOrder, driveLinksInput) => {
  const linksToSend = driveLinksInput.filter(
    (item) => item.link && item.link.trim() !== ""
  );

  if (linksToSend.length === 0) {
    throw new Error("Please provide at least one valid Google Drive link.");
  }

  const rawPhotosRow = linksToSend.find((item) => item.linkType === "rawPhotos");
  const rawFolderUrl = rawPhotosRow ? rawPhotosRow.link : "";

  const response = await axios.post(`${BASE_URL}/api/photo/drive/add-order-drive-link`, {
    order_id: currentOrder.order_id,
    allDriveLinks: linksToSend,
    folderUrl: rawFolderUrl
  });

  return response.data; 
};

export const inclusionToApiKeyMap = {
  "Raw Photos": "rawPhotos",
  "Edited Photos": "editedPhotos",
  "Teaser": "teaser", 
  "Edited Video": "editedVideos",
  "Raw Video": "rawVideos",
  "Drone Shoot": "droneShoot",
  "Edited Reel": "editedReel"
};

export const apiKeyToInclusionMap = {
  rawPhotos: "Raw Photos",
  editedPhotos: "Edited Photos",
  teaser: "Teaser",
  editedVideos: "Edited Video",
  rawVideos: "Raw Video",
  droneShoot: "Drone Shoot",
  editedReel: "Edited Reel"
};