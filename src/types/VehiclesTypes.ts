// src/types/VehiclesTypes.ts

import { AddAddressRequest } from './ContactsTypes';

export interface AddVehicleRequest {
    alias?: string;
    licencePlate: string;
    imageUrl?: string;
    availableLoadInKilograms?: number;
    parkingPosition?: AddAddressRequest;
    vehicleType: VehicleType;
}

export type VehicleType = 'Truck' | 'Car' | 'Motorcycle' | 'Bicycle' | 'Walking';

export interface Vehicle {
    id: string;
    vehicleType: VehicleType;
    alias?: string;
    licencePlate: string;
    imageUrl?: string;
    availableLoadInKilograms?: number;
    parkingPosition?: AddAddressRequest;
}

export interface GetAllVehiclesResult {
    vehicles: Vehicle[];
}

export interface GetVehicleByIdResult {
    vehicle: Vehicle;
}
