// src/stores/RoutesStore.ts
import { BaseStore } from './BaseStore';
import { CancelToken } from 'axios';
import {
    CreateRouteRequest,
    Route,
    StartRouteRequest,
    StartRouteResult,
    AddJobsToRouteRequest,
    DeleteJobsFromRouteRequest,
} from '../types/RoutesTypes';
import {useNotifications} from "@toolpad/core/useNotifications";

class RoutesStoreClass extends BaseStore<Route[]> {
    async getAllRoutes(
        projectId: string,
        filters: { fromDate?: string; toDate?: string; routeStates?: string } = {},
        cancelToken?: CancelToken
    ): Promise<Route[]> {
        try {
            const response = await this.axios.get<{ routes: Route[] }>(
                `/v1/projects/${projectId}/routes`,
                { params: filters, cancelToken }
            );
            this.setState(response.data.routes);
            return response.data.routes;
        } catch (error: any) {
            this.handleError(error, 'Failed to fetch routes.');
            throw error;
        }
    }

    async createRoute(
        projectId: string,
        routeData: CreateRouteRequest,
        cancelToken?: CancelToken
    ): Promise<string> {
        const notifications = useNotifications();
        try {
            const response = await this.axios.post<string>(
                `/v1/projects/${projectId}/routes`,
                routeData,
                { cancelToken }
            );
            notifications.show('Route created successfully!', {
                severity: 'success',
                autoHideDuration: 3000,
            });
            return response.data;
        } catch (error: any) {
            this.handleError(error, 'Failed to create route.');
            throw error;
        }
    }

    async addJobsToRoute(
        projectId: string,
        routeId: string,
        addJobsData: AddJobsToRouteRequest,
        cancelToken?: CancelToken
    ): Promise<void> {
        const notifications = useNotifications();
        try {
            await this.axios.post(
                `/v1/projects/${projectId}/routes/${routeId}`,
                addJobsData,
                { cancelToken }
            );
            notifications.show('Jobs added to route successfully!', {
                severity: 'success',
                autoHideDuration: 3000,
            });
        } catch (error: any) {
            this.handleError(error, 'Failed to add jobs to route.');
            throw error;
        }
    }

    async deleteRoute(
        projectId: string,
        routeId: string,
        cancelToken?: CancelToken
    ): Promise<void> {
        const notifications = useNotifications();
        try {
            await this.axios.delete(
                `/v1/projects/${projectId}/routes/${routeId}`,
                { cancelToken }
            );
            notifications.show('Route deleted successfully!', {
                severity: 'success',
                autoHideDuration: 3000,
            });
        } catch (error: any) {
            this.handleError(error, 'Failed to delete route.');
            throw error;
        }
    }

    async deleteJobsFromRoute(
        projectId: string,
        routeId: string,
        deleteJobsData: DeleteJobsFromRouteRequest,
        cancelToken?: CancelToken
    ): Promise<void> {
        const notifications = useNotifications();
        try {
            await this.axios.delete(
                `/v1/projects/${projectId}/routes/${routeId}/jobs`,
                { data: deleteJobsData, cancelToken }
            );
            notifications.show('Jobs removed from route successfully!', {
                severity: 'success',
                autoHideDuration: 3000,
            });
        } catch (error: any) {
            this.handleError(error, 'Failed to remove jobs from route.');
            throw error;
        }
    }

    async startRoute(
        projectId: string,
        routeId: string,
        startRouteData: StartRouteRequest,
        cancelToken?: CancelToken
    ): Promise<StartRouteResult> {
        const notifications = useNotifications();
        try {
            const response = await this.axios.post<StartRouteResult>(
                `/v1/projects/${projectId}/routes/${routeId}/start`,
                startRouteData,
                { cancelToken }
            );
            notifications.show('Route started successfully!', {
                severity: 'success',
                autoHideDuration: 3000,
            });
            return response.data;
        } catch (error: any) {
            this.handleError(error, 'Failed to start route.');
            throw error;
        }
    }
}

export const RoutesStore = new RoutesStoreClass();
