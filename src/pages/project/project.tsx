import {useSelectedProject} from "../../stores/SelectedProjectStore";

export default function Project() {
    const {selectedProject} = useSelectedProject();

    if (!selectedProject) {
        return (<div>Welcome</div>);
    }

    return (
        <div>
            Project {selectedProject.projectName}
        </div>
    )
}
