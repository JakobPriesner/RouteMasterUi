import * as React from 'react';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import ProjectSelect from "../components/navigation/projectSelect";
import CreateProjectDialog from "../dialogs/createProjectDialog";
import { User } from "../types/UsersTypes";
import { UsersStore } from "../stores/UsersStore";
import Grid from "@mui/material/Grid2";

export default function HomePage() {
    const [user, setUser] = useState<User | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const subscription = UsersStore.getCurrentUser().subscribe({
            next: (userData) => {
                setUser(userData);
                // Show create project dialog if user has no projects
                if (userData && userData.projects.length === 0) {
                    setShowCreateDialog(true);
                }
                setLoading(false);
            },
            error: () => {
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={2}>
                <Grid size={{xs: 12, sm: 6}}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Welcome to Route Master
                    </Typography>

                    {!loading && user && (
                        <>
                            <ProjectSelect />
                            <CreateProjectDialog
                                open={showCreateDialog}
                                onClose={() => setShowCreateDialog(false)}
                            />
                        </>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
}