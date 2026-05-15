import CallChecklistContent from "./CallChecklistContent";
import PhotographyCallChecklistContent from './PhotographyCallChecklistContent';
import './CallChecklist.css'

const CallChecklist = ({ open, onClose, data = null }) => {
    if (!open) return null; 

  return (
    <div className="checklist-overlay">
      <div className="checklist-modal">
         <div className="checklist-header">
          <h3>Order Call Checklist</h3>
        </div>
        {data?.type === 1 ?
        <CallChecklistContent
        open={open}
        onClose={onClose}
        data={data}
      />
      : data?.type === 8 ?
      <PhotographyCallChecklistContent
        open={open}
        onClose={onClose}
        data={data}
      />
      : <></>
      }
      
      </div>
    </div>
  );
};

export default CallChecklist;
