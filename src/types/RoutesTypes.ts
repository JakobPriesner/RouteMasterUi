import {JobWithContact} from "./JobTypes";

export interface CreateRouteRequest {
    jobIds?: string[];
    vehicleId: string;
    startAfterCreate?: boolean;
}

export type RouteState = 'Planned' | 'Started' | 'InProgress' | 'Completed' | 'Cancelled';

export const RouteStateLabels: Record<RouteState, string> = {
    ["Planned"]: "geplant",
    ["Started"]: "gestartet",
    ["InProgress"]: "in Arbeit",
    ["Completed"]: "abgeschlossen",
    ["Cancelled"]: "abgebrochen"
}

export interface Route {
    id: string;
    vehicleId?: string;
    jobs: JobWithContact[];
    state: RouteState;
    startTime?: Date;
    endTime?: Date;
    totalCostInEuros: number;
}

export interface StartRouteRequest {
    availableVehicleIds: string[];
}

export interface StartRouteResult {
    optimizedRoute: Route;
}

export interface AddJobsToRouteRequest {
    jobIds: string[];
}

export interface DeleteJobsFromRouteRequest {
    jobIds: string[];
}
