import * as React from 'react';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Select, { SelectChangeEvent, selectClasses } from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import {User} from "../../types/UsersTypes";
import {UsersStore} from "../../stores/UsersStore";
import CreateProjectDialog from "../../dialogs/createProjectDialog";
import {Subscription} from "rxjs";
import {useSelectedProject} from "../../stores/SelectedProjectStore";

export default function ProjectSelect() {
    const [user, setUser] = useState<User | null>(null);
    const {selectedProject} = useSelectedProject();
    const navigate = useNavigate();
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userSubscription: Subscription = UsersStore.getCurrentUser().subscribe({
            next: (userData) => {
                setUser(userData);
                setLoading(false);
            },
            error: () => {
                setLoading(false);
            }
        });

        return () => {
            userSubscription.unsubscribe();
        };
    }, []);

    const handleChange = (event: SelectChangeEvent) => {
        if (event.target.value === 'new') {
            setIsDialogOpen(true);
            return;
        }
        navigate(`/projects/${event.target.value}`);
    };

    const renderProjectsSelection = () => {
        if (loading) {
            return null; // Could add a loading indicator here
        }

        if (!user?.projects?.length) {
            return (
                <Button fullWidth onClick={() => setIsDialogOpen(true)}>
                    Projekt erstellen
                </Button>
            );
        }

        return (
            <FormControl size="small">
                <Select
                    labelId="project-select"
                    id="project-select"
                    value={selectedProject?.projectId || ''}
                    onChange={handleChange}
                    displayEmpty
                    fullWidth
                    sx={{
                        width: 215,
                        '&.MuiList-root': {
                            p: '8px',
                        },
                        [`& .${selectClasses.select}`]: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            pl: 1,
                        },
                    }}
                >
                    {user.projects.map((project, index) => (
                        <MenuItem key={index} value={project.projectId}>
                            <ListItemText primary={project.projectName} />
                        </MenuItem>
                    ))}

                    <Divider sx={{ mx: -1 }} />
                    <MenuItem value="new">
                        <ListItemIcon>
                            <AddRoundedIcon />
                        </ListItemIcon>
                        <ListItemText primary="Neues Projekt" />
                    </MenuItem>
                </Select>
            </FormControl>
        );
    };

    return (
        <div>
            {renderProjectsSelection()}
            <CreateProjectDialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
        </div>
    );
}