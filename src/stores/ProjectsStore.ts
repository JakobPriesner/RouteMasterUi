import { BaseStore } from './BaseStore';
import { CancelToken } from 'axios';
import { AddProjectRequest, GetAllProjectsResult, GetSingleProjectResult, Project, ProjectAnalyticsResult } from '../types/ProjectsTypes';
import { BehaviorSubject } from 'rxjs';

class ProjectsStoreClass extends BaseStore {
    protected projectsCache$ = new BehaviorSubject<{ [projectId: string]: Project }>({});

    getAllProjectsOfUser(cancelToken?: CancelToken): BehaviorSubject<Project[]> {
        const subject = new BehaviorSubject<Project[]>([]);
        this.axios
            .get<GetAllProjectsResult>('/v1/projects', { cancelToken })
            .then(response => {
                const projects = response.data.projects;
                const cache = this.projectsCache$.getValue();
                projects.forEach(project => {
                    cache[project.id] = project;
                });
                this.projectsCache$.next(cache);
                subject.next(Object.values(cache));
            })
            .catch(error => {
                this.handleError(error, 'Es gab ein Problem beim Laden der Projekte.');
                subject.error(error);
            });
        return subject;
    }

    getProjectById(projectId: string, cancelToken?: CancelToken): BehaviorSubject<Project | null> {
        const subject = new BehaviorSubject<Project | null>(null);
        this.projectsCache$.subscribe(cache => {
            if (cache[projectId]) {
                subject.next(cache[projectId]);
                return;
            }
            this.axios
                .get<GetSingleProjectResult>(`/v1/projects/${projectId}`, { cancelToken })
                .then(response => {
                    const project = response.data.project;
                    const currentCache = this.projectsCache$.getValue();
                    currentCache[project.id] = project;
                    this.projectsCache$.next(currentCache);
                    subject.next(project);
                })
                .catch(error => {
                    this.handleError(error, 'Es gab ein Problem beim Laden des Projekts.');
                    subject.error(error);
                });
        });
        return subject;
    }

    addProject(projectData: AddProjectRequest, cancelToken?: CancelToken): Promise<string> {
        return this.axios
            .post<string>('/v1/projects', projectData, { cancelToken })
            .then(response => {
                this.getAllProjectsOfUser(cancelToken);
                return response.data;
            })
            .catch(error => {
                this.handleError(error, 'Es gab ein Problem beim Erstellen des Projekts.');
                throw error;
            });
    }

    async updateProject(projectId: string, projectData: Project, cancelToken?: CancelToken): Promise<void> {

        try {
            await this.axios.put(`/v1/projects/${projectId}`, projectData, { cancelToken });
            const currentCache = this.projectsCache$.getValue();
            currentCache[projectId] = projectData;
            this.projectsCache$.next(currentCache);
        } catch (error) {
            this.handleError(error, 'Es gab ein Problem beim Ändern des Projekts.');
        }
    }

    async deleteProjectById(projectId: string, cancelToken?: CancelToken): Promise<void> {
        const subject = new BehaviorSubject<null>(null);

        try {
            await this.axios.delete(`/v1/projects/${projectId}`, { cancelToken });
            const currentCache = this.projectsCache$.getValue();
            delete currentCache[projectId];
            this.projectsCache$.next(currentCache);
        } catch (error) {
            this.handleError(error, 'Es gab ein Problem beim Löschen des Projekts.');
            subject.error(error);
        }
    }

    getProjectAnalytics(projectId: string, cancelToken?: CancelToken): BehaviorSubject<ProjectAnalyticsResult | null> {
        const subject = new BehaviorSubject<ProjectAnalyticsResult | null>(null);
        this.axios
            .get<ProjectAnalyticsResult>(`/v1/projects/${projectId}/analytics`, { cancelToken })
            .then(response => {
                subject.next(response.data);
            })
            .catch(error => {
                this.handleError(error, 'Es gab ein Problem beim Laden der Projekt Analysen.');
                subject.error(error);
            });
        return subject;
    }
}

export const ProjectsStore = new ProjectsStoreClass();
