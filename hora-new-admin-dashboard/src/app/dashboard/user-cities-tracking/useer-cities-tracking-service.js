import axios from "axios";
import { BASE_URL, GET_CITY_TRACKING_LIST, GET_CITY_TRACKING_STATS } from "@/utils/apiconstant";

let latestListRequestId = 0;
let latestStatsRequestId = 0;

export const fetchUserCitiesTrackingList = async ({
  setLoading,
  setData,
  setPagination,
  page = 1,
  limit = 10,
  search = "",
  cityName = "",
  startDate = "",
  endDate = "",
  searchedUsers = false,
  eventDateUsers = false,
  whatsappUsers = false,
  loggedInUsers = false,
  signal,
}) => {
  const requestId = ++latestListRequestId;

  try {
    setLoading(true);

    const res = await axios.get(`${BASE_URL}${GET_CITY_TRACKING_LIST}`, {
      params: {
        page,
        limit,
        search,
        cityName,
        startDate,
        endDate,
        searchedUsers,
        eventDateUsers,
        whatsappUsers,
        loggedInUsers,
      },
      signal,
    });

    if (requestId !== latestListRequestId) return;

    const responseData = res?.data?.data;

    setData(responseData?.cityList || []);
    setPagination(responseData?.pagination || {});
  } catch (err) {
    if (axios.isCancel(err) || err?.name === "CanceledError" || signal?.aborted) {
      return;
    }
    console.error("User Cities Tracking List API Error:", err);
  } finally {
    if (requestId === latestListRequestId && !signal?.aborted) {
      setLoading(false);
    }
  }
};

export const fetchUserCitiesTrackingStats = async ({
  setStats,
  search = "",
  cityName = "",
  startDate = "",
  endDate = "",
  searchedUsers = false,
  eventDateUsers = false,
  whatsappUsers = false,
  loggedInUsers = false,
  signal,
}) => {
  const requestId = ++latestStatsRequestId;

  try {
    const res = await axios.get(`${BASE_URL}${GET_CITY_TRACKING_STATS}`, {
      params: {
        search,
        cityName,
        startDate,
        endDate,
        searchedUsers,
        eventDateUsers,
        whatsappUsers,
        loggedInUsers,
      },
      signal,
    });

    if (requestId !== latestStatsRequestId) return;

    const responseData = res?.data?.data;
    setStats(responseData?.stats || {});
  } catch (err) {
    if (axios.isCancel(err) || err?.name === "CanceledError" || signal?.aborted) {
      return;
    }
    console.error("User Cities Tracking Stats API Error:", err);
  }
};