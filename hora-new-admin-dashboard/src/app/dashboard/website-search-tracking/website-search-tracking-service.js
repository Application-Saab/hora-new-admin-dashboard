import axios from "axios";
import { BASE_URL, GET_SEARCH_TRACKING_LIST, GET_SEARCH_TRACKING_STATS } from "@/utils/apiconstant";

export const fetchWebsiteSearchTracking = async ({
  setLoading,
  setData,
  setPagination,
  page = 1,
  limit = 10,
  search = "",
  clickedType = "",
}) => {
  try {
    setLoading(true);

    const res = await axios.get(`${BASE_URL}${GET_SEARCH_TRACKING_LIST}`, {
      params: {
        page,
        limit,
        search,
        clickedType,
      },
    });

    setData(res.data.data.trackingList);
    setPagination(res.data.data.pagination);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

export const fetchWebsiteSearchStats = async (
  setStats,
  startDate = "",
  endDate = "",
) => {
  try {
    const res = await axios.get(`${BASE_URL}${GET_SEARCH_TRACKING_STATS}`, {
      params: {
        startDate,
        endDate,
      },
    });

    setStats(res.data.data);
  } catch (err) {
    console.error(err);
  }
};
