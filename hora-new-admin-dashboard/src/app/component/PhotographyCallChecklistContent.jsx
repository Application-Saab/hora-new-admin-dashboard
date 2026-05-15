import React, { useState, useEffect } from "react";
import "./CallChecklist.css";
import CheckboxGroup from "./CheckboxGroup";
import {
  updateCallChecklistApi,
  saveCallChecklistApi,
} from "@/services/callChecklist";

export const DEFAULT_CHECKLIST = {
  poseReferenceComment: "",

  photographyLocation: {
    Home: false,
    "Society Hall": false,
    Restaurant: false,
    Other: false,
  },

  otherLocationComment: "",

  inclusions: {
    "Raw Photos": false,
    "Edited Photos": false,
    Teaser: false,
    "Edited Video": false,
    "Raw Video": false,
    "Drone Shoot": false,
    "Edited Reel": false,
  },

  verificationChecklist: {
    "Explain the inclusions and comments": false,
    "Verify the time slot": false,
    "Verify the address": false,
    "Verify the Google map location": false,
    "Inform about cancellation policy": false,
    "The slot cannot be changed on the day in order": false,
    "The executor will reach your location between XX-YY timeslot": false,
    "Verify the lights in the area or if customer need to add a umbrella light in the event":
      false,
    "Inform customer the name of Photographer assigned and that details of the photographer will be visible on My order segment":
      false,
    "Inform customer about the timeline for sharing drive link - 48 Hours/5 Days":
      false,
  },
};

const PhotographyCallChecklistContent = ({
  open,
  onClose,
  data = null,
  cancleBtnColor = "#000",
}) => {
  const isEditMode = data?.call_checklist_exists === true;

  const [callChecklist, setCallChecklist] =
    useState(DEFAULT_CHECKLIST);

  const [originalChecklist, setOriginalChecklist] =
    useState(DEFAULT_CHECKLIST);

  useEffect(() => {
    if (!data) return;

    let initialChecklist = { ...DEFAULT_CHECKLIST };

    if (data.call_checklist_exists && data.call_checklist) {
      initialChecklist = {
        ...initialChecklist,
        ...data.call_checklist,
      };
    }

    setCallChecklist(initialChecklist);
    setOriginalChecklist(
      JSON.parse(JSON.stringify(initialChecklist))
    );
  }, [data]);

  if (!open) return null;

  const handleCheckboxChange = (section, key) => {
    setCallChecklist((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section]?.[key],
      },
    }));
  };

  const getChangedFields = (original = {}, current = {}) => {
    const changes = {};

    Object.keys(current).forEach((section) => {
      if (
        typeof current[section] === "object" &&
        current[section] !== null &&
        !Array.isArray(current[section])
      ) {
        const nestedChanges = {};

        Object.keys(current[section]).forEach((key) => {
          const oldVal = original?.[section]?.[key] ?? false;
          const newVal = current?.[section]?.[key] ?? false;

          if (oldVal !== newVal) {
            nestedChanges[key] = newVal;
          }
        });

        if (Object.keys(nestedChanges).length) {
          changes[section] = nestedChanges;
        }
      } else {
        if (original?.[section] !== current?.[section]) {
          changes[section] = current[section];
        }
      }
    });

    return changes;
  };

  const handleSave = async () => {
    try {
      let payload;

      if (isEditMode) {
        const changedChecklist = getChangedFields(
          originalChecklist,
          callChecklist
        );

        if (!Object.keys(changedChecklist).length) {
          alert("No changes detected");
          return;
        }

        payload = {
          call_checklist: callChecklist,
        };

        await updateCallChecklistApi(data?._id, payload);
      } else {
        payload = {
          orderId: data?._id,
          call_checklist: callChecklist,
        };

        await saveCallChecklistApi(payload);
      }

      alert(
        isEditMode
          ? "Checklist updated successfully"
          : "Checklist saved successfully"
      );

      onClose();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <>
      <div className="checklist-body">

        {/* Pose Reference */}
        <div className="checklist-block">
          <div className="label-heading">
            Check Event details and share poses reference link
          </div>

          <textarea
            className="comment-input"
            placeholder="Add poses reference link"
            value={callChecklist.poseReferenceComment || ""}
            onChange={(e) =>
              setCallChecklist((prev) => ({
                ...prev,
                poseReferenceComment: e.target.value,
              }))
            }
          />
        </div>

        {/* Photography Location */}
        <CheckboxGroup
          title="Check where photography is happening"
          items={[
            "Home",
            "Society Hall",
            "Restaurant",
            "Other",
          ]}
          section="photographyLocation"
          checklist={callChecklist}
          onChange={handleCheckboxChange}
        />

        {callChecklist.photographyLocation?.Other && (
          <textarea
            className="comment-input"
            placeholder="Enter other location..."
            value={callChecklist.otherLocationComment || ""}
            onChange={(e) =>
              setCallChecklist((prev) => ({
                ...prev,
                otherLocationComment: e.target.value,
              }))
            }
          />
        )}

        {/* Inclusions */}
        <CheckboxGroup
          title="Check the inclusions"
          items={[
            "Raw Photos",
            "Edited Photos",
            "Teaser",
            "Edited Video",
            "Raw Video",
            "Drone Shoot",
            "Edited Reel",
          ]}
          section="inclusions"
          checklist={callChecklist}
          onChange={handleCheckboxChange}
        />

 <div className="label-heading">
            Select Addon
          </div>

        {/* Verification Checklist */}
        <CheckboxGroup
          title="Verification Checklist"
          items={[
            "Explain the inclusions and comments",
            "Verify the time slot",
            "Verify the address",
            "Verify the Google map location",
            "Inform about cancellation policy",
            "The slot cannot be changed on the day in order",
            "The executor will reach your location between XX-YY timeslot",
            "Verify the lights in the area or if customer need to add a umbrella light in the event",
            "Inform customer the name of Photographer assigned and that details of the photographer will be visible on My order segment",
            "Inform customer about the timeline for sharing drive link - 48 Hours/5 Days",
          ]}
          section="verificationChecklist"
          checklist={callChecklist}
          onChange={handleCheckboxChange}
        />
      </div>

      <div className="checklist-footer">
        <button
          className="modal-btn"
          style={{ color: cancleBtnColor }}
          onClick={onClose}
        >
          Cancel
        </button>

        <button className="save-btn" onClick={handleSave}>
          {isEditMode ? "Edit" : "Save"}
        </button>
      </div>
    </>
  );
};

export default PhotographyCallChecklistContent;