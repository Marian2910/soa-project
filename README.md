# Secure HR Payroll System Project

A distributed, event-driven microservices architecture designed to simulate a **high-security HR platform**.  
The system enables employees to securely update sensitive information (**IBAN / Bank Details**) using **Multi-Factor Authentication (OTP)** and includes **real-time fraud detection**.

---

## Architecture Overview

This system follows a **Service-Oriented Architecture (SOA)**, splitting functionality into independently deployable microservices.

---

# Secure HR Payroll System Project

A distributed, event-driven microservices architecture designed to simulate a **high-security HR platform**.  
The system enables employees to securely update sensitive information (**IBAN / Bank Details**) using **Multi-Factor Authentication (OTP)** and includes **real-time fraud detection**.

---

## Architecture Overview

This system follows a **Service-Oriented Architecture (SOA)**, splitting functionality into independently deployable microservices.

---

## Microservices

### **HrPayroll.Auth**

- **Identity Provider**: Handles registration & login (JWT).
- **Profile Management**: Stores user data and handles the **Two-Phase Commit** for IBAN updates.
- **Audit Hub**: Consumes Kafka events to build a searchable history.
- **Real-time Notifications**: Pushes security alerts to the frontend via **WebSockets**.

### **HrPayroll.OtpService**

- **Logic**: Generates secure one-time passwords.
- **Messaging**: Publishes `otp.generated` events to **RabbitMQ** (fire-and-forget).

### **HrPayroll.Notifications** (Worker)

- **Logic**: Consumes messages from RabbitMQ.
- **Action**: Sends real HTML emails via **Gmail SMTP**.

### **HrPayroll.FraudFunction** (FaaS – Python)

- **Logic**: Serverless-style Python function monitoring the Kafka stream.
- **Action**: Detects suspicious patterns (e.g., non-Romanian IBANs) and publishes `FRAUD_DETECTED` alerts back to the system.

---

## Infrastructure & Messaging

- **RabbitMQ**: Async OTP email delivery (decouples API from Email Server).
- **Kafka**: Immutable event streaming for Audit Logs and Fraud Detection.
- **MongoDB**: Stores Users, Profiles, and Audit Logs.
- **Nginx**: API Gateway + Load Balancer.
- **Docker Compose**: Orchestrates the entire environment.

---

## Project Requirements Checklist

| Requirement         | Implementation Details                              | Status  |
| ------------------- | --------------------------------------------------- | ------- |
| Microservices (> 2) | Auth, Profile, OTP, Notification, FraudFunction     | ✅ Done |
| Secured REST API    | JWT Bearer Authentication on all critical endpoints | ✅ Done |
| Scalability         | Nginx Gateway configured as Load Balancer           | ✅ Done |
| Message Broker      | RabbitMQ for async OTP email sending                | ✅ Done |
| Event Streaming     | Kafka for Audit Logs & Fraud Analysis               | ✅ Done |
| Use a FaaS          | Python container acting as a reactive function      | ✅ Done |
| Web App             | React dashboard consuming REST & WebSockets         | ✅ Done |
| Micro-frontends     | Host App + Standalone OTP App                       | ✅ Done |
| Containers          | Full docker-compose setup                           | ✅ Done |
| Documentation       | Architecture                                        | ✅ Done |

---

## Getting Started

### Prerequisites

- Docker & Docker Compose
- .NET 8 SDK
- Node.js (for frontends)

---

### Build & Run

```bash
# Start Infrastructure (Mongo, Kafka, RabbitMQ) & Services
docker-compose up -d --build
```

### System Diagram

[![diagram-soa-project.png](hr-admin-frontend/public/diagram.png)](hr-admin-frontend/public/diagram.png)
