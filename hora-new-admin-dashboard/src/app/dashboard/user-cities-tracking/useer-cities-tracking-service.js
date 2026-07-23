import axios from "axios";
import { BASE_URL, GET_CITY_TRACKING_LIST } from "@/utils/apiconstant";

export const fetchUserCitiesTracking = async ({
  setLoading,
  setData,
  setPagination,
  page = 1,
  limit = 10,
  search = "",
  cityName = "",
  startDate,
  endDate,
  setStats,
  searchedUsers,
  eventDateUsers,
  whatsappUsers,
  loggedInUsers
}) => {
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
        loggedInUsers
      },
    });

    setData(res.data.data.cityList || []);
    setPagination(res.data.data.pagination);
    setStats(res.data.data.stats);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};
