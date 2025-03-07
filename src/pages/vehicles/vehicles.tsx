import React from "react";
import VehiclesTable from "../../components/vehicles/vehiclesTable";

export default function Vehicles() {
    return (
        <VehiclesTable onUpdate={() => {}}
                          selectable={false}
                          showAvailableLoadFilter={true}
                          showVehicleTypeFilter={true}
        />
    )
}
