import React, { useState, useEffect } from "react";
import "./CallChecklist.css";
import { eventList } from "@/constants/eventList";
import SearchWithDropDown from "./SearchWithDropDown";
import axios from "axios";
import {
  BASE_URL,
  SAVE_CALL_CHECKLIST,
  UPDATE_CALL_CHECKLIST,
  MULTI_IMAGE_UPLOAD,
  DELETE_CHECKLIST_IMAGE,
} from "@/utils/apiconstant";
import Image from "next/image";

const CallChecklist = ({ open, onClose, data = null }) => {
  const isEditMode = data?.call_checklist_exists === true;
  const [eventName, setEventName] = useState("");

  const keyMap = {
    "Explain the inclusions and comments": "inclusionandcomment",
    "Verify the time slot": "verifiedTimeslot",
    "Verify the address": "varifiedAddress",
    "Verify the Google map location": "verifiedMap",
    "Inform about cancellation policy": "cancellationInformed",
    "The slot cannot be changed on the day in order.": "slotVerified",
    "The executor will reach your location between XX-YY timeslot": "executorTime"
  };

  const [callChecklist, setCallChecklist] = useState({
    designType: {},
    rentalPolicy: {},
    itemsVerified: {},
    itemsVerifiedImages: {},
    lights: {},
    cakeTable: {},
    locationType: {},
    inclusionsExplained: false,
    timeSlotVerified: false,
    addressVerified: false,
    mapVerified: false,
    cancellationPolicy: false,
    slotNotChangeable: false,
    executorTimeInformed: false
  });

  const [originalChecklist, setOriginalChecklist] = useState({});

  const handleItemImageChange = (item, files) => {
    setCallChecklist(prev => ({
      ...prev,
      itemsVerifiedImages: {
        ...(prev.itemsVerifiedImages || {}), // ✅ safety
        [item]: [
          ...((prev.itemsVerifiedImages || {})[item] || []),
          ...Array.from(files)
        ]
      }
    }));
  };

  const handleUploadAllImages = async () => {
    try {
      const finalImagesObject = {};

      for (const item in callChecklist.itemsVerifiedImages) {
        const images = callChecklist.itemsVerifiedImages[item];

        if (!images || images.length === 0) continue;

        const formData = new FormData();
        images.forEach(file => formData.append("files", file));

        // optional: item name bhejna (debug/log ke liye)
        formData.append("item", item);

        const res = await axios.post(
          `${BASE_URL}${MULTI_IMAGE_UPLOAD}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        // 👇 yahin mapping ho rahi hai
        finalImagesObject[item] = res.data.data;
      }

      // Replace File objects with uploaded filenames
      setCallChecklist(prev => ({
        ...prev,
        itemsVerifiedImages: finalImagesObject
      }));

      alert("All item images uploaded successfully");
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    }
  };

 const handleDeleteImage = async (item, index) => {
  const image = callChecklist.itemsVerifiedImages[item][index];

  // UI se remove
  setCallChecklist(prev => {
    const updatedImages = [...prev.itemsVerifiedImages[item]];
    updatedImages.splice(index, 1);

    return {
      ...prev,
      itemsVerifiedImages: {
        ...prev.itemsVerifiedImages,
        [item]: updatedImages
      }
    };
  });

  // Backend delete
  if (typeof image === "string") {
    try {
      await axios.post(`${BASE_URL}${DELETE_CHECKLIST_IMAGE}`, {
        orderId: data._id,
        itemKey: item,
        imageName: image
      });
    } catch (err) {
      console.error(err);
      alert("Failed to delete image from server");
    }
  }
};






  const hasAnyImages = () => {
    return Object.values(callChecklist.itemsVerifiedImages || {}).some(
      images => images && images.length > 0
    );
  };



  useEffect(() => {
    if (!data) return;

    let initialChecklist = {
      designType: {},
      rentalPolicy: {},
      itemsVerified: {},
      itemsVerifiedImages: {},
      lights: {},
      cakeTable: {},
      locationType: {},
      inclusionsExplained: false,
      timeSlotVerified: false,
      addressVerified: false,
      mapVerified: false,
      cancellationPolicy: false,
      slotNotChangeable: false,
      executorTimeInformed: false,
    };

    if (data.call_checklist_exists && data.call_checklist) {
      initialChecklist = {
        ...initialChecklist,
        ...data.call_checklist
      };
    }

    // Populate decoration fields safely
    if (data.decorationsData && data.decorationsData.length > 0) {
      const decoration = data.decorationsData[0];
      initialChecklist = {
        ...initialChecklist,
        designType: { ...decoration.designType },
      };
    }

    setCallChecklist(initialChecklist);
    setOriginalChecklist(JSON.parse(JSON.stringify(initialChecklist)));
    setEventName(data.eventName || "");
  }, [data]);

  if (!open) return null;

  const handleCheckboxChange = (section, key) => {
    setCallChecklist(prev => {
      const oldSectionData = prev[section] || {};
      return {
        ...prev,
        [section]: {
          ...oldSectionData,
          [key]: !oldSectionData[key]
        }
      };
    });
  };


  const handleSingleCheck = key => {
    setCallChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getChangedFields = (original = {}, current = {}) => {
    const changes = {};

    Object.keys(current).forEach(section => {
      if (
        typeof current[section] === "object" &&
        current[section] !== null &&
        !Array.isArray(current[section])
      ) {
        const nestedChanges = {};
        Object.keys(current[section]).forEach(key => {
          const oldVal = original?.[section]?.[key] ?? false;
          const newVal = current[section][key] ?? false;
          if (oldVal !== newVal) nestedChanges[key] = newVal;
        });
        if (Object.keys(nestedChanges).length) changes[section] = nestedChanges;
      } else {
        if ((original?.[section] ?? false) !== current[section]) {
          const mappedKey = keyMap[section] || section;
          changes[mappedKey] = current[section];
        }
      }
    });

    return changes;
  };

  const handleSave = async () => {
    try {
      let payload;
      let url;

      if (isEditMode) {
        const changedChecklist = getChangedFields(originalChecklist, callChecklist);

        if (!Object.keys(changedChecklist).length) {
          alert("No changes detected");
          return;
        }

        payload = {
          eventName,
          call_checklist: callChecklist
        };

        url = `${BASE_URL}${UPDATE_CALL_CHECKLIST}/${data?._id}`;
        await axios.put(url, payload);
      } else {
        payload = {
          orderId: data?._id,
          eventName,
          call_checklist: callChecklist
        };

        url = `${BASE_URL}${SAVE_CALL_CHECKLIST}`;
        await axios.post(url, payload);
      }

      alert(isEditMode ? "Checklist updated successfully" : "Checklist saved successfully");
      window.location.reload();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="checklist-overlay">
      <div className="checklist-modal">
        <div className="checklist-header">
          <h3>Order Call Checklist</h3>
        </div>

        <div className="checklist-body">

          {/* Design Type */}
          <div className="label-heading">Explain the type of design</div>
          <div className="checkbox-container">
            {["Wall", "Ring", "Sequined", "U Shape", "Square Stand"].map(item => (
              <label key={item} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={callChecklist.designType[item] || false}
                  onChange={() => handleCheckboxChange("designType", item)}
                />
                {item}
              </label>
            ))}
          </div>

          {/* Rental Policy */}
          <div className="label-heading">
            Explain rental policy (items returned after 24 hours)
          </div>
          <div className="checkbox-container">
            {["Ring", "Flex", "Artificial Flowers", "Balloons Foil", "Cutout"].map(item => (
              <label key={item} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={callChecklist.rentalPolicy[item] || false}
                  onChange={() => handleCheckboxChange("rentalPolicy", item)}
                />
                {item}
              </label>
            ))}
          </div>

          {/* Items Verified */}
          <div className="label-heading">Get the items verified</div>

          <div className="checkbox-container">
            {["Welcome Board", "Flex Design", "Cutouts", "Sequined Color"].map(item => {
              const imageCount = callChecklist.itemsVerifiedImages?.[item]?.length || 0;

              return (
                <div key={item} className="item-verify-wrapper">

                  {/* Checkbox Row */}
                  <div className="item-verify-row">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={callChecklist.itemsVerified[item] || false}
                        onChange={() => handleCheckboxChange("itemsVerified", item)}
                      />
                      {item}
                    </label>

                    {/* Hidden file input */}
                    <label
                      className={`add-image-btn ${!callChecklist.itemsVerified[item] ? "disabled-btn" : ""
                        }`}
                    >
                      Add Image
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        disabled={!callChecklist.itemsVerified[item]}
                        onChange={(e) =>
                          handleItemImageChange(item, e.target.files)
                        }
                      />
                    </label>


                    {/* Image Count */}
                    {imageCount > 0 && (
                      <span className="image-count">
                        {imageCount} image{imageCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Preview Images (BOTTOM) */}
                  {imageCount > 0 && (
                    <div className="preview-container">
                      {callChecklist.itemsVerifiedImages[item].map((file, index) => {
                        const imageSrc =
                          typeof file === "string"
                            ? `https://horaservices.com/api/uploads/${file}`
                            : URL.createObjectURL(file);

                        return (
                          <div className="preview-wrapper" key={index}>
                            <span
                              className="delete-icon"
                              onClick={() => handleDeleteImage(item, index)}
                            >
                              ✕
                            </span>

                            <Image
                              width={111}
                              height={111}
                              src={imageSrc}
                              alt={`${item}-${index}`}
                              className="preview-image"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Upload All Button */}
          <button
            className={`upload-all-btn ${!hasAnyImages() ? "disabled-btn" : ""}`}
            disabled={!hasAnyImages()}
            onClick={handleUploadAllImages}
          >
            Upload All
          </button>

          {/* Lights */}
          <div className="label-heading">
            Power supply should be near the decoration spot or extensions should be arranged by customer
          </div>
          <div className="checkbox-container">
            {["Neon", "Focus"].map(item => (
              <label key={item} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={callChecklist.lights[item] || false}
                  onChange={() => handleCheckboxChange("lights", item)}
                />
                {item}
              </label>
            ))}
          </div>

          {/* Cake Table */}
          <div className="label-heading">Verify Cake Tables and neon light</div>
          <div className="checkbox-container">
            {[
              "Paper cake table",
              "Golden stand cake table",
              "Transparent stand cake table",
              "Solid stand cake table with flex",
              "Neon Light 8 inch",
              "Neon light 12 inch"
            ].map(item => (
              <label key={item} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={callChecklist.cakeTable[item] || false}
                  onChange={() => handleCheckboxChange("cakeTable", item)}
                />
                {item}
              </label>
            ))}
          </div>

          {/* Location */}
          <div className="label-heading">
            Check if the decoration is happening at hotel or Home etc.
          </div>
          <div className="checkbox-container">
            {["Home", "Society Hall", "Restaurant", "other"].map(item => (
              <label key={item} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={callChecklist.locationType[item] || false}
                  onChange={() => handleCheckboxChange("locationType", item)}
                />
                {item}
              </label>
            ))}
          </div>

          {/* Event */}
          <div className="add-event">
            <div className="label-heading">Add Event</div>
            <SearchWithDropDown
              options={eventList}
              selectedValue={eventName}
              onChange={setEventName}
              placeholder="Search event..."
            />
          </div>

          {/* Bottom Checkboxes */}
          {Object.entries(keyMap).map(([label, stateKey]) => (
            <label key={label}>
              <input
                type="checkbox"
                className="checkbox-size"
                checked={callChecklist[stateKey] || false}
                onChange={() => handleSingleCheck(stateKey)}
              />
              <div className="label-heading">{label}</div>
            </label>
          ))}


        </div>

        <div className="checklist-footer">
          <button className="modal-btn" onClick={onClose}>Cancel</button>
          <button className="save-btn" onClick={handleSave}>
            {isEditMode ? "Edit" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallChecklist;
