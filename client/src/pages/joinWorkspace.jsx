import {
    useState,
    useEffect
} from "react";

import {
    useParams,
    useNavigate
} from "react-router-dom";


function JoinWorkspace() {

    const navigate =
        useNavigate();

    const {
        inviteToken
    } = useParams();


    // ==================================================
    // STATE
    // ==================================================

    const [
        collaboration,
        setCollaboration
    ] = useState(null);


    const [
        name,
        setName
    ] = useState("");


    const [
        invalidInvite,
        setInvalidInvite
    ] = useState(false);


    const [
        loading,
        setLoading
    ] = useState(true);


    // ==================================================
    // GET COLLABORATION
    // ==================================================

    useEffect(() => {

        const getCollaboration =
            async () => {

            try {

                const response =
                    await fetch(
                        `http://localhost:5000/collaboration/join/${inviteToken}`
                    );


                if (!response.ok) {

                    setInvalidInvite(
                        true
                    );

                    return;
                }


                const data =
                    await response.json();


                console.log(
                    "COLLABORATION DATA:",
                    data
                );


                setCollaboration(
                    data
                );

            }
            catch (error) {

                console.error(
                    "Failed to get collaboration:",
                    error
                );


                setInvalidInvite(
                    true
                );

            }
            finally {

                setLoading(
                    false
                );

            }

        };


        getCollaboration();

    }, [
        inviteToken
    ]);


    // ==================================================
    // JOIN
    // ==================================================

    const handleJoin = () => {

        if (
            !name.trim()
        ) {

            return;
        }


        if (
            !collaboration
        ) {

            return;
        }


        console.log(
            "JOINING COLLABORATION:",
            collaboration.id
        );


        navigate(
            `/workspace/${collaboration.repository_id}`,
            {

                state: {

                    // Collaboration session

                    sessionID:
                        collaboration.id,


                    // Collaborator name

                    name:
                        name.trim(),


                    // Collaborator role

                    role:
                        "collaborator",


                    // File that leader selected

                    filePath:
                        collaboration.file_path

                }

            }
        );

    };


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (
            <div>

                <h2>
                    Loading workspace...
                </h2>

            </div>
        );

    }


    // ==================================================
    // INVALID INVITE
    // ==================================================

    if (invalidInvite) {

        return (

            <div>

                <h2>
                    Invalid or expired invitation
                </h2>

            </div>

        );

    }


    // ==================================================
    // JOIN PAGE
    // ==================================================

    return (

        <div>

            <h1>
                Join Workspace
            </h1>


            <p>
                Repository:{" "}
                {
                    collaboration.repository_id
                }
            </p>


            <p>
                File:{" "}
                {
                    collaboration.file_path
                }
            </p>


            <input

                placeholder="Enter your name"

                value={
                    name
                }

                onChange={
                    (e) =>
                        setName(
                            e.target.value
                        )
                }

            />


            <button
                onClick={
                    handleJoin
                }
            >

                Join

            </button>

        </div>

    );

}


export default JoinWorkspace;