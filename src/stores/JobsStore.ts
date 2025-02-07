import { BaseStore } from './BaseStore';
import { CancelToken } from 'axios';
import {useNotifications} from "@toolpad/core/useNotifications";
import {AddJobRequest, GetAllJobsResult, GetSingleJobResult, Job} from "../types/JobTypes";

class JobsStoreClass extends BaseStore<GetAllJobsResult> {
    async addJob(
        projectId: string,
        jobData: AddJobRequest,
        cancelToken?: CancelToken
    ): Promise<string> {
        const notifications = useNotifications();
        try {
            const response = await this.axios.post<string>(
                `/v1/projects/${projectId}/jobs`,
                jobData,
                { cancelToken }
            );
            notifications.show('Job added successfully!', {
                severity: 'success',
                autoHideDuration: 3000,
            });
            await this.getAllJobs(projectId, {}, cancelToken);
            return response.data;
        } catch (error: any) {
            this.handleError(error, 'Failed to add job.');
            throw error;
        }
    }

    async getAllJobs(
        projectId: string,
        filters: { onDate?: string; fromDate?: string; toDate?: string; states?: string; page?: number; pageSize?: number } = {},
        cancelToken?: CancelToken
    ): Promise<GetAllJobsResult> {
        const notifications = useNotifications();
        try {
            const response = await this.axios.get<GetAllJobsResult>(
                `/v1/projects/${projectId}/jobs`,
                { params: filters, cancelToken }
            );
            this.setState(response.data);
            return response.data;
        } catch (error: any) {
            this.handleError(error, 'Failed to fetch jobs.');
            throw error;
        }
    }

    async getJobById(
        projectId: string,
        jobId: string,
        cancelToken?: CancelToken
    ): Promise<GetSingleJobResult> {
        const notifications = useNotifications();
        try {
            const response = await this.axios.get<GetSingleJobResult>(
                `/v1/projects/${projectId}/jobs/${jobId}`,
                { cancelToken }
            );
            return response.data;
        } catch (error: any) {
            this.handleError(error, 'Failed to fetch job.');
            throw error;
        }
    }

    async updateJob(
        projectId: string,
        jobId: string,
        jobData: Partial<Job>,
        cancelToken?: CancelToken
    ): Promise<void> {
        const notifications = useNotifications();
        const url = `/v1/projects/${projectId}/jobs/${jobId}`;
        try {
            await this.axios.put(url, jobData, { cancelToken });
            notifications.show('Job updated successfully!', {
                severity: 'success',
                autoHideDuration: 3000,
            });
            await this.getAllJobs(projectId, {}, cancelToken);
        } catch (error: any) {
            this.handleError(error, 'Failed to update job.');
            throw error;
        }
    }

    async deleteJobById(
        projectId: string,
        jobId: string,
        cancelToken?: CancelToken
    ): Promise<void> {
        const notifications = useNotifications();
        const url = `/v1/projects/${projectId}/jobs/${jobId}`;
        try {
            await this.axios.delete(url, { cancelToken });
            notifications.show('Job deleted successfully!', {
                severity: 'success',
                autoHideDuration: 3000,
            });
            await this.getAllJobs(projectId, {}, cancelToken);
        } catch (error: any) {
            this.handleError(error, 'Failed to delete job.');
            throw error;
        }
    }
}

export const JobsStore = new JobsStoreClass();
