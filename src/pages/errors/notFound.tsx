import { useNavigate } from "react-router";
import {Box, Container} from "@mui/material";
import React from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {LocalShippingRounded} from "@mui/icons-material";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <Container
            maxWidth="sm"
            sx={{
                textAlign: 'center',
                mt: 8,
                p: 4,
            }}
        >
            <Box
                sx={{
                    mb: 4,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <LocalShippingRounded sx={{ fontSize: 120, color: 'primary.main' }} />
            </Box>

            <Typography variant="h3" component="h1" gutterBottom>
                404 - Page Not Found
            </Typography>

            <Typography variant="body1" sx={{ mb: 4 }}>
                We couldn't locate the delivery route you were looking for.
                It might have been moved or no longer exists.
            </Typography>

            <Button variant="contained" size="large" onClick={() => navigate('/')}>
                Back to Home
            </Button>
        </Container>
    );
}
