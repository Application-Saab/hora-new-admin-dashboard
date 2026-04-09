import axios from "axios";
import { BASE_URL } from "../../../utils/apiconstant";

export const updateSupplierDetailsApi = (id, payload, authToken) => {
  return axios.post(
    `${BASE_URL}/api/users/supplier_personal_details_update/${id}`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
    }
  );
};