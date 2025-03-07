import React from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Container,
    useTheme
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Wifi, LocalShipping, Refresh } from '@mui/icons-material';

const NoConnection = () => {
    const theme = useTheme();

    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <Container maxWidth="md" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    width: '100%',
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`
                }}
            >
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }} sx={{ textAlign: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                            <Wifi
                                color="error"
                                sx={{
                                    fontSize: 64,
                                    position: 'relative'
                                }}
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    height: '2px',
                                    width: '75px',
                                    backgroundColor: theme.palette.error.main,
                                    transform: 'rotate(-45deg)',
                                    mt: 4
                                }}
                            />
                        </Box>
                        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Keine Verbindung
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" paragraph>
                            Es konnte keine Verbindung zum Server hergestellt werden.
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12 }} sx={{ mb: 3 }}>
                        <Box
                            sx={{
                                p: 2,
                                backgroundColor: theme.palette.grey[50],
                                borderRadius: 1,
                                border: `1px solid ${theme.palette.divider}`
                            }}
                        >
                            <Typography variant="body1" paragraph>
                                <strong>Mögliche Ursachen:</strong>
                            </Typography>
                            <Typography component="div">
                                <ul>
                                    <li>Internetverbindung ist unterbrochen</li>
                                    <li>Server ist vorübergehend nicht erreichbar</li>
                                    <li>Firewall oder Netzwerkeinstellungen blockieren die Verbindung</li>
                                </ul>
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }} sx={{ mb: 2 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<LocalShipping />}
                            onClick={() => {}}
                            sx={{
                                p: 1.5,
                                textTransform: 'none',
                                borderColor: theme.palette.primary.main,
                            }}
                        >
                            Offline-Daten anzeigen
                        </Button>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }} sx={{ mb: 2 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            startIcon={<Refresh />}
                            onClick={handleRetry}
                            sx={{
                                p: 1.5,
                                textTransform: 'none',
                                boxShadow: theme.shadows[2],
                            }}
                        >
                            Verbindung wiederherstellen
                        </Button>
                    </Grid>

                    <Grid size={{ xs: 12 }} sx={{ textAlign: 'center', mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Falls das Problem weiterhin besteht, kontaktieren Sie bitte den Support unter <strong>support@delivery-optimizer.de</strong>
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default NoConnection;
