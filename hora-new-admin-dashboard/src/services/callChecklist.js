import axios from "axios";
import { BASE_URL, DELETE_CHECKLIST_IMAGE, MULTI_IMAGE_UPLOAD, UPDATE_CALL_CHECKLIST, SAVE_CALL_CHECKLIST } from "@/utils/apiconstant";

export const deleteChecklistImageApi = (payload) => {
  return axios.post(`${BASE_URL}${DELETE_CHECKLIST_IMAGE}`, payload);
};

export const uploadChecklistImagesApi = (formData) => {
  return axios.post(
    `${BASE_URL}${MULTI_IMAGE_UPLOAD}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" }
    }
  );
};

export const updateCallChecklistApi = (id, payload) => {
  return axios.put(`${BASE_URL}${UPDATE_CALL_CHECKLIST}/${id}`, payload);
};

export const saveCallChecklistApi = (payload) => {
  return axios.post(`${BASE_URL}${SAVE_CALL_CHECKLIST}`, payload);
};