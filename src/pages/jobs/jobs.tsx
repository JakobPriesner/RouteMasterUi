import React, { useState } from 'react';
import { Box, Button, useTheme, alpha } from '@mui/material';
import JobsTable from "../../components/jobs/jobTable";
import { JobState } from '../../types/JobTypes';
import CreateJobDialog from "../../dialogs/createJob";
import AddIcon from "@mui/icons-material/Add";
import RouteIcon from "@mui/icons-material/Route";
import CreateRouteDialog from "../../dialogs/createRoute";

export default function Jobs() {
    const theme = useTheme();
    const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
    const [createJobDialogOpen, setCreateJobDialogOpen] = useState(false);
    const [createRouteDialogOpen, setCreateRouteDialogOpen] = useState(false);

    function handleCreateRoute() {
        setCreateRouteDialogOpen(true);
    }

    return (
        <div>
            <CreateJobDialog open={createJobDialogOpen} onClose={() => setCreateJobDialogOpen(false)}/>

            <CreateRouteDialog open={createRouteDialogOpen} onClose={() => setCreateRouteDialogOpen(false)} initialSelectedJobs={selectedJobs} />

            <Box sx={{ mb: 2, display: 'flex', gap: 2, justifyContent: 'end' }}>
                <Button
                    variant="outlined"
                    startIcon={<RouteIcon />}
                    disabled={selectedJobs.length === 0}
                    onClick={() => handleCreateRoute()}
                >
                    Route erstellen
                </Button>

                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateJobDialogOpen(true)}
                >
                    Hinzufügen
                </Button>
            </Box>

            <JobsTable
                onUpdate={(selectedJobs: string[]) => setSelectedJobs(selectedJobs)}
                showDateFilter={true}
                showStateFilter={true}
                initialFromDate={new Date(Date.now())}
                initialStateFilter={[JobState.pending, JobState.inProgress]}
                showNoJobsWarning={false}
            />
        </div>
    );
}
