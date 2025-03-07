import React from "react";
import {Address} from "../../types/AddressTypes";
import ShortAddressTextField from "../address/shortAddressTextField";

interface ContactFieldProps {
    value: string | Address;
}

const ContactField: React.FC<ContactFieldProps> = ({value}) => {
    if (typeof value === "string") {
        return (<span>{value}</span>)
    }

    return (<ShortAddressTextField address={value} />)
}
