import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { DataProvider } from "@/data/DataContext";
import { AppShell } from "@/components/layout/AppShell";
import { Today } from "@/screens/Today";
import { Live } from "@/screens/Live";
import { Trends } from "@/screens/Trends";
import { Insights } from "@/screens/Insights";
import { WatchZones } from "@/screens/WatchZones";
import { Assessments } from "@/screens/Assessments";
import { Device } from "@/screens/Device";
import { Profile } from "@/screens/Profile";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Today /> },
      { path: "live", element: <Live /> },
      { path: "trends", element: <Trends /> },
      { path: "insights", element: <Insights /> },
      { path: "zones", element: <WatchZones /> },
      { path: "assessments", element: <Assessments /> },
      { path: "device", element: <Device /> },
      { path: "profile", element: <Profile /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  return (
    <DataProvider>
      <RouterProvider router={router} />
    </DataProvider>
  );
}
