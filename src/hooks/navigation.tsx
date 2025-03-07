import type { Navigation } from "@toolpad/core/AppProvider";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
    AssignmentRounded,
    ContactsRounded,
    LocalShippingRounded,
    RouteRounded,
    SettingsRounded
} from "@mui/icons-material";
import {ProjectsStore} from "../stores/ProjectsStore";
import {Project} from "../types/ProjectsTypes";

export const useNavigation = (): Navigation => {
    const { projectId } = useParams();
    const [navigation, setNavigation] = useState<Navigation>();

    useEffect(() => {
        const subscription = ProjectsStore.getProjectById(projectId).subscribe((project) => {
            const newNavigation = createNavigation(project);

            setNavigation(newNavigation);
        });
        return () => subscription.unsubscribe();
    }, [projectId]);

    function createNavigation(project: Project | null): Navigation {
        const newNavigation: Navigation = [];

        if (projectId) {
            newNavigation.push(
                {
                    kind: 'header',
                    title: project ? project.name : "Projekt"
                },
                {
                    segment: `projects/${projectId}/settings`,
                    title: 'Einstellungen',
                    icon: <SettingsRounded />,
                },
                {
                    segment: `projects/${projectId}/contacts`,
                    title: 'Kontakte',
                    icon: <ContactsRounded />
                },
                {
                    segment: `projects/${projectId}/vehicles`,
                    title: 'Fahrzeuge',
                    icon: <LocalShippingRounded />
                },
                {
                    segment: `projects/${projectId}/jobs`,
                    title: 'Aufträge',
                    icon: <AssignmentRounded />
                },
                {
                    segment: `projects/${projectId}/routes`,
                    title: 'Routen',
                    icon: <RouteRounded />
                }
            );

            return newNavigation;
        }
    }

    return navigation;
};
