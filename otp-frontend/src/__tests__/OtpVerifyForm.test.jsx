import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import OtpVerifyForm from "../components/OtpVerifyForm";
import * as api from "../api/otp";
import { toast } from "react-hot-toast";

// Mock API and toast
jest.mock("../api/otp");
jest.mock("react-hot-toast", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

describe("OtpVerifyForm", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("renders userId input and OTP fields", () => {
    render(<OtpVerifyForm />);
    expect(screen.getByPlaceholderText(/User ID/i)).toBeInTheDocument();
    const otpInputs = screen.getAllByRole("textbox");
    expect(otpInputs.length).toBe(7); // 1 UserID + 6 OTP digits
  });

  it("calls verifyOtp and shows success toast", async () => {
    api.verifyOtp.mockResolvedValue({ success: true });

    render(<OtpVerifyForm />);
    fireEvent.change(screen.getByPlaceholderText(/User ID/i), { target: { value: "user1" } });

    const otpInputs = screen.getAllByRole("textbox").slice(1);
    otpInputs.forEach((input, idx) => fireEvent.change(input, { target: { value: `${idx + 1}` } }));

    fireEvent.click(screen.getByRole("button", { name: /Verify OTP/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("OTP verified successfully!");
    });
  });

  it("shows error toast if verification fails", async () => {
    api.verifyOtp.mockResolvedValue({ success: false, errorMessage: "Invalid OTP" });

    render(<OtpVerifyForm />);
    fireEvent.change(screen.getByPlaceholderText(/User ID/i), { target: { value: "user1" } });

    const otpInputs = screen.getAllByRole("textbox").slice(1);
    otpInputs.forEach((input, idx) => fireEvent.change(input, { target: { value: `${idx + 1}` } }));

    fireEvent.click(screen.getByRole("button", { name: /Verify OTP/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid OTP");
    });
  });
});
