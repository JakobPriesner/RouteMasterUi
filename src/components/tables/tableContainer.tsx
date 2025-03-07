import {Paper} from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import React, {ReactNode} from "react";

export const TableContainer: React.FC<{
    children: ReactNode;
    loading?: boolean;
}> = ({ children, loading = false }) => {

    return (
        <Paper
            elevation={0}
            variant="outlined"
            sx={{
                borderRadius: 1,
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            {loading && (
                <LinearProgress
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3
                    }}
                />
            )}
            {children}
        </Paper>
    );
};
