import { BaseStore } from './BaseStore';
import { CancelToken } from 'axios';
import { AddProjectRequest, GetAllProjectsResult, Project, ProjectAnalyticsResult } from '../types/ProjectsTypes';
import {useNotifications} from "@toolpad/core/useNotifications";

class ProjectsStoreClass extends BaseStore<GetAllProjectsResult> {
    async addProject(
        projectData: AddProjectRequest,
        cancelToken?: CancelToken
    ): Promise<string> {
        const notifications = useNotifications();
        try {
            const response = await this.axios.post<string>(
                '/v1/projects',
                projectData,
                { cancelToken }
            );
            notifications.show('Project added successfully!', {
                severity: 'success',
                autoHideDuration: 3000,
            });
            await this.getAllProjectsOfUser(cancelToken);
            return response.data;
        } catch (error: any) {
            this.handleError(error, 'Failed to add project.');
            throw error;
        }
    }

    async getAllProjectsOfUser(cancelToken?: CancelToken): Promise<GetAllProjectsResult> {
        try {
            const response = await this.axios.get<GetAllProjectsResult>(
                '/v1/projects',
                { cancelToken }
            );
            this.setState(response.data);
            return response.data;
        } catch (error: any) {
            this.handleError(error, 'Failed to fetch projects.');
            throw error;
        }
    }

    async deleteAllProjectsOfUser(cancelToken?: CancelToken): Promise<void> {
        const notifications = useNotifications();
        try {
            await this.axios.delete('/v1/projects', { cancelToken });
            notifications.show('All projects deleted successfully!', {
                severity: 'success',
                autoHideDuration: 3000,
            });
            this.setState(null);
        } catch (error: any) {
            this.handleError(error, 'Failed to delete projects.');
            throw error;
        }
    }

    async getProjectById(
        projectId: string,
        cancelToken?: CancelToken
    ): Promise<Project> {
        try {
            const response = await this.axios.get<Project>(
                `/v1/projects/${projectId}`,
                { cancelToken }
            );
            return response.data;
        } catch (error: any) {
            this.handleError(error, 'Failed to fetch project.');
            throw error;
        }
    }

    async updateProject(
        projectId: string,
        projectData: Project,
        cancelToken?: CancelToken
    ): Promise<void> {
        const notifications = useNotifications();
        const url = `/v1/projects/${projectId}`;
        try {
            await this.axios.put(url, projectData, { cancelToken });
            notifications.show('Project updated successfully!', {
                severity: 'success',
                autoHideDuration: 3000,
            });
        } catch (error: any) {
            this.handleError(error, 'Failed to update project.');
            throw error;
        }
    }

    async deleteProjectById(
        projectId: string,
        cancelToken?: CancelToken
    ): Promise<void> {
        const notifications = useNotifications();
        const url = `/v1/projects/${projectId}`;
        try {
            await this.axios.delete(url, { cancelToken });
            notifications.show('Project deleted successfully!', {
                severity: 'success',
                autoHideDuration: 3000,
            });
            await this.getAllProjectsOfUser(cancelToken);
        } catch (error: any) {
            this.handleError(error, 'Failed to delete project.');
            throw error;
        }
    }

    async getProjectAnalytics(
        projectId: string,
        cancelToken?: CancelToken
    ): Promise<ProjectAnalyticsResult> {
        try {
            const response = await this.axios.get<ProjectAnalyticsResult>(
                `/v1/projects/${projectId}/analytics`,
                { cancelToken }
            );
            return response.data;
        } catch (error: any) {
            this.handleError(error, 'Failed to fetch project analytics.');
            throw error;
        }
    }
}

export const ProjectsStore = new ProjectsStoreClass();
