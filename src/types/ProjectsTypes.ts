import { AddAddressRequest } from './ContactsTypes';
import {Address} from "./AddressTypes";

export interface AddProjectRequest {
    name: string;
    description?: string;
    token: string;
    customerIdRequired: boolean;
    defaultPickupDurationInMinutes?: number;
    depotAddress: AddAddressRequest;
    deliveryDays?: DayOfWeek[];
    contactLookupFields: string[];
}

export interface Project {
    id: string;
    name?: string;
    description?: string;
    customerIdRequired: boolean;
    defaultPickupDurationInMinutes?: number;
    depotAddress: Address;
    deliveryDays: string[];
    contactLookupFields: string[];
    users?: UserOfProject[];
}

export interface UserOfProject{
    userId: string;
    permissions: string[];
}

export interface GetAllProjectsResult {
    projects: Project[];
}

export type DayOfWeek =
    | 'Sunday'
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday';

export interface ProjectAnalyticsResult {
    amountOfContacts: number;
    amountOfOpenJobs: number;
    amountOfJobsInProgress: number;
    amountOfFinishedJobs: number;
    jobsPerDay: Record<string, number>;
}

export interface GetSingleProjectResult {
    project: Project
}
