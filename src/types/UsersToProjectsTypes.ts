// src/types/UsersToProjectsTypes.ts

export type Actions =
    | 'ManageUsers'
    | 'DeleteProject'
    | 'EditProjectSettings'
    | 'EditUserPermissions'
    | 'UploadFiles';

export interface AddUserToProjectRequest {
    permissions: Actions[];
    isDefaultProject?: boolean;
}

export interface AddUserToProjectResult {
    userId: string;
    projectId: string;
    projectName: string;
}

export interface ProjectOfUser {
    projectId: string;
    projectName: string;
    permissions: Actions[];
    isDefaultProject?: boolean;
}
