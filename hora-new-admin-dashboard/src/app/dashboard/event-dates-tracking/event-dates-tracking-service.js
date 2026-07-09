import { BASE_URL, GET_EVENT_DATES_LISTING_DATA } from "@/utils/apiconstant";
import axios from "axios";

export const fetchEventDatesListingData = async ({
  setLoading,
  setData,
  setPagination,
  page = 1,
  limit = 10,
  search = "",
  startDate = "",
  endDate = "",
}) => {
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
    });
    setData(res.data.data.eventList);
    setPagination(res.data.data.pagination);
  } catch (err) {
    // ignore cancelled requests
    if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
      return;
    }

    console.error(err);
  } finally {
    setLoading(false);
  }
};
