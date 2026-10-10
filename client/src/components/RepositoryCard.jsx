import React from 'react'
import { useNavigate } from 'react-router-dom';

const RepositoryCard = ({ id, name, description }) => {
    const navigate = useNavigate();

    const openWorkspace = () => {
    navigate(`/workspace/${id}`, {
        state: {
            repoId: id,
            role: "leader"
        }
    });
};
    return (
        <div className="repository-card">

            <div className="repository-icon">
                ◆
            </div>

            <div className="repository-info">

                <h3>{name}</h3>

                <p>
                    {description || "No description available."}
                </p>

            </div>

            <button className="workspace-button"
            onClick={openWorkspace}>
                Open Workspace
                <span>→</span>
            </button>

        </div>
    );
};

export default RepositoryCard;