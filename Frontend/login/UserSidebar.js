export const UserSidebar = () => {
    return(
        <div className="user-sidebar">
            <div className="sidebar-inner">
                <ul className="navigation">
                    <li>
                        <a href="candidate-dashboard.html">
                            {" "}
                            <i className="la la-home" /> Dashboard
                        </a>
                    </li>
                    <li className="active">
                        <a href="candidate-dashboard-profile.html">
                            <i className="la la-user-tie" />
                            My Profile
                        </a>
                    </li>
                    <li>
                        <a href="candidate-dashboard-resume.html">
                            <i className="la la-file-invoice" />
                            My Resume
                        </a>
                    </li>
                    <li>
                        <a href="candidate-dashboard-applied-job.html">
                            <i className="la la-briefcase" /> Applied Jobs{" "}
                        </a>
                    </li>
                    <li>
                        <a href="candidate-dashboard-job-alerts.html">
                            <i className="la la-bell" />
                            Job Alerts
                        </a>
                    </li>
                    <li>
                        <a href="candidate-dashboard-shortlisted-resume.html">
                            <i className="la la-bookmark-o" />
                            Shortlisted Jobs
                        </a>
                    </li>
                    <li>
                        <a href="candidate-dashboard-cv-manager.html">
                            <i className="la la-file-invoice" /> CV manager
                        </a>
                    </li>
                    <li>
                        <a href="dashboard-packages.html">
                            <i className="la la-box" />
                            Packages
                        </a>
                    </li>
                    <li>
                        <a href="dashboard-messages.html">
                            <i className="la la-comment-o" />
                            Messages
                        </a>
                    </li>
                    <li>
                        <a href="dashboard-change-password.html">
                            <i className="la la-lock" />
                            Change Password
                        </a>
                    </li>
                    <li>
                        <a href="dashboard-profile.html">
                            <i className="la la-user-alt" />
                            View Profile
                        </a>
                    </li>
                    <li>
                        <a href="index.html">
                            <i className="la la-sign-out" />
                            Logout
                        </a>
                    </li>
                    <li>
                        <a href="dashboard-delete.html">
                            <i className="la la-trash" />
                            Delete Profile
                        </a>
                    </li>
                </ul>
                <div className="skills-percentage">
                    <h4>Skills Percentage</h4>
                    <p>
                        Put value for "Cover Image" field to increase your skill up to "85%"
                    </p>
                    {/* Pie Graph */}
                    <div className="pie-graph">
                        <div className="graph-outer">
                            <input
                                type="text"
                                className="dial"
                                data-fgcolor="#7367F0"
                                data-bgcolor="transparent"
                                data-width={234}
                                data-height={234}
                                data-linecap="normal"
                                defaultValue={30}
                            />
                            <div className="inner-text count-box">
                <span
                    className="count-text txt"
                    data-stop={30}
                    data-speed={2000}
                />
                                %
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}