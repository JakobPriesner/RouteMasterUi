import {Tooltip} from "@mui/material";
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import React from "react";

interface HelpTooltipProps {
    color?: "inherit" | "primary" | "secondary" | "default" | "success" | "error" | "info" | "warning" | undefined;
    text: string;
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({color, text}) => {
    return (
        <Tooltip title={text} style={{marginLeft: 10}}>
            <HelpOutlineRoundedIcon />
        </Tooltip>
    )
};

export default HelpTooltip;
