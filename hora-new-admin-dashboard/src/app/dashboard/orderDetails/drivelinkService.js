import axios from 'axios';
import {BASE_URL} from '../../../utils/apiconstant'

export const saveOrderDriveLinks = async (currentOrder, driveLinksInput) => {
  const linksToSend = driveLinksInput.filter(
    (item) => item.link && item.link.trim() !== ""
  );

  if (linksToSend.length === 0) {
    throw new Error("Please provide at least one valid Google Drive link.");
  }

  const rawPhotosRow = linksToSend.find((item) => item.linkType === "colorCorrectedPhotos");
  const rawFolderUrl = rawPhotosRow ? rawPhotosRow.link : "";

  const response = await axios.post(`${BASE_URL}/api/photo/drive/add-order-drive-link`, {
    order_id: currentOrder.order_id,
    allDriveLinks: linksToSend,
    folderUrl: rawFolderUrl
  });

  return response.data; 
};

export const inclusionToApiKeyMap = {
  "Color Corrected Photos": "colorCorrectedPhotos",
  "Edited Photos": "editedPhotos",
  "Teaser": "teaser", 
  "Edited Video": "editedVideo",
  "Drone Shoot": "droneShoot",
  "Edited Reel": "editedReel",
  "Album": "album",
  "Raw Video Clips": "rawVideoClips",
};

export const apiKeyToInclusionMap = {
  colorCorrectedPhotos: "Color Corrected Photos",
  editedPhotos: "Edited Photos",
  teaser: "Teaser",
  editedVideo: "Edited Video",
  droneShoot: "Drone Shoot",
  editedReel: "Edited Reel",
  album: "Album",
  rawVideoClips: "Raw Video Clips",
};