import axios from "axios";
import { BASE_URL } from "@/utils/apiconstant";

export const fetchVenues = async (
  setError,
  setLoading,
  setVenues,
  setPagination,
  page,
  search,
  venueType,
) => {
  try {
    setLoading(true);
    setError(null);

    const response = await axios.get(
      `${BASE_URL}/api/party-venue/venues-list`,
      {
        params: {
          page,
          limit: 10,
          search,
          venueType,
        },
      },
    );

    setVenues(response.data.data);

    setPagination({
      total_item: response.data.pagination.total,
      current_page: response.data.pagination.page,
      last_page: response.data.pagination.totalPages,
      next_page:
        response.data.pagination.page < response.data.pagination.totalPages
          ? response.data.pagination.page + 1
          : response.data.pagination.totalPages,
      previous_page:
        response.data.pagination.page > 1
          ? response.data.pagination.page - 1
          : 1,
      first_page: 1,
    });
  } catch (err) {
    console.log(
      "%c [ err ]",
      "font-size:13px; background:pink; color:#bf2c9f;",
      err,
    );
    setError("Error fetching venues");
  } finally {
    setLoading(false);
  }
};

export const fetchVenuePackages = async (venueId, setPackages, setLoading) => {
  try {
    setLoading(true);

    const res = await axios.get(
      `${BASE_URL}/api/party-venue/package/packages-by-venue-admin/${venueId}`,
    );

    setPackages(res.data.data || []);
  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
};

export const fetchPackageItems = async (
  setPackageItemsMaster,
  setFilteredItems,
) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/api/party-venue/package-item/items-list?itemsStatus=1&limit=500`,
    );

    setPackageItemsMaster(res.data.data || []);
    setFilteredItems(res.data.data || []);
  } catch (err) {
    console.log(err);
  }
};

export const fetchPackageCategories = async (setPackageCategories) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/api/party-venue/package-category/categories-list?limit=500`,
    );

    setPackageCategories(res.data.data || []);
  } catch (err) {
    console.log(err);
  }
};

export const createVenuePackage = async (
  payload,
  onSuccess,
  onClose,
  setLoadingCreate,
) => {
  try {
    setLoadingCreate(true);

    const res = await axios.post(
      `${BASE_URL}/api/party-venue/package/create-package`,
      payload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    if (!res.data.error) {
      alert("Package Created Successfully");

      onSuccess();

      onClose();
    }
  } catch (err) {
    console.log(err);

    alert("Failed To Create Package");
  } finally {
    setLoadingCreate(false);
  }
};

export const updateVenuePackage = async (
  packageId,
  payload,
  onSuccess,
  onClose,
  setLoadingUpdate,
) => {
  try {
    setLoadingUpdate(true);

    const res = await axios.put(
      `${BASE_URL}/api/party-venue/package/package-details/${packageId}`,
      payload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    if (!res.data.error) {
      alert("Package Updated Successfully");

      onSuccess();

      onClose();
    }
  } catch (err) {
    console.log(err);

    alert("Failed To Update Package");
  } finally {
    setLoadingUpdate(false);
  }
};

export const updateVenueTerms = async (
  venueId,
  html,
  onSuccess,
  onClose,
  setLoading,
) => {
  try {
    setLoading(true);

    const res = await axios.put(
      `${BASE_URL}/api/party-venue/update-terms/${venueId}`,
      {
        termsAndConditionsHtml: html,
      },
    );

    if (!res.data.error) {
      alert("Terms Updated Successfully");

      onSuccess?.();

      onClose?.();
    }
  } catch (err) {
    console.log(err);

    alert("Failed To Update Terms");
  } finally {
    setLoading(false);
  }
};

export const toggleVenueStatus = async (id, status, onSuccess) => {
  try {
    const res = await axios.patch(
      `${BASE_URL}/api/party-venue/venue-status/${id}`,
      {
        venueStatus: status,
      },
    );

    if (!res.data.error) {
      onSuccess?.();
    }
  } catch (err) {
    console.log(err);
  }
};

export const togglePackageStatus = async (id, status, onSuccess) => {
  try {
    const res = await axios.patch(
      `${BASE_URL}/api/party-venue/package/venue-package-status/${id}`,
      {
        packageStatus: status,
      },
    );

    if (!res.data.error) {
      onSuccess?.();
    }
  } catch (err) {
    console.log(err);
  }
};

export const deleteVenueMedia = async (imageId, setLoading, onSuccess) => {
  try {
    setLoading?.(true);

    const res = await axios.post(
      `${BASE_URL}/api/party-venue/venue-image/${imageId}`,
    );

    onSuccess?.();

    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    setLoading?.(false);
  }
};
