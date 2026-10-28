import axios from "axios";
import { BASE_URL } from "@/utils/apiconstant";

export const fetchVenues = async ({
  setError,
  setLoading,
  setVenues,
  setPagination,
  setStats,
  page = 1,
  limit = 10,
  search = "",
  venueType = "",
  city = "",
  foodType = "",
  venueStatus = "",
}) => {
  try {
    setLoading(true);
    if (setError) setError(null);

    const response = await axios.get(
      `${BASE_URL}/api/party-venue/venues-list`,
      {
        params: {
          page,
          limit,
          search,
          venueType,
          city,
          foodType,
          venueStatus,
        },
      }
    );

    const resData = response.data;
    setVenues(resData.data || []);

    if (setStats && resData.stats) {
      setStats(resData.stats);
    }

    if (setPagination && resData.pagination) {
      const { total, page: curPage, totalPages } = resData.pagination;
      setPagination({
        total_item: total,
        current_page: curPage,
        last_page: totalPages,
        next_page: curPage < totalPages ? curPage + 1 : totalPages,
        previous_page: curPage > 1 ? curPage - 1 : 1,
        first_page: 1,
      });
    }
  } catch (err) {
    console.error("Error fetching venues:", err);
    if (setError) setError("Error fetching venues");
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

// export const fetchPackageCategories = async (setPackageCategories) => {
//   try {
//     const res = await axios.get(
//       `${BASE_URL}/api/party-venue/package-category/categories-list?limit=500`,
//     );

//     setPackageCategories(res.data.data || []);
//   } catch (err) {
//     console.log(err);
//   }
// };

export const fetchPackageCategories = async (setPackageCategories) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/api/party-venue/package-category/categories-list`,
      {
        params: {
          limit: 500,
          categoriesStatus: 1, // only active
        },
      }
    );
    setPackageCategories(res.data.data || []);
  } catch (err) {
    console.error(err);
  }
};

// NEW: Fetch items by category (or search)
export const fetchPackageItemsByCategory = async ({
  categoryId = "",
  search = "",
  page = 1,
  limit = 100,
}) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/api/party-venue/package-item/items-list`,
      {
        params: {
          categoryId: categoryId || undefined,
          search: search || undefined,
          itemsStatus: 1,
          page,
          limit,
        },
      }
    );

    return {
      items: res.data.data || [],
      pagination: res.data.pagination || {},
    };
  } catch (err) {
    console.error(err);
    return { items: [], pagination: {} };
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

// fetch suggestions master list for faq
export const fetchVenueSuggestion = async (type) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/api/venue-suggestion/suggestion-by-type/${type}`
    );
    return res.data?.data || [];
  } catch (err) {
    console.error("Error fetching FAQ suggestions:", err);
    return [];
  }
};

// create venue suggestion
export const createVenueSuggestion = async (title, dataType = "SPECIAL_FEATURES") => {
  try {
    const res = await axios.post(`${BASE_URL}/api/venue-suggestion`, {
      title: title.trim(),
    dataType,
      status: 1,
    });
    return res.data?.data || null;
  } catch (err) {
    console.error("Error creating venue suggestion:", err);
    return null;
  }
};


// update venue faqs
export const updateVenueFaqs = async (
  venueId,
  faqs,
  onSuccess,
  onClose,
  setLoading
) => {
  try {
    setLoading(true);
    const res = await axios.put(
      `${BASE_URL}/api/party-venue/update-faqs/${venueId}`,
      { faqs }
    );

    if (!res.data.error) {
      alert("FAQs updated successfully!");
      onSuccess?.();
      onClose?.();
    }
  } catch (err) {
    console.error(err);
    alert(err?.response?.data?.message || "Failed to update FAQs");
  } finally {
    setLoading(false);
  }
};