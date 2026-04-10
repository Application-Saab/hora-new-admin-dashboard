import {
  BASE_URL,
  GET_WONDERLAND_GLOBAL_STATS,
  GET_WONDERLAND_LISTING_DATA,
} from "@/utils/apiconstant";
import axios from "axios";

export const fetchWonderlandListingData = async (
  setLoading,
  setData,
  setPagination,
  type,
  page,
  search,
  dateFilter,
) => {
  try {
    setLoading(true);

    const res = await axios.post(`${BASE_URL}${GET_WONDERLAND_LISTING_DATA}`, {
      type,
      page,
      per_page: 10,
      search,
      dateFilter,
    });

    setData(res.data.data.data);
    setPagination(res.data.data.paginate);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

export const fetchWonderlandStats = async (setStats) => {
  try {
    const res = await axios.get(`${BASE_URL}${GET_WONDERLAND_GLOBAL_STATS}`);
    setStats(res.data.data);
  } catch (err) {
    console.error(err);
  }
};
