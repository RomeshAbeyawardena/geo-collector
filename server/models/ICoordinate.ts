import { z } from "zod";
import { RequestError } from "../routes/request-error";
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

export class Coordinate {
    static safeParse(request: Record<string,string>, throwIfMandatory?:boolean): ICoordinate
    {
        const coordinates: ICoordinate = {
            latitude: 0,
            longitude: 0
        };

        const alt = request.altitude ?? request.alt;
        const altitude = alt != undefined ? Number(alt) : undefined;
        const latitude = Number(request.latitude ?? request.lat);
        const longitude = Number(request.longitude ?? request.lng);

        if (altitude != undefined && !Number.isNaN(altitude)) {
            coordinates.altitude = altitude;
        }

        const errorMessage = "Validation errors occurred."
        if (latitude != undefined && !Number.isNaN(latitude)) {
            coordinates.latitude = latitude;
        }
        else if(throwIfMandatory) {
            throw new RequestError(errorMessage, 400, 'Latitude (lat) is a required field');
        }

        if (longitude != undefined && !Number.isNaN(longitude)) {
            coordinates.longitude = longitude;
        }
        else if(throwIfMandatory) {
            throw new RequestError(errorMessage, 400, 'Longitude (lng) is a required field');
        }

        return coordinates;
    }
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
