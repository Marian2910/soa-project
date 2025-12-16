import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import OtpRequestForm from "../components/OtpRequestForm";
import * as api from "../api/otp";

// Mock the API
jest.mock("../api/otp");

describe("OtpRequestForm", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("renders input and button", () => {
    render(<OtpRequestForm />);
    expect(screen.getByPlaceholderText(/User ID/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Request OTP/i })).toBeInTheDocument();
  });

  it("requests OTP and shows toast on success", async () => {
    api.requestOtp.mockResolvedValue({ code: "123456", expiresIn: 120 });

    render(<OtpRequestForm />);
    fireEvent.change(screen.getByPlaceholderText(/User ID/i), { target: { value: "user1" } });
    fireEvent.click(screen.getByRole("button", { name: /Request OTP/i }));

    await waitFor(() => {
      expect(screen.getByText(/Your OTP is: 123456/i)).toBeInTheDocument();
    });
  });

  it("shows error message if API fails", async () => {
    api.requestOtp.mockRejectedValue(new Error("Network error"));

    render(<OtpRequestForm />);
    fireEvent.change(screen.getByPlaceholderText(/User ID/i), { target: { value: "user1" } });
    fireEvent.click(screen.getByRole("button", { name: /Request OTP/i }));

    await waitFor(() => {
      expect(screen.getByText(/Failed to request OTP/i)).toBeInTheDocument();
    });
  });
});
