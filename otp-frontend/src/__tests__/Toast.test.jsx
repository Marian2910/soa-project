import { render, screen, fireEvent } from "@testing-library/react";
import Toast from "../components/Toast";
import { toast } from "react-hot-toast";

jest.mock("react-hot-toast", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

describe("Toast component", () => {
  it("renders message and countdown", () => {
    render(<Toast message="Your OTP is: 123456" duration={120} />);
    expect(screen.getByText(/Your OTP is: 123456/i)).toBeInTheDocument();
    expect(screen.getByText(/Expires in 2:00 minutes/i)).toBeInTheDocument();
  });

  it("copies OTP and shows success toast", async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(),
      },
    });

    render(<Toast message="Your OTP is: 123456" duration={120} />);
    fireEvent.click(screen.getByLabelText(/copy otp/i));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("123456");
    await Promise.resolve(); // wait for async
    expect(toast.success).toHaveBeenCalledWith("OTP copied to clipboard!");
  });

  it("shows error toast if no OTP", () => {
    render(<Toast message="No code here" duration={120} />);
    fireEvent.click(screen.getByLabelText(/copy otp/i));
    expect(toast.error).toHaveBeenCalledWith("No OTP found to copy!");
  });
});
