import { BaseStore } from './BaseStore';
import { CancelToken } from 'axios';
import {
    AddVehicleRequest,
    GetAllVehiclesResult,
    GetVehicleByIdResult,
    Vehicle,
} from '../types/VehiclesTypes';
import {useNotifications} from "@toolpad/core/useNotifications";

class VehiclesStoreClass extends BaseStore<GetAllVehiclesResult> {
    async addVehicleToProject(
        projectId: string,
        vehicleData: AddVehicleRequest,
        cancelToken?: CancelToken
    ): Promise<string> {
        const notifications = useNotifications();
        try {
            const response = await this.axios.post<string>(
                `/v1/projects/${projectId}/vehicles`,
                vehicleData,
                { cancelToken }
            );
            notifications.show('Vehicle added successfully!', {
                severity: 'success',
                autoHideDuration: 3000,
            });
            await this.getAllVehiclesOfProject(projectId, cancelToken);
            return response.data;
        } catch (error: any) {
            this.handleError(error, 'Failed to add vehicle.');
            throw error;
        }
    }

    async getAllVehiclesOfProject(
        projectId: string,
        cancelToken?: CancelToken
    ): Promise<GetAllVehiclesResult> {
        try {
            const response = await this.axios.get<GetAllVehiclesResult>(
                `/v1/projects/${projectId}/vehicles`,
                { cancelToken }
            );
            this.setState(response.data);
            return response.data;
        } catch (error: any) {
            this.handleError(error, 'Failed to fetch vehicles.');
            throw error;
        }
    }

    async getVehicleById(
        projectId: string,
        vehicleId: string,
        cancelToken?: CancelToken
    ): Promise<Vehicle> {
        try {
            const response = await this.axios.get<GetVehicleByIdResult>(
                `/v1/projects/${projectId}/vehicles/${vehicleId}`,
                { cancelToken }
            );
            return response.data.vehicle;
        } catch (error: any) {
            this.handleError(error, 'Failed to fetch vehicle.');
            throw error;
        }
    }

    async updateVehicle(
        projectId: string,
        vehicleId: string,
        vehicleData: Partial<Vehicle>,
        cancelToken?: CancelToken
    ): Promise<void> {
        const notifications = useNotifications();
        const url = `/v1/projects/${projectId}/vehicles/${vehicleId}`;
        try {
            await this.axios.put(url, vehicleData, { cancelToken });
            notifications.show('Vehicle updated successfully!', {
                severity: 'success',
                autoHideDuration: 3000,
            });
            await this.getAllVehiclesOfProject(projectId, cancelToken);
        } catch (error: any) {
            this.handleError(error, 'Failed to update vehicle.');
            throw error;
        }
    }

    async deleteVehicleById(
        projectId: string,
        vehicleId: string,
        cancelToken?: CancelToken
    ): Promise<void> {
        const notifications = useNotifications();
        const url = `/v1/projects/${projectId}/vehicles/${vehicleId}`;
        try {
            await this.axios.delete(url, { cancelToken });
            notifications.show('Vehicle deleted successfully!', {
                severity: 'success',
                autoHideDuration: 3000,
            });
            await this.getAllVehiclesOfProject(projectId, cancelToken);
        } catch (error: any) {
            this.handleError(error, 'Failed to delete vehicle.');
            throw error;
        }
    }
}

export const VehiclesStore = new VehiclesStoreClass();
