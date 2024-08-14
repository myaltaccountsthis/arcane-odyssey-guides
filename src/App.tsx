import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Treasure from "./pages/Treasure";
import Armor from "./pages/Armor";

export default function App() {
    const routes = createBrowserRouter([
        {
            path: "/",
            element: <Home />,
            errorElement: <div>An Unexpected Error Occurred</div>
        },
        {
            path: "/treasure",
            element: <Treasure />
        },
        {
            path: "armor",
            element: <Armor />
        }
    ]);

    return <>
        <RouterProvider router={routes} />
    </>
}