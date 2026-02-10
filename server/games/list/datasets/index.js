import dfb_2014 from "./dfb_2014.js";

export function getDataset(id) {
  if (id === "dfb_2014") return dfb_2014;
  throw new Error(`Unknown dataset ${id}`);
}
