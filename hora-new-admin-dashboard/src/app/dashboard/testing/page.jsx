"use client";
import React from 'react';

const InclusionsList = () => {
  const htmlInclusions = [
    "<div>- Full Video of the event</div><div>- 1 professional videographer with all necessary equipment</div><div>- Edited one video (3 minutes duration)</div>"
  ];

  const parseInclusions = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const divs = doc.querySelectorAll('div');
    return Array.from(divs).map(div => div.textContent.trim());
  };

  const formattedInclusions = parseInclusions(htmlInclusions[0]);
  console.log('Formatted Inclusions:', formattedInclusions);

  const sendToAPI = async () => {
    const payload = {
      add_on: formattedInclusions
    };

    console.log('Payload to send:', payload);
    
    try {
      const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('Success:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      {formattedInclusions.map((inclusion, index) => (
        <div key={index}>{inclusion}</div>
      ))}
      <button onClick={sendToAPI}>Send to API</button>
    </div>
  );
};

export default InclusionsList;



// import axios from "axios";
// import { useState } from "react";

// export default function Home() {
//   const [files, setFiles] = useState([]);
//   const [folderName, setFolderName] = useState("session1");
//   const [uploading, setUploading] = useState(false);
//   const [result, setResult] = useState(null);

//   const handleUpload = async () => {
//   for (let i = 0; i < files.length; i++) {
//     const formData = new FormData();
//     formData.append("folder", folderName);
//     formData.append("file", files[i]);
//     formData.append("is_last", i === files.length - 1 ? "true" : "false");

//     try {
//       const res = await axios.post("http://localhost:8000/upload-multiple", formData);
//       console.log("Upload response", res.data);

//       // only set result on last
//       if (i === files.length - 1) {
//         setResult(res.data);
//       }
//     } catch (err) {
//       console.error("Error uploading file:", files[i].name, err);
//     }
//   }
// };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Face Upload & Cluster</h2>
//       <input
//         type="text"
//         placeholder="Enter folder name"
//         value={folderName}
//         onChange={(e) => setFolderName(e.target.value)}
//       />
//       <br /><br />
//       <input
//         type="file"
//         multiple
//         accept="image/*"
//         onChange={(e) => setFiles(Array.from(e.target.files))}
//       />
//       <br /><br />
//       <button disabled={uploading} onClick={handleUpload}>
//         {uploading ? "Uploading..." : "Upload & Cluster"}
//       </button>

//       {result && (
//         <div>
//           <h3>Top Clusters:</h3>
//           {result.clusters.map((cluster, i) => (
//             <div key={i}>
//               <h4>Cluster {i + 1}</h4>
//               {cluster.map((img, j) => (
//                 <img
//                   key={j}
//                   src={`data:image/jpeg;base64,${img}`}
//                   style={{ width: 100, marginRight: 10 }}
//                   alt={`Face ${j + 1}`}
//                 />
//               ))}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }




// import { useState } from "react";

// export default function Home() {
//   const [folder, setFolder] = useState("");
//   const [file, setFile] = useState(null);
//   const [message, setMessage] = useState("");

//   async function handleUpload() {
//     if (!folder || !file) {
//       alert("Please enter folder name and select a file");
//       return;
//     }
//     const formData = new FormData();
//     formData.append("folder", folder);
//     formData.append("file", file);

//     try {
//       const res = await fetch("http://localhost:8000/upload-multiple", {
//         method: "POST",
//         body: formData,
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setMessage("Uploaded successfully: " + data.path);
//       } else {
//         setMessage("Error: " + data.detail);
//       }
//     } catch (e) {
//       setMessage("Upload failed");
//       console.error(e);
//     }
//   }

//   return (
//     <div style={{ padding: 20 }}>
//       <h1>Upload Image</h1>
//       <input
//         placeholder="Folder name"
//         value={folder}
//         onChange={(e) => setFolder(e.target.value)}
//       />
//       <br />
//       <br />
//       <input
//         type="file"
//         accept="image/*"
//         onChange={(e) => setFile(e.target.files[0])}
//       />
//       <br />
//       <br />
//       <button onClick={handleUpload}>Upload</button>
//       <p>{message}</p>
//     </div>
//   );
// }
