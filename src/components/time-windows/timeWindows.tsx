import React from "react";
import SingleTimeWindow from "./singleTimeWindow";
import ListItem from "@mui/material/ListItem";
import {TimeWindow} from "../../types/JobTypes";

interface TimeWindowsProps {
    timeWindows: TimeWindow[];
    deletable: boolean;
    onDelete(timeWindow: TimeWindow): void;
}

const TimeWindows: React.FC<TimeWindowsProps> = ({timeWindows, onDelete, deletable}) => {
    return (
        <div>
            {timeWindows.map(timeWindow => (
                <ListItem key={`${timeWindow.startTime}.${timeWindow.endTime}`}>
                    <SingleTimeWindow timeWindow={timeWindow} deletable={deletable} onDelete={() => onDelete(timeWindow)}/>
                </ListItem>
            ))}
        </div>
    )
}

export default TimeWindows;
