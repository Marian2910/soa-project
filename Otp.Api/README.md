# BT Code Crafter Challenge - Backend API

## Overview

This project implements the backend API for the BT Code Crafter OTP challenge. It provides a secure, time-bound, and efficient system for generating and verifying one-time passwords (OTPs) for a banking application.

The backend is built using **.NET 7**, follows REST principles, and is designed to interact with a frontend built in React.

---

## Features

* **Generate OTPs**: Secure, random 6-digit codes using a cryptographic RNG.
* **Validate OTPs**: Checks user-submitted OTPs against stored codes and ensures they haven’t expired.
* **Time-bound OTPs**: OTPs expire after a configurable period (default 120 seconds).
* **Error handling**: Returns descriptive error messages for invalid or expired OTPs.
* **CORS support**: Allows requests from the frontend development server.
* **HTTPS ready**: Ensures secure communication.

---

## Project Structure

```
BtOtp.Api/
├── Controllers/           # API controllers
│   └── OtpController.cs
├── Models/                # Data transfer objects (DTOs)
│   ├── OtpEntry.cs
│   ├── OtpRequestDto.cs
│   ├── OtpResponseDto.cs
│   └── OtpVerifyDto.cs
├── Services/              # OTP business logic and generator
│   ├── OtpService.cs
│   └── SecureOtpGenerator.cs
├── Middleware/            # Custom middleware (error handling)
│   └── ErrorHandlingMiddleware.cs
├── Program.cs             # Entry point, service configuration
├── appsettings.json       # Configuration (e.g., OTP expiry)
└── BtOtp.Api.csproj       # Project file
```

---

## Installation

1. **Clone the repository:**

   ```bash
   git clone <repository_url>
   ```
2. **Navigate to the API project:**

   ```bash
   cd BtOtp.Api
   ```
3. **Restore dependencies:**

   ```bash
   dotnet restore
   ```
4. **Run the API:**

   ```bash
   dotnet run
   ```
5. **Access the API:**

    * `https://localhost:7241` (HTTPS)
    * `http://localhost:5191` (HTTP)
6. **Swagger documentation** is available in development mode at:

   ```
   https://localhost:7241/swagger
   ```

---

## Endpoints

### 1. Request OTP

**POST** `/api/otp/request`

**Body:**

```json
{
  "userId": "user1"
}
```

**Response:**

```json
{
  "code": "123456",
  "expiresIn": 120
}
```

**Error Responses:**

* `400 Bad Request`: Missing or empty `userId`.

---

### 2. Verify OTP

**POST** `/api/otp/verify`

**Body:**

```json
{
  "userId": "user1",
  "code": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "OTP verified successfully."
}
```

**Error Responses:**

* `400 Bad Request`: Missing `userId` or `code`.
* `404 Not Found`: No OTP found for the user.
* `400 Bad Request`: OTP expired or invalid.

---

## Services

### `OtpService`

* Handles OTP issuance and validation.
* Stores OTPs in-memory (dictionary keyed by `userId`).
* Configurable expiry time.

### `SecureOtpGenerator`

* Generates cryptographically secure random numeric codes.
* Default OTP length: 6 digits.

---

## Security

* All API requests should be made over **HTTPS**.
* OTPs are generated using `System.Security.Cryptography.RandomNumberGenerator` for true randomness.
* CORS configured to allow requests from the frontend development server (`https://localhost:5173`).

---

## Notes

* OTPs are stored in-memory. Restarting the API will invalidate all pending OTPs.
* For production, consider using a distributed cache (Redis) for OTP storage.
* Swagger UI is only available in development mode for testing endpoints.
* Error handling is centralized using `ErrorHandlingMiddleware`.

---