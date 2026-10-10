import "./App.css";
import Navbar from "./components/Navbar";
import RepositoryDashboard from "./components/RepositoryDashboard";
import JoinWorkspace from "./pages/joinWorkspace";
import Workspace from "./pages/Workspace";
import Login from "./pages/Login"

import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

function App() {
    return (
        <BrowserRouter>

            <Navbar />

            <Routes>

                <Route
                    path="/"
                    element={<RepositoryDashboard />}
                />
                <Route 
                path="/login"
                element={<Login/>}
                />

                <Route
                    path="/workspace/:repoId"
                    element={<Workspace />}
                />
                <Route 
                     path="/join/:inviteToken"
                     element={<JoinWorkspace/>}
                     />

            </Routes>

        </BrowserRouter>
    );
}

export default App;