import { useEffect, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { toast } from "react-hot-toast";


export default function Toast({ message, duration, onClose }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleClose();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleClose = (event, reason) => {
    setOpen(false);
    if (onClose) onClose();
  };

  const handleFeedbackClose = () => setFeedback(null);

  const handleCopy = async () => {
    // Extract the 6-digit OTP from the message
    const otpMatch = message.match(/\d{6}/);
    const otp = otpMatch ? otpMatch[0] : null;

    if (!otp) {
      toast.error("No OTP found to copy!");
      return;
    }

    try {
      await navigator.clipboard.writeText(otp);
      toast.success("OTP copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy OTP.");
    }
  };

  return (
    <>
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        onClose={handleClose}
      >
        <Alert
          severity="info"
          onClose={handleClose}
          sx={{ width: "100%", display: "flex", alignItems: "center" }}
          action={
            <IconButton
              aria-label="copy otp"
              color="inherit"
              size="small"
              onClick={handleCopy}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          }
        >
          {message} <br />
          Expires in {Math.floor(timeLeft / 60)}:
          {String(timeLeft % 60).padStart(2, "0")} minutes
        </Alert>
      </Snackbar>
    </>
  );
}
