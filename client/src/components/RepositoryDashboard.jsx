import { useEffect, useState } from "react";
import RepositoryCard from "./RepositoryCard";

const RepositoryDashboard = () => {

    const [repositories, setRepositories] = useState([]);

    useEffect(() => {

        const fetchRepositories = async () => {

            const response = await fetch(
                "http://localhost:5000/repositories",
                {
                    credentials: "include"
                }
            );

            const data = await response.json();

            setRepositories(data);
        };

        fetchRepositories();

    }, []);

    return (
        <main className="dashboard">

            <div className="dashboard-header">
                <div>
                    <h1>Your Repositories</h1>
                    <p>Select a repository to open its workspace.</p>
                </div>

                <span className="repo-count">
                    {repositories.length} repositories
                </span>
            </div>

            <div className="repository-grid">

                {repositories.map((repository) => (
                    <RepositoryCard
                    id={repository.id}
                        key={repository.id}
                        name={repository.name}
                        description={repository.description}
                    />
                ))}

            </div>

        </main>
    );
};

export default RepositoryDashboard;