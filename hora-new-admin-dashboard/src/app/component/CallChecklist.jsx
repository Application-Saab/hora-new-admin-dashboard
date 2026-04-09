import CallChecklistContent from "./CallChecklistContent";
import './CallChecklist.css'

const CallChecklist = ({ open, onClose, data = null }) => {
    if (!open) return null; 

  return (
    <div className="checklist-overlay">
      <div className="checklist-modal">
         <div className="checklist-header">
          <h3>Order Call Checklist</h3>
        </div>
<<<<<<< HEAD
      <CallChecklistContent
        open={open}
        onClose={onClose}
        data={data}
      />
=======

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
                          imageSrc = `${BASE_URL}/api/uploads/${file}`;
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
          <button className="modal-btn" onClick={onClose}>Cancel</button>
          <button
            className={`save-btn ${hasPendingImageUpload() ? "disabled-btn" : ""}`}
            onClick={handleSave}
            disabled={hasPendingImageUpload()}
          >
            {isEditMode ? "Edit" : "Save"}
          </button>
        </div>
>>>>>>> b5e5102970d939bbe3a320fe94a8c81add566da4
      </div>
    </div>
  );
};

export default CallChecklist;
