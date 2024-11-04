import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Treasure from "./pages/Treasure";
import ArmorCalculator from "./pages/ArmorCalculator";

function App() {
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
            path: "/armor",
            element: <ArmorCalculator />
        }
    ]/*, {basename: "/arcane-odyssey-guides"} */);

    return <>
        <RouterProvider router={routes} />
    </>
}

export default App;
