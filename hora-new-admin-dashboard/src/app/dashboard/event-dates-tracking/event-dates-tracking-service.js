import axios from "axios";
import { BASE_URL, GET_EVENT_DATES_LISTING_DATA } from "@/utils/apiconstant";
let latestRequestId = 0;

export const fetchEventDatesListingData = async ({
  setLoading,
  setData,
  setPagination,
  page = 1,
  limit = 10,
  search = "",
  startDate = "",
  endDate = "",
  signal,
}) => {
  const requestId = ++latestRequestId;
  try {
    setLoading(true);

    const res = await axios.get(`${BASE_URL}${GET_EVENT_DATES_LISTING_DATA}`, {
      params: {
        page,
        limit,
        search,
        startDate,
        endDate,
      },
      signal,
    });

    if (requestId !== latestRequestId) return;

    const responseData = res?.data?.data;
    setData(responseData?.eventList || []);
    setPagination(responseData?.pagination || {});
  } catch (err) {
    if (
      axios.isCancel(err) ||
      err?.name === "CanceledError" ||
      signal?.aborted
    ) {
      return;
    }

    console.error("Event Dates Listing API Error:", err);
  } finally {
    if (requestId === latestRequestId && !signal?.aborted) {
      setLoading(false);
    }
  }
};