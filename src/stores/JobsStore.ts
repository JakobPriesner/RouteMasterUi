import { BaseStore } from './BaseStore';
import { CancelToken } from 'axios';
import { AddJobRequest, GetAllJobsResult, GetSingleJobResult, Job, JobState } from '../types/JobTypes';
import { BehaviorSubject } from 'rxjs';
import {format} from "date-fns";

class JobsStoreClass extends BaseStore {
    protected jobsCache$ = new BehaviorSubject<{ [jobId: string]: Job }>({});
    protected cachedPages: { [key: string]: BehaviorSubject<GetAllJobsResult> } = {};

    getAllJobs(
        projectId: string,
        filters: {
            onDate?: Date;
            fromDate?: Date;
            toDate?: Date;
            states?: JobState[];
            page?: number;
            pageSize?: number;
        } = {},
        cancelToken?: CancelToken
    ): BehaviorSubject<GetAllJobsResult> {
        const initialData: GetAllJobsResult = { jobs: [], totalCount: 0 };
        const subject = new BehaviorSubject<GetAllJobsResult>(initialData);

        let { page = 0, pageSize = 20, states = [] } = filters;

        const fromDateFormatted = filters.fromDate ? format(filters.fromDate, "yyyy-MM-dd") : undefined;
        const toDateFormatted = filters.toDate ? format(filters.toDate, "yyyy-MM-dd") : undefined;
        const onDateFormatted = filters.onDate ? format(filters.onDate, "yyyy-MM-dd") : undefined;

        const key = `${projectId}|${page}|${pageSize}|${onDateFormatted}|${fromDateFormatted}|${toDateFormatted}|${states.join(',')}`;

        if (this.cachedPages[key]) {
            this.cachedPages[key].subscribe(subject);
            return subject;
        }
        this.cachedPages[key] = subject;

        const statesParam = states.length > 0 ? states.join(',') : undefined;

        this.axios.get<GetAllJobsResult>(`/v1/projects/${projectId}/jobs`, {
                params: {
                    page,
                    pageSize,
                    states: statesParam,
                    fromDate: fromDateFormatted,
                    toDate: toDateFormatted,
                    onDate: onDateFormatted,
                },
                cancelToken,
            })
            .then(response => {
                subject.next(response.data);
                this.addJobsToCache(response.data.jobs);
            })
            .catch(error => {
                this.handleError(error, 'Failed to fetch jobs.');
                subject.error(error);
            });

        return subject;
    }


    getJobById(
        projectId: string,
        jobId: string,
        cancelToken?: CancelToken
    ): BehaviorSubject<Job | null> {
        const subject = new BehaviorSubject<Job | null>(null);

        this.jobsCache$.subscribe(cachedJobs => {
            if (cachedJobs[jobId]) {
                subject.next(cachedJobs[jobId]);
                return;
            }
            this.axios
                .get<GetSingleJobResult>(`/v1/projects/${projectId}/jobs/${jobId}`, { cancelToken })
                .then(response => {
                    const job = response.data.job;
                    if (job) {
                        this.addJobsToCache([job]);
                    }
                    subject.next(job);
                })
                .catch(error => {
                    this.handleError(error, 'Failed to fetch job.');
                    subject.error(error);
                });
        });

        return subject;
    }

    async addJob(
        projectId: string,
        jobData: AddJobRequest,
        cancelToken?: CancelToken
    ): Promise<string> {
        try {
            let response = await this.axios.post<string>(`/v1/projects/${projectId}/jobs`, jobData, {cancelToken});

            this.getAllJobs(projectId, {}, cancelToken);
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to add job.');
            throw error;
        }
    }

    updateJob(
        projectId: string,
        jobId: string,
        jobData: Partial<Job>,
        cancelToken?: CancelToken
    ): Promise<any> {
        const currentJobs = this.jobsCache$.getValue();
        const originalJob = currentJobs[jobId] || null;
        const updatedJob = { ...originalJob, ...jobData, id: jobId };
        this.updateJobsInCache(updatedJob);

        return this.axios
            .put(`/v1/projects/${projectId}/jobs/${jobId}`, jobData, { cancelToken })
            .catch(error => {
                this.handleError(error, 'Failed to update job.');
                if (originalJob) this.updateJobsInCache(originalJob);
                throw error;
            });
    }

    deleteJobById(
        projectId: string,
        jobId: string,
        cancelToken?: CancelToken
    ): Promise<void> {
        const currentJobs = this.jobsCache$.getValue();
        const deletedJob = currentJobs[jobId];
        this.deleteJobInCache(jobId);

        return this.axios
            .delete(`/v1/projects/${projectId}/jobs/${jobId}`, { cancelToken })
            .then(() => {})
            .catch(error => {
                this.handleError(error, 'Failed to delete job.');
                if (deletedJob) this.addJobsToCache([deletedJob]);
                throw error;
            });
    }

    protected addJobsToCache(jobs: Job[]): void {
        const currentJobs = this.jobsCache$.getValue();
        const updatedJobs = { ...currentJobs };
        jobs.forEach(job => {
            updatedJobs[job.id] = job;
        });
        this.jobsCache$.next(updatedJobs);
    }

    protected updateJobsInCache(job: Job): void {
        const currentJobs = this.jobsCache$.getValue();
        const updatedJobs = { ...currentJobs, [job.id]: job };
        this.jobsCache$.next(updatedJobs);
    }

    protected deleteJobInCache(jobId: string): void {
        const currentJobs = this.jobsCache$.getValue();
        const updatedJobs = { ...currentJobs };
        delete updatedJobs[jobId];
        this.jobsCache$.next(updatedJobs);
    }
}

export const JobsStore = new JobsStoreClass();
