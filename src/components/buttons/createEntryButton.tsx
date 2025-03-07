import React, {JSX} from "react";
import {Button} from "@mui/material";
import {AddRounded} from "@mui/icons-material";

interface CreateEntryButtonProps {
    onClick: () => void;
    startIcon?: JSX.Element;
    endIcon?: JSX.Element;
    text?: string;
    variant?: "text" | "outlined" | "contained";
    color?: "error" | "inherit" | "success" | "warning" | "info" | "primary" | "secondary" | undefined;
    size?: "small" | "medium" | "large" | undefined;
    disabled?: boolean;
}

const CreateEntryButton : React.FC<CreateEntryButtonProps> = ({onClick, startIcon, endIcon, text, variant, color, size, disabled = false}) => {
    return (
        <Button onClick={onClick}
                variant={variant ?? "contained"}
                startIcon={startIcon ?? <AddRounded />}
                endIcon={endIcon}
                color={color}
                disabled={disabled}
                aria-label="add"
                size={size}
        >
            {text ?? "Hinzufügen"}
        </Button>
    )
}

export default CreateEntryButton;
