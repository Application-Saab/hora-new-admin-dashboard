export const CHECKBOX_GROUP_CONFIG = [
  {
    title: "Explain the type of design",
    section: "designType",
    items: ["Wall", "Ring", "Ring + Flex", "Sequined", "U Shape", "Square Stand", "Room Decor", "Cradle", "Flex", "Artificial Flower", "Real Flower"]
  },
  {
    title: "Explain rental policy (items returned after 24 hours)",
    section: "rentalPolicy",
    items: ["Ring", "Flex", "Artificial Flowers", "Balloons Foil", "Cutout", "Marquee light"]
  },
  {
    title:
      "Power supply should be near the decoration spot or extensions should be arranged by customer",
    section: "lights",
    items: ["Neon", "Focus"]
  },
  {
    title: "Verify Cake Tables and neon light",
    section: "cakeTable",
    items: [
      "Paper cake table",
      "Golden stand cake table",
      "Transparent stand cake table",
      "Solid stand cake table with flex", 
      "Neon Light 8 inch",
      "Neon light 12 inch",
      "Marquee light 9 inch",
      "Marquee light 32 inch",
    ]
  },
  {
    title: "Check if the decoration is happening at hotel or Home etc.",
    section: "locationType",
    items: ["Home", "Society Hall", "Restaurant", "Other"]
  }
];
export const keyMap = {
    "Explain the inclusions and comments": "inclusionandcomment",
    "Verify the time slot": "verifiedTimeslot",
    "Verify the address": "varifiedAddress",
    "Verify the Google map location": "verifiedMap",
    "Inform about cancellation policy": "cancellationInformed",
    "The slot cannot be changed on the day in order.": "slotVerified",
    "The executor will reach your location between XX-YY timeslot": "executorTime"
};
export const DEFAULT_CHECKLIST = {
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
};