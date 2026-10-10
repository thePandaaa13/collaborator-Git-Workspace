import "./Login.css"
const Login = () => {

    const handleGithubLogin = () => {
        window.location.href = "http://localhost:5000/auth/github";
    };

    return (
        <div className="login-page">

            <div className="login-card">

                <h1>CodeSync</h1>

                <p className="tagline">
                    Collaborative Git Workspace
                </p>

                <p className="description">
                    Code together, manage repositories, and collaborate
                    in real time.
                </p>

                <button
                    className="github-button"
                    onClick={handleGithubLogin}
                >
                    <span className="github-icon">◉</span>
                    Login with GitHub
                </button>

            </div>

        </div>
    );
};

export default Login;
