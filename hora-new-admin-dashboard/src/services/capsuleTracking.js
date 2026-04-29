import axios from "axios";

import {
  BASE_URL,
} from "@/utils/apiconstant";

export const getCapsuleTracking = async (params) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/internal/capsule-tracking`, {
      params
    });

    return {
      data: response?.data?.data || [],
      pagination: response?.data?.pagination || {},
    };
  } catch (error) {
    console.error("Capsule Tracking API Error:", error);
    throw error;
  }
};