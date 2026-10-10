const Navbar = () => {
    return (
        <nav className="navbar">

            <div className="navbar-logo">
                <span className="logo-mark">◆</span>
                Git Workspace
            </div>

            <div className="navbar-right">
                <span className="username">username</span>

                <button className="logout-button">
                    Logout
                </button>
            </div>

        </nav>
    );
};

export default Navbar;

