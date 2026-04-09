import React, { useState, useEffect } from "react";
import "./CallChecklist.css";
import { eventList } from "@/constants/eventList";
import SearchWithDropDown from "./SearchWithDropDown";
import Image from "next/image";
import CheckboxGroup from "./CheckboxGroup";
import { CHECKBOX_GROUP_CONFIG, keyMap, DEFAULT_CHECKLIST} from '@/utils/callChecklist';
import { deleteChecklistImageApi, uploadChecklistImagesApi, updateCallChecklistApi, saveCallChecklistApi} from "@/services/callChecklist";

const CallChecklistContent = ({ open, onClose, data = null, cancleBtnColor="#000" }) => {
  const isEditMode = data?.call_checklist_exists === true;
  const [eventName, setEventName] = useState("");

  const [callChecklist, setCallChecklist] = useState(DEFAULT_CHECKLIST);
  const [originalChecklist, setOriginalChecklist] = useState(DEFAULT_CHECKLIST);

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
    const finalImagesObject = { ...callChecklist.itemsVerifiedImages };

    for (const item in callChecklist.itemsVerifiedImages) {
      const images = callChecklist.itemsVerifiedImages[item];

      const newFiles = images.filter(
        img => img instanceof File || img instanceof Blob
      );

      if (newFiles.length === 0) continue;

      const formData = new FormData();
      newFiles.forEach(file => formData.append("files", file));
      formData.append("item", item);

      const res = await uploadChecklistImagesApi(formData);

      const oldImages = images.filter(img => typeof img === "string");

      finalImagesObject[item] = [
        ...oldImages,
        ...res.data.data
      ];
    }

    setCallChecklist(prev => ({
      ...prev,
      itemsVerifiedImages: finalImagesObject
    }));

    alert("Images uploaded successfully");
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
      await deleteChecklistImageApi({
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
  const hasPendingImageUpload = () => {
    return Object.values(callChecklist.itemsVerifiedImages || {}).some(images =>
      images?.some(img => img instanceof File || img instanceof Blob)
    );
  };




  useEffect(() => {
    if (!data) return;

    let initialChecklist = { ...DEFAULT_CHECKLIST };

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

        await updateCallChecklistApi(data?._id, payload);
      } else {
        payload = {
          orderId: data?._id,
          eventName,
          call_checklist: callChecklist
        };

        await saveCallChecklistApi(payload);
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
    <>    
        <div className="checklist-body">

        {CHECKBOX_GROUP_CONFIG.map(group => (
        <CheckboxGroup
        key={group.section}
        title={group.title}
        items={group.items}
        section={group.section}
        checklist={callChecklist}
        onChange={handleCheckboxChange}
        />
        ))}


          {/* Items Verified */}
          <div className="label-heading">Get the items verified</div>

          <div className="checkbox-container">
            {["Welcome Board", "Flex Design", "Cutouts", "Sequined Color", "Cake Table flex"].map(item => {
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

                        let imageSrc = "";

                        if (typeof file === "string") {
                          imageSrc = `https://horaservices.com/api/uploads/${file}`;
                        } else if (file instanceof File || file instanceof Blob) {
                          imageSrc = URL.createObjectURL(file);
                        } else {
                          return null;
                        }
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
          <button className="modal-btn" style={{color:cancleBtnColor}} onClick={onClose}>Cancel</button>
          <button
            className={`save-btn ${hasPendingImageUpload() ? "disabled-btn" : ""}`}
            onClick={handleSave}
            disabled={hasPendingImageUpload()}
          >
            {isEditMode ? "Edit" : "Save"}
          </button>
        </div>
      </>
  );
};

export default CallChecklistContent;
