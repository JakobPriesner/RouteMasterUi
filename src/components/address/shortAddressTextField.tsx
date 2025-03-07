import {Alert} from "@mui/material";
import React from "react";
import {Address} from "../../types/AddressTypes";

interface ShortAddressTextFieldProps {
    address: Address | undefined;
    size: "small" | "medium" | "large";
}

const ShortAddressTextField: React.FC<ShortAddressTextFieldProps> = ({address, size="medium"}) => {
    if (!address) {
        return (
            <Alert
                variant="outlined"
                severity="info"
                sx={{
                    fontSize: size === "small" ? "0.875rem" : size === "large" ? "1.125rem" : "1rem",
                    padding: size === "small" ? "0rem" : size === "large" ? "1rem" : "0.75rem",
                    paddingLeft: size === "small" ? "0.3rem" : size === "large" ? "1rem" : "0.75rem"
                }}
            >
                keine Addresse vorhanden
            </Alert>
        )
    }

    return (
        <div style={{
            fontSize: size === "small" ? "0.875rem" : size === "large" ? "1.125rem" : "1rem"
        }}>
            {address.street} {address.houseNumber}, {address.zip} {address.city}
        </div>
    )
}

export default ShortAddressTextField;
