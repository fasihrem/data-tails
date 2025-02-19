import {useRef} from 'react';
import { useNavigate } from "react-router-dom";
import {useDispatch} from "react-redux";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Stack from '@mui/material/Stack';
import {MainNav} from "./components/nav/MainNav";
import { useSelector } from 'react-redux';
import { useState } from 'react';

export const Payment = () => {
  const isLoggedin = useSelector(state => state.auth.isLoggedin);
  const dispatch = useDispatch();
  const FirstName = useRef();
  const LastName = useRef();
  const Country = useRef();
  const City = useRef();
  const State = useRef();
  const Phone = useRef();
  const StAdd = useRef();
  const EmAdd = useRef();
  const AddDescrip = useRef();
  const [isEmpty,setIsEmpty] = useState(false);


  const PaymentHandler = (e) => {
    e.preventDefault();
    const des = AddDescrip.current.value;
    const FN = FirstName.current.value;
    const LN = LastName.current.value;
    const SetCountry = Country.current.value;
    const SetCity = City.current.value;
    const SetState = State.current.value;
    const SetPh = Phone.current.value;
    const SetStreetAdd = StAdd.current.value;
    const SetEmailAdd = EmAdd.current.value;
    
    if(FN === '' && LN === '' && SetCountry === '' && SetCity === '' && SetState === '' && SetPh === '' && SetStreetAdd === '' && SetEmailAdd === '' ) {
      console.log('Entered');
      alert('Enter first name or last name');
      setIsEmpty(true);
      
  }
    if(des === null) {
      des = "";
    }
  }
  return(
  <>
   <div className="page-wrapper">
        {/* Main box */}
          {/*Nav Outer */}
          <MainNav/>
    <section className="page-title">
      <div className="auto-container">
        <div className="title-outer">
          <h1>Checkout</h1>
          <ul className="page-breadcrumb">
            <li>
              <a href="index.html">Home</a>
            </li>
            <li>Checkout</li>
          </ul>
        </div>
      </div>
    </section>
    {/*End Page Title*/}
    {/*CheckOut Page*/}
    <section className="checkout-page">
      <div className="auto-container">
        <div className="row">
          <div className="column col-lg-8 col-md-12 col-sm-12">
            {/*Checkout Details*/}
            <div className="checkout-form">
            {isEmpty && <Stack sx={{width: '100%'}} spacing={2}>
                                    <Alert severity="error">
                                        <AlertTitle>Error</AlertTitle>
                                        Please Enter Email or Password.
                                    </Alert>
                                </Stack>}
              <h3 className="title">Billing Details</h3>
              <form
                method="post"
                action="https://creativelayers.net/themes/superio/checkout.html"
                className="default-form"
                onSubmit={PaymentHandler}
              >
                <div className="row">
                  {/*Form Group*/}
                  <div className="form-group col-lg-6 col-md-12 col-sm-12">
                    <div className="field-label">
                      First name <sup>*</sup>
                    </div>
                    <input
                      type="text"
                      name="field-name"
                      defaultValue=""
                      placeholder=""
                    />
                  </div>
                  {/*Form Group*/}
                  <div className="form-group col-lg-6 col-md-12 col-sm-12">
                    <div className="field-label">
                      Last name <sup>*</sup>
                    </div>
                    <input
                      type="text"
                      name="field-name"
                      defaultValue=""
                      placeholder=""
                    />
                  </div>
                  {/*Form Group*/}
                  <div className="form-group col-lg-12 col-md-12 col-sm-12">
                    <div className="field-label">Company name (optional)</div>
                    <input
                      type="text"
                      name="field-name"
                      defaultValue=""
                      placeholder=""
                    />
                  </div>
                  {/*Form Group*/}
                  <div className="form-group col-lg-12 col-md-12 col-sm-12">
                    <div className="field-label">
                      Country <sup>*</sup>
                    </div>
                    <select
                      name="billing_country"
                      className="select2 sortby-select"
                      autoComplete="country"
                    >
                      <option value="">Select a country…</option>
                      <option value="AX">Åland Islands</option>
                      <option value="AF">Afghanistan</option>
                      <option value="AL">Albania</option>
                      <option value="DZ">Algeria</option>
                      <option value="AS">American Samoa</option>
                      <option value="AD">Andorra</option>
                      <option value="AO">Angola</option>
                      <option value="AI">Anguilla</option>
                      <option value="AQ">Antarctica</option>
                      <option value="AG">Antigua and Barbuda</option>
                      <option value="AR">Argentina</option>
                      <option value="AM">Armenia</option>
                      <option value="AW">Aruba</option>
                      <option value="AU">Australia</option>
                      <option value="AT">Austria</option>
                      <option value="AZ">Azerbaijan</option>
                      <option value="BS">Bahamas</option>
                      <option value="BH">Bahrain</option>
                      <option value="BD">Bangladesh</option>
                      <option value="BB">Barbados</option>
                      <option value="BY">Belarus</option>
                      <option value="PW">Belau</option>
                      <option value="BE">Belgium</option>
                      <option value="BZ">Belize</option>
                      <option value="BJ">Benin</option>
                      <option value="BM">Bermuda</option>
                      <option value="BT">Bhutan</option>
                      <option value="BO">Bolivia</option>
                      <option value="BQ">
                        Bonaire, Saint Eustatius and Saba
                      </option>
                      <option value="BA">Bosnia and Herzegovina</option>
                      <option value="BW">Botswana</option>
                      <option value="BV">Bouvet Island</option>
                      <option value="BR">Brazil</option>
                      <option value="IO">British Indian Ocean Territory</option>
                      <option value="VG">British Virgin Islands</option>
                      <option value="BN">Brunei</option>
                      <option value="BG">Bulgaria</option>
                      <option value="BF">Burkina Faso</option>
                      <option value="BI">Burundi</option>
                      <option value="KH">Cambodia</option>
                      <option value="CM">Cameroon</option>
                      <option value="CA">Canada</option>
                      <option value="CV">Cape Verde</option>
                      <option value="KY">Cayman Islands</option>
                      <option value="CF">Central African Republic</option>
                      <option value="TD">Chad</option>
                      <option value="CL">Chile</option>
                      <option value="CN">China</option>
                      <option value="CX">Christmas Island</option>
                      <option value="CC">Cocos (Keeling) Islands</option>
                      <option value="CO">Colombia</option>
                      <option value="KM">Comoros</option>
                      <option value="CG">Congo (Brazzaville)</option>
                      <option value="CD">Congo (Kinshasa)</option>
                      <option value="CK">Cook Islands</option>
                      <option value="CR">Costa Rica</option>
                      <option value="HR">Croatia</option>
                      <option value="CU">Cuba</option>
                      <option value="CW">Curaçao</option>
                      <option value="CY">Cyprus</option>
                      <option value="CZ">Czech Republic</option>
                      <option value="DK">Denmark</option>
                      <option value="DJ">Djibouti</option>
                      <option value="DM">Dominica</option>
                      <option value="DO">Dominican Republic</option>
                      <option value="EC">Ecuador</option>
                      <option value="EG">Egypt</option>
                      <option value="SV">El Salvador</option>
                      <option value="GQ">Equatorial Guinea</option>
                      <option value="ER">Eritrea</option>
                      <option value="EE">Estonia</option>
                      <option value="ET">Ethiopia</option>
                      <option value="FK">Falkland Islands</option>
                      <option value="FO">Faroe Islands</option>
                      <option value="FJ">Fiji</option>
                      <option value="FI">Finland</option>
                      <option value="FR">France</option>
                      <option value="GF">French Guiana</option>
                      <option value="PF">French Polynesia</option>
                      <option value="TF">French Southern Territories</option>
                      <option value="GA">Gabon</option>
                      <option value="GM">Gambia</option>
                      <option value="GE">Georgia</option>
                      <option value="DE">Germany</option>
                      <option value="GH">Ghana</option>
                      <option value="GI">Gibraltar</option>
                      <option value="GR">Greece</option>
                      <option value="GL">Greenland</option>
                      <option value="GD">Grenada</option>
                      <option value="GP">Guadeloupe</option>
                      <option value="GU">Guam</option>
                      <option value="GT">Guatemala</option>
                      <option value="GG">Guernsey</option>
                      <option value="GN">Guinea</option>
                      <option value="GW">Guinea-Bissau</option>
                      <option value="GY">Guyana</option>
                      <option value="HT">Haiti</option>
                      <option value="HM">
                        Heard Island and McDonald Islands
                      </option>
                      <option value="HN">Honduras</option>
                      <option value="HK">Hong Kong</option>
                      <option value="HU">Hungary</option>
                      <option value="IS">Iceland</option>
                      <option value="IN">India</option>
                      <option value="ID">Indonesia</option>
                      <option value="IR">Iran</option>
                      <option value="IQ">Iraq</option>
                      <option value="IE">Ireland</option>
                      <option value="IM">Isle of Man</option>
                      <option value="IL">Israel</option>
                      <option value="IT">Italy</option>
                      <option value="CI">Ivory Coast</option>
                      <option value="JM">Jamaica</option>
                      <option value="JP">Japan</option>
                      <option value="JE">Jersey</option>
                      <option value="JO">Jordan</option>
                      <option value="KZ">Kazakhstan</option>
                      <option value="KE">Kenya</option>
                      <option value="KI">Kiribati</option>
                      <option value="KW">Kuwait</option>
                      <option value="KG">Kyrgyzstan</option>
                      <option value="LA">Laos</option>
                      <option value="LV">Latvia</option>
                      <option value="LB">Lebanon</option>
                      <option value="LS">Lesotho</option>
                      <option value="LR">Liberia</option>
                      <option value="LY">Libya</option>
                      <option value="LI">Liechtenstein</option>
                      <option value="LT">Lithuania</option>
                      <option value="LU">Luxembourg</option>
                      <option value="MO">Macao S.A.R., China</option>
                      <option value="MK">Macedonia</option>
                      <option value="MG">Madagascar</option>
                      <option value="MW">Malawi</option>
                      <option value="MY">Malaysia</option>
                      <option value="MV">Maldives</option>
                      <option value="ML">Mali</option>
                      <option value="MT">Malta</option>
                      <option value="MH">Marshall Islands</option>
                      <option value="MQ">Martinique</option>
                      <option value="MR">Mauritania</option>
                      <option value="MU">Mauritius</option>
                      <option value="YT">Mayotte</option>
                      <option value="MX">Mexico</option>
                      <option value="FM">Micronesia</option>
                      <option value="MD">Moldova</option>
                      <option value="MC">Monaco</option>
                      <option value="MN">Mongolia</option>
                      <option value="ME">Montenegro</option>
                      <option value="MS">Montserrat</option>
                      <option value="MA">Morocco</option>
                      <option value="MZ">Mozambique</option>
                      <option value="MM">Myanmar</option>
                      <option value="NA">Namibia</option>
                      <option value="NR">Nauru</option>
                      <option value="NP">Nepal</option>
                      <option value="NL">Netherlands</option>
                      <option value="NC">New Caledonia</option>
                      <option value="NZ">New Zealand</option>
                      <option value="NI">Nicaragua</option>
                      <option value="NE">Niger</option>
                      <option value="NG">Nigeria</option>
                      <option value="NU">Niue</option>
                      <option value="NF">Norfolk Island</option>
                      <option value="KP">North Korea</option>
                      <option value="MP">Northern Mariana Islands</option>
                      <option value="NO">Norway</option>
                      <option value="OM">Oman</option>
                      <option value="PK" selected="selected">
                        Pakistan
                      </option>
                      <option value="PS">Palestinian Territory</option>
                      <option value="PA">Panama</option>
                      <option value="PG">Papua New Guinea</option>
                      <option value="PY">Paraguay</option>
                      <option value="PE">Peru</option>
                      <option value="PH">Philippines</option>
                      <option value="PN">Pitcairn</option>
                      <option value="PL">Poland</option>
                      <option value="PT">Portugal</option>
                      <option value="PR">Puerto Rico</option>
                      <option value="QA">Qatar</option>
                      <option value="RE">Reunion</option>
                      <option value="RO">Romania</option>
                      <option value="RU">Russia</option>
                      <option value="RW">Rwanda</option>
                      <option value="ST">São Tomé and Príncipe</option>
                      <option value="BL">Saint Barthélemy</option>
                      <option value="SH">Saint Helena</option>
                      <option value="KN">Saint Kitts and Nevis</option>
                      <option value="LC">Saint Lucia</option>
                      <option value="SX">Saint Martin (Dutch part)</option>
                      <option value="MF">Saint Martin (French part)</option>
                      <option value="PM">Saint Pierre and Miquelon</option>
                      <option value="VC">
                        Saint Vincent and the Grenadines
                      </option>
                      <option value="WS">Samoa</option>
                      <option value="SM">San Marino</option>
                      <option value="SA">Saudi Arabia</option>
                      <option value="SN">Senegal</option>
                      <option value="RS">Serbia</option>
                      <option value="SC">Seychelles</option>
                      <option value="SL">Sierra Leone</option>
                      <option value="SG">Singapore</option>
                      <option value="SK">Slovakia</option>
                      <option value="SI">Slovenia</option>
                      <option value="SB">Solomon Islands</option>
                      <option value="SO">Somalia</option>
                      <option value="ZA">South Africa</option>
                      <option value="GS">South Georgia/Sandwich Islands</option>
                      <option value="KR">South Korea</option>
                      <option value="SS">South Sudan</option>
                      <option value="ES">Spain</option>
                      <option value="LK">Sri Lanka</option>
                      <option value="SD">Sudan</option>
                      <option value="SR">Suriname</option>
                      <option value="SJ">Svalbard and Jan Mayen</option>
                      <option value="SZ">Swaziland</option>
                      <option value="SE">Sweden</option>
                      <option value="CH">Switzerland</option>
                      <option value="SY">Syria</option>
                      <option value="TW">Taiwan</option>
                      <option value="TJ">Tajikistan</option>
                      <option value="TZ">Tanzania</option>
                      <option value="TH">Thailand</option>
                      <option value="TL">Timor-Leste</option>
                      <option value="TG">Togo</option>
                      <option value="TK">Tokelau</option>
                      <option value="TO">Tonga</option>
                      <option value="TT">Trinidad and Tobago</option>
                      <option value="TN">Tunisia</option>
                      <option value="TR">Turkey</option>
                      <option value="TM">Turkmenistan</option>
                      <option value="TC">Turks and Caicos Islands</option>
                      <option value="TV">Tuvalu</option>
                      <option value="UG">Uganda</option>
                      <option value="UA">Ukraine</option>
                      <option value="AE">United Arab Emirates</option>
                      <option value="GB">United Kingdom (UK)</option>
                      <option value="US">United States (US)</option>
                      <option value="UM">
                        United States (US) Minor Outlying Islands
                      </option>
                      <option value="VI">
                        United States (US) Virgin Islands
                      </option>
                      <option value="UY">Uruguay</option>
                      <option value="UZ">Uzbekistan</option>
                      <option value="VU">Vanuatu</option>
                      <option value="VA">Vatican</option>
                      <option value="VE">Venezuela</option>
                      <option value="VN">Vietnam</option>
                      <option value="WF">Wallis and Futuna</option>
                      <option value="EH">Western Sahara</option>
                      <option value="YE">Yemen</option>
                      <option value="ZM">Zambia</option>
                      <option value="ZW">Zimbabwe</option>
                    </select>
                  </div>
                  {/*Form Group*/}
                  <div className="form-group col-lg-12 col-md-12 col-sm-12">
                    <div className="field-label">
                      Street address <sup>*</sup>
                    </div>
                    <input
                      type="text"
                      name="field-name"
                      defaultValue=""
                      placeholder="House number and street name"
                    />
                    <input
                      type="text"
                      name="field-name"
                      defaultValue=""
                      placeholder="Apartment,suite,unit etc. (optional)"
                    />
                  </div>
                  {/*Form Group*/}
                  <div className="form-group col-lg-6 col-md-12 col-sm-12">
                    <div className="field-label">
                      Town / City <sup>*</sup>
                    </div>
                    <input
                      type="text"
                      name="field-name"
                      defaultValue=""
                      placeholder=""
                      required=""
                    />
                  </div>
                  {/*Form Group*/}
                  <div className="form-group col-lg-6 col-md-12 col-sm-12">
                    <div className="field-label">
                      State / County <sup>*</sup>
                    </div>
                    <input
                      type="text"
                      name="field-name"
                      defaultValue=""
                      placeholder=""
                      required=""
                    />
                  </div>
                  {/*Form Group*/}
                  <div className="form-group col-lg-6 col-md-12 col-sm-12">
                    <div className="field-label">
                      Postcode/ ZIP <sup>*</sup>
                    </div>
                    <input
                      type="text"
                      name="field-name"
                      defaultValue=""
                      placeholder=""
                      required=""
                    />
                  </div>
                  {/*Form Group*/}
                  <div className="form-group col-lg-6 col-md-12 col-sm-12">
                    <div className="field-label">Phone</div>
                    <input
                      type="text"
                      name="field-name"
                      defaultValue=""
                      placeholder=""
                    />
                  </div>
                  {/*Form Group*/}
                  <div className="form-group col-lg-12 col-md-12 col-sm-12">
                    <div className="field-label">Email Address</div>
                    <input
                      type="text"
                      name="field-name"
                      defaultValue=""
                      placeholder=""
                    />
                  </div>
                  {/*Form Group*/}
                  <div className="form-group col-lg-12 col-md-12 col-sm-12">
                    <h3 className="title">Additional information</h3>
                    <div className="field-label">Order notes (optional)</div>
                    <textarea
                      className=""
                      placeholder="Notes about your order, e.g. special notes for delivery."
                      defaultValue={""}
                    />
                  </div>
                </div>
              </form>
            </div>
            {/*End Checkout Details*/}
          </div>
          <div className="column col-lg-4 col-md-12 col-sm-12">
            {/*Order Box*/}
            <div className="order-box">
              <h3>Your Order</h3>
              <table>
                <thead>
                  <tr>
                    <th>
                      <strong>Product</strong>
                    </th>
                    <th>
                      <strong>Subtotal</strong>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="cart-item">
                    <td className="product-name">Hoodie x2</td>
                    <td className="product-total">59.00</td>
                  </tr>
                  <tr className="cart-item">
                    <td className="product-name">Seo Books x 1</td>
                    <td className="product-total">67.00</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="cart-subtotal">
                    <td>Subtotal</td>
                    <td>
                      <span className="amount">$178.00</span>
                    </td>
                  </tr>
                  <tr className="cart-subtotal">
                    <td>Shipping</td>
                    <td>
                      <span className="amount">$178.00</span>
                    </td>
                  </tr>
                  <tr className="order-total">
                    <td>Total</td>
                    <td>
                      <span className="amount">$9,218.00</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {/*End Order Box*/}
            {/*Payment Box*/}
            <div className="payment-box">
              {/*Payment Options*/}
              <div className="payment-options">
                <ul>
                  <li>
                    <div className="radio-option radio-box">
                      <input
                        type="radio"
                        name="payment-group"
                        id="payment-2"
                        defaultChecked=""
                      />
                      <label htmlFor="payment-2">
                        Direct Bank Transfer
                        <span className="small-text">
                          Make your payment directly into our bank account.
                          Please use your Order ID as the payment reference.
                          Your order won’t be shipped until the funds have
                          cleared in our account.
                        </span>
                      </label>
                    </div>
                  </li>
                  <li>
                    <div className="radio-option radio-box">
                      <input type="radio" name="payment-group" id="payment-1" />
                      <label htmlFor="payment-1">
                        Check Payments
                        <span className="small-text">
                          Make your payment directly into our bank account.
                          Please use your Order ID as the payment reference.
                          Your order won’t be shipped until the funds have
                          cleared in our account.
                        </span>
                      </label>
                    </div>
                  </li>
                  <li>
                    <div className="radio-option radio-box">
                      <input type="radio" name="payment-group" id="payment-3" />
                      <label htmlFor="payment-3">
                        Cash on Delivery
                        <span className="small-text">
                          Make your payment directly into our bank account.
                          Please use your Order ID as the payment reference.
                          Your order won’t be shipped until the funds have
                          cleared in our account.
                        </span>
                      </label>
                    </div>
                  </li>
                  <li>
                    <div className="radio-option radio-box">
                      <input type="radio" name="payment-group" id="payment-4" />
                      <label htmlFor="payment-4">
                        <strong>PayPal</strong>
                        <img src="images/icons/paypal.png" alt="" />
                      </label>
                    </div>
                  </li>
                </ul>
                <div className="btn-box">
                  <button className="theme-btn btn-style-one">Place Order</button>
                </div>
              </div>
            </div>
            {/*End Payment Box*/}
          </div>
        </div>
      </div>
    </section>
    {/*End CheckOut Page*/}
    {/* Main Footer */}
    <footer className="main-footer alternate5">
      <div className="auto-container">
        {/*Widgets Section*/}
        <div className="widgets-section">
          <div className="row">
            <div className="big-column col-xl-4 col-lg-3 col-md-12">
              <div className="footer-column about-widget">
                <div className="logo">
                  <a href="/">
                    <img src="images/logo.svg" alt="" />
                  </a>
                </div>
                <p className="phone-num">
                  <span>Call us </span>
                  <a href="thebeehost%40support.html">123 456 7890</a>
                </p>
                <p className="address">
                  329 Queensberry Street, North Melbourne VIC
                  <br /> 3051, Australia. <br />
                  <a href="mailto:support@superio.com" className="email">
                    support@superio.com
                  </a>
                </p>
              </div>
            </div>
            <div className="big-column col-xl-8 col-lg-9 col-md-12">
              <div className="row">
                <div className="footer-column col-lg-3 col-md-6 col-sm-12">
                  <div className="footer-widget links-widget">
                    <h4 className="widget-title">For Candidates</h4>
                    <div className="widget-content">
                      <ul className="list">
                        <li>
                          <a href="/">Browse Jobs</a>
                        </li>
                        <li>
                          <a href="/">Browse Categories</a>
                        </li>
                        <li>
                          <a href="/">Candidate Dashboard</a>
                        </li>
                        <li>
                          <a href="/">Job Alerts</a>
                        </li>
                        <li>
                          <a href="/">My Bookmarks</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="footer-column col-lg-3 col-md-6 col-sm-12">
                  <div className="footer-widget links-widget">
                    <h4 className="widget-title">For Employers</h4>
                    <div className="widget-content">
                      <ul className="list">
                        <li>
                          <a href="/">Browse Candidates</a>
                        </li>
                        <li>
                          <a href="/">Employer Dashboard</a>
                        </li>
                        <li>
                          <a href="/">Add Job</a>
                        </li>
                        <li>
                          <a href="/">Job Packages</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="footer-column col-lg-3 col-md-6 col-sm-12">
                  <div className="footer-widget links-widget">
                    <h4 className="widget-title">About Us</h4>
                    <div className="widget-content">
                      <ul className="list">
                        <li>
                          <a href="/">Job Page</a>
                        </li>
                        <li>
                          <a href="/">Job Page Alternative</a>
                        </li>
                        <li>
                          <a href="/">Resume Page</a>
                        </li>
                        <li>
                          <a href="/">Blog</a>
                        </li>
                        <li>
                          <a href="/">Contact</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="footer-column col-lg-3 col-md-6 col-sm-12">
                  <div className="footer-widget links-widget">
                    <h4 className="widget-title">Helpful Resources</h4>
                    <div className="widget-content">
                      <ul className="list">
                        <li>
                          <a href="/">Site Map</a>
                        </li>
                        <li>
                          <a href="/">Terms of Use</a>
                        </li>
                        <li>
                          <a href="/">Privacy Center</a>
                        </li>
                        <li>
                          <a href="/">Security Center</a>
                        </li>
                        <li>
                          <a href="/">Accessibility Center</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*Bottom*/}
      <div className="footer-bottom">
        <div className="auto-container">
          <div className="outer-box">
            <div className="copyright-text">
              © 2021 <a href="/">Superio</a>. All Right Reserved.
            </div>
            <div className="social-links">
              <a href="/">
                <i className="fab fa-facebook-f" />
              </a>
              <a href="/">
                <i className="fab fa-twitter" />
              </a>
              <a href="/">
                <i className="fab fa-instagram" />
              </a>
              <a href="/">
                <i className="fab fa-linkedin-in" />
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* Scroll To Top */}
      <div className="scroll-to-top scroll-to-target" data-target="html">
        <span className="fa fa-angle-up" />
      </div>
    </footer>
    {/* End Main Footer */}
  </div>
  {/* End Page Wrapper */}
</>
    );
}