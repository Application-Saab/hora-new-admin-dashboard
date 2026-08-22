import axios from "axios";
import { BASE_URL, GET_CITY_TRACKING_LIST } from "@/utils/apiconstant";

let latestRequestId = 0;

export const fetchUserCitiesTracking = async ({
  setLoading,
  setData,
  setPagination,
  setStats,

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
  const requestId = ++latestRequestId;

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
    if (requestId !== latestRequestId) {
      return;
    }

    const responseData = res?.data?.data;

    setData(responseData?.cityList || []);

    setPagination(responseData?.pagination || {});

    setStats(responseData?.stats || {});
  } catch (err) {
    if (
      axios.isCancel(err) ||
      err?.name === "CanceledError" ||
      signal?.aborted
    ) {
      return;
    }

    console.error("User Cities Tracking API Error:", err);
  } finally {
    if (requestId === latestRequestId && !signal?.aborted) {
      setLoading(false);
    }
  }
};
