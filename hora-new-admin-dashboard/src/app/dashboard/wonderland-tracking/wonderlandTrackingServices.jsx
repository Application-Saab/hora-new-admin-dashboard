export const formatDateDDMMYYYY = (dateInput) => {
  if (!dateInput) return "N/A";
  const d = new Date(dateInput);

  if (isNaN(d.getTime())) {
    return "Invalid Date";
  }

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

export const WonderlandTrackingTable = ({ data, type }) => {
  return (
    <div className="table-container">
      <table>
        <thead>
          {type === "byUsers" ? (
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Hosted Events</th>
              <th>Guest Events</th>
              <th>Posts</th>
              <th>Wonderland</th>
            </tr>
          ) : (
            <tr>
              <th>Wonderland ID</th>
              <th>Event Name</th>
              <th>Host Phone</th>
              <th>Guests</th>
              <th>Posts</th>
              <th>Date</th>
            </tr>
          )}
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((item, i) =>
              type === "byUsers" ? (
                <tr key={i}>
                  <td>{item.name}</td>
                  <td>{item.phone}</td>
                  <td>{item.hostedEventsCount}</td>
                  <td>{item.guestEventsCount}</td>
                  <td>{item.postsCount}</td>
                  <td>{item.fromWonderland ? "Yes" : "No"}</td>
                </tr>
              ) : (
                <tr key={i}>
                  <td>{item.wonderland_id}</td>
                  <td>{item.hostName}</td>
                  <td>{item.hostPhone}</td>
                  <td>{item.guestCount}</td>
                  <td>{item.photoCount}</td>
                  <td>{formatDateDDMMYYYY(item.eventDate)}</td>
                </tr>
              ),
            )
          ) : (
            <tr>
              <td colSpan="5" className="no-data">
                No Data Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
