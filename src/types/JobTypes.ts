import {AddAddressRequest, Contact} from './ContactsTypes';

export interface AddTimeWindowRequest {
    startTime: string;
    endTime: string;
}

export interface AddJobRequest {
    contactId: string;
    description: string;
    onDate: string;
    priority: number;
    notes: string;
    pickUp?: AddAddressRequest;
    timeLimitBetweenPickupAndDelivery?: number; // in minutes
    timeWindows: AddTimeWindowRequest[];
}

export enum JobState {
    pending,
    inProgress,
    completed,
    cancelled
}

export const JobStateLabels: Record<JobState, string> = {
    [JobState.pending]: "ausstehend",
    [JobState.inProgress]: "in Bearbeitung",
    [JobState.completed]: "abgeschlossen",
    [JobState.cancelled]: "abgebrochen"
}

export interface TimeWindow {
    startTime: string;
    endTime: string;
}

export interface Job {
    id: string;
    contactId: string;
    orderIndex?: number;
    onDate: Date;
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

export interface JobWithContact extends Job {
    contact: Contact;
}
