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
      <CallChecklistContent
        open={open}
        onClose={onClose}
        data={data}
      />
      </div>
    </div>
  );
};

export default CallChecklist;
