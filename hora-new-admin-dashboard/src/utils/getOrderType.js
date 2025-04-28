const getOrderType = (orderTypeValue) => {
  if (orderTypeValue == 1) {
    return "Decoration";
  }
  if (orderTypeValue === 2) {
    return "Chef";
  }
  if (orderTypeValue === 3) {
    return "Waiter";
  }
  if (orderTypeValue === 4) {
    return "Bar Tender";
  }
  if (orderTypeValue === 5) {
    return "Cleaner";
  }
  if (orderTypeValue === 6) {
    return "Food Delivery";
  }
  if (orderTypeValue === 7) {
    return "Live Catering";
  }
  if (orderTypeValue === 8) {
    return "Photography";
  }
};

export default getOrderType;
