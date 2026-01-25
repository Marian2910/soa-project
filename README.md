# Secure HR Payroll System Project

A distributed, event-driven microservices architecture designed to simulate a **high-security HR platform**.
The system enables employees to securely update sensitive information (**IBAN / Bank Details**) using **Multi-Factor Authentication (OTP)** and includes **real-time fraud detection** with WebSocket alerts.

---

## Architecture Overview

This system follows a **Service-Oriented Architecture (SOA)**, splitting functionality into independently deployable microservices communicating through REST APIs, message queues (RabbitMQ), and event streams (Kafka).

---

## Microservices

### **HrPayroll.Auth** (.NET 8)

- **Identity Provider**: Handles user registration, login with JWT authentication
- **Profile Management**: Manages user profiles, financial data, and IBAN updates with pending transaction workflow
- **Audit Hub**: Two Kafka consumers:
  - `KafkaAuditConsumer`: Consumes all audit events and stores them in MongoDB for searchable history
  - `FraudKafkaConsumer`: Consumes `FRAUD_DETECTED` events and broadcasts them via WebSocket
- **Real-time Alerts**: WebSocket server (`/ws/fraud-alerts`) pushes fraud alerts to connected clients
- **Security Features**: JWT validation, audit logging, transaction cleanup service

### **HrPayroll.OtpService** (.NET 8)

- **OTP Generation**: Creates secure 6-digit one-time passwords with configurable expiry (default: 2 minutes)
- **In-Memory Storage**: Stores OTP codes in `ConcurrentDictionary` (no database persistence)
- **Event Publishing**: Publishes `otp.generated` events to RabbitMQ for asynchronous email delivery
- **Validation**: Provides `/api/otp/verify` endpoint for OTP verification

### **HrPayroll.Notifications** (.NET 8 Worker Service)

- **Message Consumer**: Listens to RabbitMQ queue for `otp.generated` events
- **Email Delivery**: Sends HTML-formatted OTP emails via Gmail SMTP
- **Background Service**: Runs continuously as a worker service, reconnects automatically on failure

### **HrPayroll.FraudDetection** (Python FaaS)

- **Event-Driven**: Consumes `IBAN_UPDATED` events from Kafka in real-time
- **Validation Logic**: Checks if IBAN matches Romanian format (RO + 22 digits with valid checksum)
- **Alert Publishing**: Publishes `FRAUD_DETECTED` events to Kafka when invalid IBANs are detected
- **Serverless-Style**: Runs as a containerized function, reacting to Kafka stream events

---

## Frontend Applications

### **Host Dashboard** (React + Vite)
- Main employee portal served at `/`
- Features: Login, profile management, IBAN updates, payroll history, audit logs
- Real-time fraud alerts via WebSocket connection
- Micro-frontend host that redirects to OTP portal for verification

### **OTP Portal** (React + Vite)
- Standalone micro-frontend served at `/otp/`
- Dedicated verification UI for OTP entry
- Countdown timer and resend functionality
- Isolated from main app, receives transaction context via URL parameters

---

## Infrastructure & Messaging

- **MongoDB**: Document database storing users, profiles, financial data, pending transactions, and audit logs
- **RabbitMQ**: Message queue for asynchronous OTP email delivery (decouples OTP generation from email sending)
- **Kafka + Zookeeper**: Event streaming platform for audit logs and fraud detection events
- **Nginx**: Reverse proxy and API gateway routing requests to appropriate services
- **Gmail SMTP**: Email delivery for OTP codes
- **Docker Compose**: Orchestrates all 7 containers (3 .NET services, 1 Python service, 2 React frontends, 1 gateway)

---

## Key Features

- **Multi-Factor Authentication**: OTP verification via email for sensitive operations
- **Real-Time Fraud Detection**: Python-based validation of IBAN updates with instant WebSocket alerts
- **Event-Driven Architecture**: Kafka for audit event streaming, RabbitMQ for async messaging
- **Micro-Frontend Architecture**: Independent deployment of dashboard and OTP portal
- **Audit Trail**: Complete searchable history of all user actions with filtering capabilities
- **Transaction Safety**: Pending transaction pattern with automatic cleanup of stale transactions
- **Automatic Reconnection**: WebSocket auto-reconnects and checks for missed fraud alerts

---

## Project Requirements Checklist

| Requirement         | Implementation Details                                                              | Status  |
| ------------------- | ----------------------------------------------------------------------------------- | ------- |
| Microservices (> 2) | 4 services: Auth/Profile, OTP, Notification Worker, Fraud Detection                | ✅ Done |
| Secured REST API    | JWT Bearer Authentication on all critical endpoints                                 | ✅ Done |
| Scalability         | Nginx reverse proxy, stateless services, horizontal scaling ready                   | ✅ Done |
| Message Broker      | RabbitMQ for OTP email delivery                                                     | ✅ Done |
| Event Streaming     | Kafka for audit logs and fraud detection events                                     | ✅ Done |
| Use a FaaS          | Python fraud detection function consuming/producing Kafka events                    | ✅ Done |
| Web App             | React dashboard with REST API consumption and WebSocket real-time alerts            | ✅ Done |
| Micro-frontends     | Host Dashboard + Standalone OTP Portal served independently via Nginx               | ✅ Done |
| Containers          | Docker Compose orchestrating 11 containers (services + infrastructure + frontends)  | ✅ Done |
| Documentation       | Architecture diagram, README with detailed service descriptions                     | ✅ Done |

---

## Getting Started

### Prerequisites

- Docker & Docker Compose
- .NET 8 SDK (for local development)
- Node.js 18+ (for local development)

### Environment Variables

Create a `.env` file in the project root:

```env
JWT_KEY=your-secret-jwt-key-here
MONGO_CONN_STRING=mongodb://admin:password@mongo:27017
KAFKA_BROKER=kafka:29092
RABBITMQ_HOST=rabbitmq
SMTP_EMAIL=your-gmail@gmail.com
SMTP_PASSWORD=your-app-password
```

### Build & Run

```bash
# Start all services (infrastructure + backends + frontends)
docker-compose up -d --build

# View logs
docker-compose logs -f

# Access the application
# Main Dashboard: http://localhost
# OTP Portal: http://localhost/otp/
# API Gateway: http://localhost/api/
```

### Initial Setup

1. Register a new user at http://localhost/register
2. Login with your credentials
3. Update your IBAN to trigger the OTP flow
4. Try an invalid (non-Romanian) IBAN to see fraud detection in action

---

## System Diagram

[![diagram-soa-project.png](hr-admin-frontend/public/diagram.png)](hr-admin-frontend/public/diagram.png)

---

## Technology Stack

- **Backend**: .NET 8, ASP.NET Core, MongoDB Driver, RabbitMQ.Client, Confluent.Kafka
- **Frontend**: React 18, Vite, React Router, Axios, TailwindCSS
- **Infrastructure**: Docker, Docker Compose, Nginx, MongoDB, RabbitMQ, Kafka, Zookeeper
- **Fraud Detection**: Python 3, confluent-kafka-python

---

## Technology Stack

- **Backend**: .NET 8, ASP.NET Core, MongoDB Driver, RabbitMQ.Client, Confluent.Kafka
- **Frontend**: React 18, Vite, React Router, Axios, TailwindCSS
- **Infrastructure**: Docker, Docker Compose, Nginx, MongoDB, RabbitMQ, Kafka, Zookeeper
- **Fraud Detection**: Python 3, confluent-kafka-python
