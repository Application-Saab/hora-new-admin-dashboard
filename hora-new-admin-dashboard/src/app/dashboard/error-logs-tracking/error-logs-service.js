import axios from "axios";
import { BASE_URL, GET_ERROR_LOGS_LIST } from "@/utils/apiconstant";

export const fetchErrorLogs = async ({
  setLoading,
  setData,
  setPagination,
  page,
  search,
  type,
  startDate,
  endDate,
}) => {
  try {
    setLoading(true);

    const res = await axios.get(`${BASE_URL}${GET_ERROR_LOGS_LIST}`, {
      params: {
        page,
        search,
        type,
        startDate,
        endDate,
      },
    });

    setData(res.data.data.errorLogs);
    setPagination(res.data.data.pagination);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};
