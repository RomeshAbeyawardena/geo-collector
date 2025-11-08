import { z } from "zod";
//import { v4 as uuid4 } from "uuid";
export interface ICoordinate {
    latitude: number;
    longitude: number;
    altitude?: number;
}

export interface IRequest {
    requestId: string;
}

export interface ICoordinateRequest extends IRequest {
    data:ICoordinate
}


export const CoordinateSchema = z.object({
    latitude: z.float64(),
    longitude: z.float64(),
    altitude: z.float64().optional()
});

export const CoordinateRequestSchema = z.object({
    requestId: z.guid(),
    data: CoordinateSchema
});
