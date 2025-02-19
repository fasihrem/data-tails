import {Link} from "react-router-dom";
import logo from '../../../../images/logo.svg';
import company from '../../../../images/resource/company-6.png'

export const MainNav = () => {
    return(
        <header className="main-header header-shaddow">
            <div className="container-fluid">
                {/* Main box */}
                <div className="main-box">
                    {/*Nav Outer */}
                    <div className="nav-outer">
                        <div className="logo-box">
                            <div className="logo">
                                <a href="index.html">
                                    <img src={logo} alt="" title="" />
                                </a>
                            </div>
                        </div>
                        <nav className="nav main-menu">
                            <ul className="navigation" id="navbar">
                                <li>
                                    <Link to='/login'>Home</Link>
                                  </li>
                                <li >
                                    <span>Find Jobs</span>

                                </li>
                                <li className="dropdown">
                                    <span>Employers</span>
                                    <ul>
                                        <li className="dropdown">
                                            <span>Employers List</span>

                                        </li>
                                        <li className="dropdown">
                                            <span>Employers Single</span>

                                        </li>
                                        <li>
                                            <a href="dashboard.html">Employers Dashboard</a>
                                        </li>
                                    </ul>
                                </li>
                                <li className="dropdown">
                                    <span>Candidates</span>
                                    <ul>
                                        <li className="dropdown">
                                            <span>Candidates List</span>

                                        </li>
                                        <li className="dropdown">
                                            <span>Candidates Single</span>

                                        </li>
                                        <li>
                                            <a href="candidate-dashboard.html">
                                                Candidates Dashboard
                                            </a>
                                        </li>
                                    </ul>
                                </li>

                                <li className="dropdown">
                                    <span>Pages</span>
                                    <ul>
                                        <li className="dropdown">
                                            <span>Shop</span>
                                            <ul>
                                                <li>
                                                    <a href="shop.html">Shop List</a>
                                                </li>
                                                <li>
                                                    <a href="shop-single.html">Shop Single</a>
                                                </li>
                                                <li>
                                                    <a href="shopping-cart.html">Shopping Cart</a>
                                                </li>
                                                <li>
                                                    <a href="shop-checkout.html">Checkout</a>
                                                </li>
                                                <li>
                                                    <a href="order-completed.html">Order Completed</a>
                                                </li>
                                                <li>
                                                    <a href="login.html">Login</a>
                                                </li>
                                                <li>
                                                    <a href="register.html">Register</a>
                                                </li>
                                            </ul>
                                        </li>
                                        <li>
                                            <a href="about.html">About</a>
                                        </li>
                                        <li>
                                            <a href="terms.html">Terms</a>
                                        </li>
                                        <li>
                                            <a href="contact.html">Contact</a>
                                        </li>
                                    </ul>
                                </li>
                                {/* Only for Mobile View */}
                                <li className="mm-add-listing">
                                    <a
                                        href="add-listing.html"
                                        className="theme-btn btn-style-one"
                                    >
                                        Job Post
                                    </a>
                                    <span>
                    <span className="contact-info">
                      <span className="phone-num">
                        <span>Call us</span>
                        <a href="tel:1234567890">123 456 7890</a>
                      </span>
                      <span className="address">
                        329 Queensberry Street, North Melbourne VIC <br />
                        3051, Australia.
                      </span>
                      <a href="mailto:support@superio.com" className="email">
                        support@superio.com
                      </a>
                    </span>
                    <span className="social-links">
                      <a href="#">
                        <span className="fab fa-facebook-f" />
                      </a>
                      <a href="#">
                        <span className="fab fa-twitter" />
                      </a>
                      <a href="#">
                        <span className="fab fa-instagram" />
                      </a>
                      <a href="#">
                        <span className="fab fa-linkedin-in" />
                      </a>
                    </span>
                  </span>
                                </li>
                            </ul>
                        </nav>
                        {/* Main Menu End*/}
                    </div>
                    <div className="outer-box">
                        <button className="menu-btn">
                            <span className="count">1</span>
                            <span className="icon la la-heart-o" />
                        </button>
                        <button className="menu-btn">
                            <span className="icon la la-bell" />
                        </button>
                        {/* Dashboard Option */}
                        <div className="dropdown dashboard-option">
                            <a
                                className="dropdown-toggle"
                                role="button"
                                data-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <img
                                    src={company}
                                    alt="avatar"
                                    className="thumb"
                                />
                                <span className="name">My Account</span>
                            </a>
                            <ul className="dropdown-menu">
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
                        </div>
                    </div>
                </div>
            </div>
            {/* Mobile Header */}
            <div className="mobile-header">
                <div className="logo">
                    <a href="index.html">
                        <img src={logo} alt="" title="" />
                    </a>
                </div>
                {/*Nav Box*/}
                <div className="nav-outer clearfix">
                    <div className="outer-box">
                        {/* Login/Register */}
                        <div className="login-box">
                            <a href="login-popup.html" className="call-modal">
                                <span className="icon-user" />
                            </a>
                        </div>
                        <button id="toggle-user-sidebar">
                            <img
                                src={company}
                                alt="avatar"
                                className="thumb"
                            />
                        </button>
                        <a href="#nav-mobile" className="mobile-nav-toggler navbar-trigger">
                            <span className="flaticon-menu-1" />
                        </a>
                    </div>
                </div>
            </div>
            {/* Mobile Nav */}
            <div id="nav-mobile" />
        </header>
    );
}