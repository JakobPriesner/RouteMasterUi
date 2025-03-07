import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { UsersStore } from "./UsersStore";
import { ProjectOfUser } from "../types/UsersToProjectsTypes";
import {User} from "../types/UsersTypes";

export const useSelectedProject = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [selectedProject, setSelectedProject] = useState<ProjectOfUser | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<User | undefined>(undefined);

    useEffect(() => {
        UsersStore.getCurrentUser().subscribe(user => setUser(user));
    }, []);

    useEffect(() => {
        let isMounted = true;

        const updateSelectedProject = async () => {
            if (!user) {
                return;
            }

            try {
                let project: ProjectOfUser | undefined = undefined;

                if (projectId) {
                    project = user.projects.find(p => p.projectId === projectId);
                }

                if (isMounted) {
                    setSelectedProject(project);
                }
            } catch (error) {
                console.error("Error updating selected project:", error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        updateSelectedProject();

        return () => {
            isMounted = false;
        };
    }, [projectId]);

    return { selectedProject, loading };
};
