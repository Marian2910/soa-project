import "./App.css";
import OtpRequestForm from "./components/OtpRequestForm";
import OtpVerifyForm from "./components/OtpVerifyForm";
import otpImage from "./assets/portal.png";
import { Toaster, toast } from "react-hot-toast";

function App() {
  return (
    <div className="app-container">
      {/* Branding / logo */}
      <header className="app-header">
        <div className="logo-title-container">
          <img src={otpImage} className="logo" alt="Secure OTP Logo" />
          <h1>One-Time Password Portal</h1>
        </div>
        <p className="subtitle">
          Protect your account with a secure, time-sensitive OTP.
        </p>
      </header>

      {/* OTP request section */}
      <section className="otp-section">
        <h2>Request Your OTP</h2>
        <p>
          Enter your registered User ID to receive a one-time password. 
          The OTP will be valid for 2 minutes only.
        </p>
        <OtpRequestForm />
      </section>

      <hr className="section-divider" />

      {/* OTP verification section */}
      <section className="otp-section">
        <h2>Verify Your OTP</h2>
        <p>
          Already received an OTP? Enter your User ID and the code below to 
          verify and complete your secure access.
        </p>
        <OtpVerifyForm/>
      </section>

      {/* Toast container */}
      <Toaster position="bottom-center" reverseOrder={false} />
    </div>
  );
}

export default App;
