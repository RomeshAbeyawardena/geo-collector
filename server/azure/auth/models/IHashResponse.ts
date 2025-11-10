import { IServerResponse } from "./IServerResponse";

export interface IHashResponse {
    hash:string;
    salt:string;
}

export interface IHashServerResponse extends IServerResponse<IHashResponse>
{
    
}