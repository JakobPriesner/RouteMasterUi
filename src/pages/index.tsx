import * as React from 'react';
import Typography from '@mui/material/Typography';
import {ProjectsStore} from "../stores/ProjectsStore";
import ProjectSelect from "../components/navigation/projectSelect";

export default function HomePage() {

  return (
      <Typography>
        Welcome to Toolpad Core!
          <ProjectSelect />
      </Typography>
  );
}
