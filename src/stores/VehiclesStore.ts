import { BaseStore } from './BaseStore';
import { CancelToken } from 'axios';
import { AddVehicleRequest, GetAllVehiclesResult, GetVehicleByIdResult, Vehicle } from '../types/VehiclesTypes';
import { BehaviorSubject } from 'rxjs';

class VehiclesStoreClass extends BaseStore {
    protected vehiclesCache$ = new BehaviorSubject<{ [vehicleId: string]: Vehicle }>({});

    addVehicleToProject(
        projectId: string,
        vehicleData: AddVehicleRequest,
        cancelToken?: CancelToken
    ): BehaviorSubject<string | null> {
        const subject = new BehaviorSubject<string | null>(null);
        this.axios
            .post<string>(`/v1/projects/${projectId}/vehicles`, vehicleData, { cancelToken })
            .then(response => {
                this.getAllVehiclesOfProject(projectId, cancelToken);
                subject.next(response.data);
            })
            .catch(error => {
                this.handleError(error, 'Failed to add vehicle.');
                subject.error(error);
            });
        return subject;
    }

    getAllVehiclesOfProject(
        projectId: string,
        cancelToken?: CancelToken
    ): BehaviorSubject<Vehicle[]> {
        const subject = new BehaviorSubject<Vehicle[]>([]);
        this.axios
            .get<GetAllVehiclesResult>(`/v1/projects/${projectId}/vehicles`, { cancelToken })
            .then(response => {
                const vehicles = response.data.vehicles;
                const currentCache = this.vehiclesCache$.getValue();
                vehicles.forEach(vehicle => {
                    currentCache[vehicle.id] = vehicle;
                });
                this.vehiclesCache$.next(currentCache);
                subject.next(Object.values(currentCache));
            })
            .catch(error => this.handleError(error, 'Failed to fetch vehicles.'));
        return subject;
    }

    getVehicleById(
        projectId: string,
        vehicleId: string,
        cancelToken?: CancelToken
    ): BehaviorSubject<Vehicle | null> {
        const subject = new BehaviorSubject<Vehicle | null>(null);
        this.vehiclesCache$.subscribe(cache => {
            if (cache[vehicleId]) {
                subject.next(cache[vehicleId]);
                return;
            }
            this.axios
                .get<GetVehicleByIdResult>(`/v1/projects/${projectId}/vehicles/${vehicleId}`, { cancelToken })
                .then(response => {
                    const vehicle = response.data.vehicle;
                    const currentCache = this.vehiclesCache$.getValue();
                    currentCache[vehicle.id] = vehicle;
                    this.vehiclesCache$.next(currentCache);
                    subject.next(vehicle);
                })
                .catch(error => this.handleError(error, 'Failed to fetch vehicle.'));
        });
        return subject;
    }

    updateVehicle(
        projectId: string,
        vehicleId: string,
        vehicleData: Partial<Vehicle>,
        cancelToken?: CancelToken
    ): BehaviorSubject<null> {
        const subject = new BehaviorSubject<null>(null);
        this.axios
            .put(`/v1/projects/${projectId}/vehicles/${vehicleId}`, vehicleData, { cancelToken })
            .then(() => {
                this.getAllVehiclesOfProject(projectId, cancelToken);
                subject.next(null);
            })
            .catch(error => {
                this.handleError(error, 'Failed to update vehicle.');
                subject.error(error);
            });
        return subject;
    }

    deleteVehicleById(
        projectId: string,
        vehicleId: string,
        cancelToken?: CancelToken
    ): BehaviorSubject<null> {
        const subject = new BehaviorSubject<null>(null);
        this.axios
            .delete(`/v1/projects/${projectId}/vehicles/${vehicleId}`, { cancelToken })
            .then(() => {
                this.getAllVehiclesOfProject(projectId, cancelToken);
                subject.next(null);
            })
            .catch(error => {
                this.handleError(error, 'Failed to delete vehicle.');
                subject.error(error);
            });
        return subject;
    }
}

export const VehiclesStore = new VehiclesStoreClass();
