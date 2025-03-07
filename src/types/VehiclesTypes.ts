import { AddAddressRequest } from './ContactsTypes';
import {
    DirectionsBikeRounded,
    DirectionsCarRounded,
    LocalShippingRounded,
    TwoWheelerRounded
} from "@mui/icons-material";

export interface AddVehicleRequest {
    alias?: string;
    licencePlate: string;
    imageUrl?: string;
    availableLoadInKilograms?: number;
    parkingPosition?: AddAddressRequest;
    vehicleType: VehicleType;
}

export enum VehicleType {
    Truck,
    Car,
    Motorcycle,
    Bicycle
}

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

export const VehicleTypeLabels: Record<VehicleType, string> = {
    [VehicleType.Bicycle]: "Fahrrad",
    [VehicleType.Car]: "Auto",
    [VehicleType.Truck]: "Lieferwagen",
    [VehicleType.Motorcycle]: "Zweirad"
}

export const VehicleTypeIcons: Record<VehicleType, React.ElementType> = {
    [VehicleType.Bicycle]: DirectionsBikeRounded,
    [VehicleType.Car]: DirectionsCarRounded,
    [VehicleType.Truck]: LocalShippingRounded,
    [VehicleType.Motorcycle]: TwoWheelerRounded
}
