// src/types/JobsTypes.ts

import { AddAddressRequest } from './ContactsTypes';

export interface AddTimeWindowRequest {
    startTime: string; // e.g. "08:00"
    endTime: string;   // e.g. "12:00"
}

export interface AddJobRequest {
    contactId: string;
    description: string;
    onDate: string; // YYYY-MM-DD
    priority: number;
    notes?: string;
    pickUp?: AddAddressRequest;
    timeLimitBetweenPickupAndDelivery?: number; // in minutes
    timeWindows?: AddTimeWindowRequest[];
}

export type JobState = 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';

export interface TimeWindow {
    startTime: string;
    endTime: string;
}

export interface Job {
    id: string;
    contactId: string;
    orderIndex?: number;
    onDate: string;
    priority: number;
    estimatedOnsiteDurationInMinutes: number;
    state: JobState;
    pickUp?: AddAddressRequest;
    timeLimitBetweenPickupAndDelivery?: string;
    timeWindows?: TimeWindow[];
    notes?: string;
}

export interface GetAllJobsResult {
    jobs: Job[];
    totalCount: number;
}

export interface GetSingleJobResult {
    job: Job | null;
}

/**
 * Optionally, if you need a job object that also includes its associated contact information.
 * (Assume that the Contact type is defined in ContactsTypes.ts.)
 */
export interface JobWithContact extends Job {
    contact: any; // Ideally: import { Contact } from './ContactsTypes' and type as Contact
}
