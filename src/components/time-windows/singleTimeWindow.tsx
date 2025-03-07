import React from "react";
import Chip from "@mui/material/Chip";
import {TimeWindow} from "../../types/JobTypes";

interface SingleTimeWindowProps {
    timeWindow: TimeWindow;
    onDelete(timeWindow: TimeWindow): void;
    deletable: boolean;
}

const SingleTimeWindow: React.FC<SingleTimeWindowProps> = ({timeWindow, onDelete, deletable}) => {
    if (deletable){
        return (
            <Chip onDelete={() => onDelete(timeWindow)} label={`${timeWindow.startTime} - ${timeWindow.endTime}`} />
        )
    }
    return (
        <Chip label={`${timeWindow.startTime} - ${timeWindow.endTime}`} />
    )

}

export default SingleTimeWindow;
