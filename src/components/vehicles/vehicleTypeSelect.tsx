import {InputBasePropsSizeOverrides, InputLabel, Select} from "@mui/material";
import {VehicleType, VehicleTypeIcons, VehicleTypeLabels} from "../../types/VehiclesTypes";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid2";
import React from "react";
import FormControl from "@mui/material/FormControl";

interface VehicleTypeSelectProps {
    onChange: (vehicleType: VehicleType | VehicleType[]) => void;
    multiSelect: boolean;
    initVehicleType?: VehicleType;
    initMultiSelectVehicleTypes?: VehicleType[];
    required: boolean;
    size: "small" | "medium" | InputBasePropsSizeOverrides;
}

const VehicleTypeSelect: React.FC<VehicleTypeSelectProps> = ({onChange, multiSelect, initVehicleType, initMultiSelectVehicleTypes=[], required=false, size="small"}) => {
    return (
        <FormControl fullWidth>
            <InputLabel id="vehicle-fields-label">Fahrzeugtyp</InputLabel>
            <Select
                multiple={multiSelect}
                required={required}
                value={multiSelect ? initMultiSelectVehicleTypes : initVehicleType}
                onChange={(event) => onChange(event.target.value as VehicleType)}
                size={size}
                label="VehicleType"
            >
                {Object.values(VehicleType).filter((val) => typeof val === 'number')
                    .map((type) => {
                        const Icon = VehicleTypeIcons[type as VehicleType];
                        return (
                            <MenuItem key={VehicleTypeLabels[type as VehicleType]} value={type}>
                                <Grid container spacing={2}>
                                    <Icon />
                                    <span>{VehicleTypeLabels[type as VehicleType]}</span>
                                </Grid>
                            </MenuItem>
                        );
                    })}
            </Select>
        </FormControl>
    );
}

export default VehicleTypeSelect;
