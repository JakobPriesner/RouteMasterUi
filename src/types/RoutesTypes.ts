// src/types/RoutesTypes.ts

import { JobWithContact } from './JobsTypes';

export interface CreateRouteRequest {
    jobIds?: string[];
    vehicleId: string;
    startAfterCreate?: boolean;
}

export type RouteState = 'Planned' | 'Started' | 'InProgress' | 'Completed' | 'Cancelled';

export interface Route {
    id: string;
    vehicleId?: string;
    jobs: JobWithContact[];
    state: RouteState;
    startTime?: string; // ISO date-time string
    endTime?: string;   // ISO date-time string
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
