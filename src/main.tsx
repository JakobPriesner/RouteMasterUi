import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import {createBrowserRouter, Navigate, RouterProvider} from 'react-router';
import App from './App';
import Layout from './layouts/dashboard';
import SignInPage from './pages/signin';
import Project from "./pages/project/project";
import ProjectSettings from "./pages/project/projectSettings";
import Contacts from "./pages/contact/contacts";
import NotFound from "./pages/errors/notFound";
import SingleContact from "./pages/contact/singleContact";
import Vehicles from "./pages/vehicles/vehicles";
import Jobs from "./pages/jobs/jobs";
import RoutesManagementPage from "./pages/routes/routesManagement";
import NoConnection from "./pages/errors/noConnection";

const env_variables = {
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
};

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: '/',
        Component: Layout,
        children: [
          {
            path: '/projects',
            element: <Navigate to={"/"} replace />
          },
          {
            path: '/projects/:projectId',
            Component: Project
          },
          {
            path: '/projects/:projectId/settings',
            Component: ProjectSettings
          },
          {
            path: '/projects/:projectId/contacts',
            Component: Contacts
          },
          {
            path: '/projects/:projectId/contacts/:contactId',
            Component: SingleContact
          },
          {
            path: '/projects/:projectId/vehicles',
            Component: Vehicles
          },
          {
            path: '/projects/:projectId/jobs',
            Component: Jobs
          },
          {
            path: '/projects/:projectId/routes',
            Component: RoutesManagementPage
          }
        ],
      },
      {
        path: '/sign-in',
        Component: SignInPage,
      },
      {
        path: '/not-found',
        Component: NotFound
      },
      {
        path: '/no-connection',
        Component: NoConnection
      }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <script src={`https://maps.googleapis.com/maps/api/js?key=${env_variables.GOOGLE_MAPS_API_KEY}&libraries=places`}
            async
            defer>
    </script>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
