import { geoMercator, geoPath } from "d3-geo";
import boundaries from "../../data/sejongBoundaries.json";

export const VIEWBOX_WIDTH = 900;
export const VIEWBOX_HEIGHT = 900;
const PADDING = 20;

export const projection = geoMercator().fitExtent(
  [
    [PADDING, PADDING],
    [VIEWBOX_WIDTH - PADDING, VIEWBOX_HEIGHT - PADDING],
  ],
  boundaries,
);

export const pathGenerator = geoPath(projection);

export { boundaries };
