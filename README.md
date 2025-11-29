# Secure HR Payroll System (Microservices)

A distributed, event-driven **microservices architecture** designed to
simulate a high-security HR platform.\
The system enables employees to securely update sensitive information
(IBAN / Bank Details) using **Multi-Factor Authentication (OTP)**.

------------------------------------------------------------------------

## Architecture Overview

This system follows a **Service-Oriented Architecture (SOA)**, splitting
functionality into independently deployable microservices.

### **Microservices**

#### **HrPayroll.Auth**

-   Handles user registration & login\
-   Issues securely signed JWT tokens\
-   Connects to **MongoDB**

#### **HrPayroll.Profile**

-   Core business logic\
-   Manages employee profiles and sensitive data updates\
-   Acts as a **Gatekeeper**, verifying OTPs before allowing changes

#### **HrPayroll.OtpService**

-   Generates secure one-time passwords\
-   Publishes `OtpGenerated` events to RabbitMQ

#### **HrPayroll.Notifications**

-   Background worker\
-   Consumes messages from RabbitMQ\
-   Simulates sending notification emails

------------------------------------------------------------------------

## Infrastructure & Messaging

-   **RabbitMQ** -- async OTP email delivery (decoupled communication)\
-   **Kafka** -- immutable event streaming for audit logs
    (**non-repudiation**)\
-   **MongoDB** -- stores users & profile data\
-   **Nginx** -- API gateway + load balancer for micro-frontends\
-   **Docker Compose** -- orchestrates entire environment

------------------------------------------------------------------------

## Project Requirements Checklist

------------------------------------------------------------------------
  Requirement                   Details                Status
  ----------------------------- ---------------------- -------------------
  **Build software system based Auth, Profile, OTP,    ✅ Done
  on different types of         Notification           
  services (\>2                                        
  microservices)**                                     

  **Web server exposing secured JWT authentication     ✅ Done
  REST services**                                      

  **Scalability using load      Nginx reverse proxy &  ✅ Done
  balancers (Nginx)**           load balancer          

  **Use message broker          OTP delivery events    ✅ Done
  (RabbitMQ)**                                         

  **Use event streaming         Audit logs             ✅ Done
  (Kafka)**                     (`otp.validated`)      

  **Use a FaaS**                Under integration      🚧 In Progress
                                (audit lambda)         

  **Web app consuming REST &    React MFE + RabbitMQ   🚧 In Progress
  receiving server-side         consumer planned       
  notifications**                                      

  **Micro-frontend              Host App + Profile MFE 🚧 In Progress
  architecture**                                       

  **Containers deployment       Full docker-compose    ✅ Done
  (Docker)**    
                            
  **Documentation (UML, C4)      C4 diagrams included  🚧 In Progress**                                      
  ------------------------------------------------------------------------

------------------------------------------------------------------------

## Getting Started

### **Prerequisites**

-   Docker & Docker Compose\
-   .NET 8 SDK

------------------------------------------------------------------------

### **1. Build the Solution**

``` bash
dotnet build
```

### **2. Start Infrastructure & Services**

``` bash
docker-compose up -d --build
```

------------------------------------------------------------------------

## Access Points

  Interface          URL                      Credentials
  ------------------ ------------------------ ------------------
  Mongo Express      http://localhost:8081    admin / password
  RabbitMQ UI        http://localhost:15672   guest / guest
  Frontend Gateway   http://localhost/        ---

------------------------------------------------------------------------

## Testing the API (Postman / Swagger)

### **Step 1: Register User**

    POST http://localhost:5001/api/auth/register

Body:

``` json
{
  "email": "dev@bt.ro",
  "password": "pass",
  "fullName": "Dev",
  "iban": "RO59..."
}
```

### **Step 2: Login & Get Token**

    POST http://localhost:5001/api/auth/login

Copy the JWT token.

------------------------------------------------------------------------

### **Step 3: Request IBAN Update**

    POST http://localhost:5002/api/otp/request

Headers:

    Authorization: Bearer <TOKEN>

Check the **HrPayroll.Notifications** terminal to retrieve the OTP code.

------------------------------------------------------------------------

### **Step 4: Confirm Update**

    POST http://localhost:5003/api/profile/update-iban

Body:

``` json
{
  "newIban": "RO99...",
  "otpCode": "123456",
  "transactionId": "..."
}
```

------------------------------------------------------------------------

## 📐 System Diagram (C4 -- Container Level)

``` mermaid
graph TD
    User((User))

    subgraph "Docker Host"
        Gateway[Nginx Gateway]

        subgraph "Microservices"
            Auth[HrPayroll.Auth]
            Profile[HrPayroll.Profile]
            Otp[HrPayroll.OtpService]
            Notify[HrPayroll.Notifications]
        end

        subgraph "Data & Messaging"
            Mongo[(MongoDB)]
            Rabbit[RabbitMQ]
            Kafka[Kafka]
        end
    end

    User -->|HTTPS| Gateway
    Gateway -->|/api/auth| Auth
    Gateway -->|/api/profile| Profile
    Gateway -->|/api/otp| Otp

    Auth -->|Read/Write| Mongo
    Profile -->|Read/Write| Mongo

    Profile --HTTP--> Otp
    Otp --Publish--> Rabbit
    Rabbit --Consume--> Notify

    Profile --Audit Log--> Kafka
```
