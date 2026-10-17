import {
  BASE_URL,
  CREATE_DECORATION_MATERIAL,
  GET_DECORATION_MATERIALS,
  GET_MATERIAL_FILTER_OPTIONS,
  UPDATE_DECORATION_MATERIAL,
} from "@/utils/apiconstant";
import axios from "axios";

export const handleMaterialStatusToggle = async (
  id,
  currentStatus,
  refetch,
) => {
  const newStatus = currentStatus === 1 ? 2 : 1;

  try {
    const response = await axios.patch(
      `${BASE_URL}${UPDATE_DECORATION_MATERIAL}/${id}`,
      {
        _id: id,
        materialStatus: newStatus,
      },
    );

    if (response.status === 200 || response.status === 204) {
      refetch();
      console.log("Status updated successfully");
    } else {
      console.error("Failed to update status");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

export const fetchDecorationMaterials = async (
  setError,
  setLoading,
  setDishes,
  setPagination,
  page,
  searchName,
  materialCategory,
  materialStatus,
  selectedMaterialNames = [],
  types = [],
  specsList = []
) => {
  try {
    setError(null);
    setLoading(true);

    const payload = {
      page: page,
      per_page: 10,
      materialName: searchName,
      selectedMaterialNames,
      types,
      specsList,
    };

    if (materialCategory) {
      payload.materialCategory = materialCategory;
    }

    if (materialStatus) {
      payload.materialStatus = parseInt(materialStatus);
    }

    const response = await axios.post(
      `${BASE_URL}${GET_DECORATION_MATERIALS}`,
      payload
    );

    setDishes(response.data.data.materials);
    setPagination(response.data.data.paginate);
  } catch (error) {
    setError("Error fetching decoration material data");
    console.error("Error fetching decoration material data:", error);
  } finally {
    setLoading(false);
  }
};

export const fetchMaterialFilterOptions = async () => {
  try {
    const res = await axios.get(`${BASE_URL}${GET_MATERIAL_FILTER_OPTIONS}`);
    return res.data.data;
  } catch (err) {
    console.error("Failed to fetch filter options", err);
    return { materialNames: [], types: [], specs: [] };
  }
};

export const handleFileUploadMaterialList = async (e, setFormData) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${BASE_URL}/api/image_upload`, {
      method: "POST",
      body: form,
    });

    const data = await res.json();

    setFormData((prev) => ({
      ...prev,
      images: data.data,
    }));
  } catch (error) {
    console.log(error);
    alert("Image upload failed");
  }
};

export const handleEditMaterialList = async (
  e,
  formData,
  materialId,
  onSuccess,
  onClose,
  setLoadingUpdate,
  isEditForm = true,
) => {
  e.preventDefault();
  setLoadingUpdate(true);

  try {
    const payload = {
      ...formData,
      vendorMaterialPrice: parseFloat(formData.vendorMaterialPrice) || 0,
      vendorMaterialRateRetail:
        parseFloat(formData.vendorMaterialRateRetail) || 0,
      vendorMaterialRateWholesale:
        parseFloat(formData.vendorMaterialRateWholesale) || 0,
    };
    let url = isEditForm
      ? `${BASE_URL}${UPDATE_DECORATION_MATERIAL}/${materialId}`
      : `${BASE_URL}${CREATE_DECORATION_MATERIAL}`;
    let method = isEditForm ? "PATCH" : "POST";
    const res = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data) {
      alert("Material Updated Successfully");
      onSuccess();
      onClose();
    }
  } catch (err) {
    console.log(err);
    alert("Error updating material");
  } finally {
    setLoadingUpdate(false);
  }
};
