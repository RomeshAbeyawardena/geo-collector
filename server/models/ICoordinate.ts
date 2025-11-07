import { z } from "zod";

export interface ICoordinate {
    latitude: number;
    longitude: number;
    altitude?: number;
}

export const ICoordinateSchema = z.object({
    latitude: z.number(),
    longitude: z.number(),
    altitude: z.int().optional()
});
