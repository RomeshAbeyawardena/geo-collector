import { z } from "zod";

export interface ICoordinate {
    latitude: number;
    longitude: number;
    altitude?: number;
}

export const ICoordinateSchema = z.object({
    latitude: z.float64(),
    longitude: z.float64(),
    altitude: z.float64().optional()
});
