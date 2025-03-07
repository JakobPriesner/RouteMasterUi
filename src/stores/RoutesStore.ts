import { BaseStore } from './BaseStore';
import { CancelToken } from 'axios';
import {
    CreateRouteRequest,
    Route,
    StartRouteRequest,
    StartRouteResult,
    AddJobsToRouteRequest,
    DeleteJobsFromRouteRequest,
    RouteState
} from '../types/RoutesTypes';
import { BehaviorSubject } from 'rxjs';
import { useNotifications } from '@toolpad/core/useNotifications';
import {format} from "date-fns";

class RoutesStoreClass extends BaseStore {
    protected cachedPages: { [key: string]: BehaviorSubject<{ routes: Route[] }> } = {};

    getAllRoutes(
        projectId: string,
        fromDate: Date | null = null,
        toDate: Date | null = null,
        routeStates: RouteState[] = [],
        cancelToken?: CancelToken
    ): BehaviorSubject<{ routes: Route[] }> {
        const initialData = { routes: [] };
        const subject = new BehaviorSubject<{ routes: Route[] }>(initialData);
        const formattedFromDate = fromDate ? format(fromDate, "yyyy-MM-dd") : null;
        const formattedToDate = toDate ? format(toDate, "yyyy-MM-dd") : null;
        const formattedRouteStates = routeStates.map((state: RouteState) => state.toString()).join(",");
        const key = `${projectId}|${formattedFromDate}|${formattedToDate}|${formattedRouteStates}`;

        if (this.cachedPages[key]) {
            this.cachedPages[key].subscribe(subject);
            return subject;
        }
        this.cachedPages[key] = subject;

        this.axios
            .get<{ routes: Route[] }>(`/v1/projects/${projectId}/routes`, { params: {fromDate: formattedFromDate, toDate: formattedToDate, routeStates: formattedRouteStates}, cancelToken })
            .then(response => {
                subject.next(response.data);
            })
            .catch(error => {
                this.handleError(error, 'Failed to fetch routes.');
                subject.error(error);
            });

        return subject;
    }

    createRoute(
        projectId: string,
        routeData: CreateRouteRequest,
        cancelToken?: CancelToken
    ): Promise<string> {
        return this.axios
            .post<string>(`/v1/projects/${projectId}/routes`, routeData, { cancelToken })
            .then(result => {
                return result.data;
            })
            .catch(error => {
                this.handleError(error, 'Failed to create route.');
                throw error;
            });
    }

    addJobsToRoute(
        projectId: string,
        routeId: string,
        addJobsData: AddJobsToRouteRequest,
        cancelToken?: CancelToken
    ): BehaviorSubject<null> {
        const subject = new BehaviorSubject<null>(null);
        const notifications = useNotifications();
        this.axios
            .post(`/v1/projects/${projectId}/routes/${routeId}`, addJobsData, { cancelToken })
            .then(() => {
                notifications.show('Jobs added to route successfully!', { severity: 'success', autoHideDuration: 3000 });
                subject.next(null);
            })
            .catch(error => {
                this.handleError(error, 'Failed to add jobs to route.');
                subject.error(error);
            });
        return subject;
    }

    deleteRoute(
        projectId: string,
        routeId: string,
        cancelToken?: CancelToken
    ): Promise<void> {
        const notifications = useNotifications();
        return this.axios
            .delete(`/v1/projects/${projectId}/routes/${routeId}`, { cancelToken })
            .then(() => {
                notifications.show('Route deleted successfully!', { severity: 'success', autoHideDuration: 3000 });
            })
            .catch(error => {
                this.handleError(error, 'Failed to delete route.');
            });
    }

    deleteJobsFromRoute(
        projectId: string,
        routeId: string,
        deleteJobsData: DeleteJobsFromRouteRequest,
        cancelToken?: CancelToken
    ): BehaviorSubject<null> {
        const subject = new BehaviorSubject<null>(null);
        const notifications = useNotifications();
        this.axios
            .delete(`/v1/projects/${projectId}/routes/${routeId}/jobs`, { data: deleteJobsData, cancelToken })
            .then(() => {
                notifications.show('Jobs removed from route successfully!', { severity: 'success', autoHideDuration: 3000 });
                subject.next(null);
            })
            .catch(error => {
                this.handleError(error, 'Failed to remove jobs from route.');
                subject.error(error);
            });
        return subject;
    }

    startRoute(
        projectId: string,
        routeId: string,
        startRouteData: StartRouteRequest,
        cancelToken?: CancelToken
    ): BehaviorSubject<StartRouteResult | null> {
        const subject = new BehaviorSubject<StartRouteResult | null>(null);
        const notifications = useNotifications();
        this.axios
            .post<StartRouteResult>(`/v1/projects/${projectId}/routes/${routeId}/start`, startRouteData, { cancelToken })
            .then(response => {
                notifications.show('Route started successfully!', { severity: 'success', autoHideDuration: 3000 });
                subject.next(response.data);
            })
            .catch(error => {
                this.handleError(error, 'Failed to start route.');
                subject.error(error);
            });
        return subject;
    }
}

export const RoutesStore = new RoutesStoreClass();
