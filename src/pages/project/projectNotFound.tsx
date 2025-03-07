import {useParams} from "react-router";
import {Alert} from "@mui/material";

export default function ProjectNotFound() {
    const {projectId} = useParams();

    return (
        <Alert variant="filled" severity="error">
            Das Projekt mit der ID {projectId} wurde nicht gefunden.
        </Alert>
    )
}
