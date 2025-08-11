# Travel Tales - Interactive Travel Journal Application


<img width="1916" height="831" alt="Screenshot 2025-08-11 123449" src="https://github.com/user-attachments/assets/f8fbf510-8823-4c26-ac7d-4e0fefcd3ccb" />

<img width="1911" height="820" alt="Screenshot 2025-08-11 123558" src="https://github.com/user-attachments/assets/cc7b7e85-73b1-4ed7-8455-366c1d9f062c" />

<img width="1918" height="815" alt="Screenshot 2025-08-11 123615" src="https://github.com/user-attachments/assets/bde51844-7a35-4047-88fe-e762a1c476f0" />

<img width="1919" height="824" alt="Screenshot 2025-08-11 123628" src="https://github.com/user-attachments/assets/aab8685d-130c-4eef-b22d-f1b7ee5ddf98" />

<img width="1915" height="821" alt="Screenshot 2025-08-11 123644" src="https://github.com/user-attachments/assets/09f5604a-b393-4ede-9425-bc45decdc4ae" />


Travel Tales is a modern web-based travel journal application that allows users to document their travel experiences interactively. Built with a robust Spring Boot backend and dynamic React frontend, it provides a comprehensive platform for creating journals, managing travel entries, and sharing memories with integrated mapping and social features.

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Future Improvements](#-future-improvements)

## ✨ Features

### User Management
- **Authentication & Authorization**: Secure user registration and login with BCrypt password encryption
- **User Profiles**: Comprehensive profile management with customizable user details
- **Session Management**: Secure session handling with Spring Security

### Journal & Entry Management
- **Journal Creation**: Create personalized travel journals with custom titles, descriptions, and cover images
- **Rich Entry Creation**: Add detailed travel entries with:
  - Title and description
  - Location data (manual pin or automatic geolocation)
  - Media attachments (photos and videos)
  - Timestamp tracking
- **Content Management**: Edit and delete entries with full CRUD operations

### Interactive Mapping
- **World Map Integration**: Interactive map visualization showing all travel locations
- **Location Services**: Automatic geolocation detection and manual location pinning
- **Travel Visualization**: Visual representation of travel history and routes

### Social Features
- **Virtual Postcards**: Send personalized postcards to other users
- **Community Interaction**: Share travel experiences with the community

## 🏗️ Architecture

Travel Tales follows a **multi-layer monolithic architecture** with clear separation of concerns:

```
┌─────────────────────┐
│  Presentation Layer │  React Frontend
├─────────────────────┤
│    Service Layer    │  Business Logic
├─────────────────────┤
│  Repository Layer   │  Data Access
├─────────────────────┤
│   Database Layer    │  MySQL Database
└─────────────────────┘
```

### Key Design Patterns
- **Repository Pattern**: Abstraction layer for data access operations
- **MVC Pattern**: Model-View-Controller architecture for organized code structure
- **REST API**: RESTful web services for client-server communication

## 🛠️ Technology Stack

### Backend
- **Java**: Core programming language
- **Spring Boot**: Application framework
- **Spring Security**: Authentication and authorization
- **Spring Data JPA**: Data persistence and ORM
- **MySQL**: Relational database management

### Frontend
- **React**: UI framework for dynamic user interfaces
- **JavaScript/ES6**: Frontend programming language

### Testing
- **JUnit 5**: Unit testing framework
- **Mockito**: Mocking framework for testing

### Additional Technologies
- **BCrypt**: Password hashing and encryption
- **Geolocation API**: Location services integration
- **File Upload**: Media handling and storage

## 📋 Prerequisites

Before running Travel Tales, ensure you have the following installed:

- **Java 11 or higher**
- **Node.js 14+ and npm**
- **MySQL 8.0+**
- **Maven 3.6+**

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/travel-tales.git
cd travel-tales
```

### 2. Backend Setup

#### Configure Database
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE travel_tales;
CREATE USER 'travel_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON travel_tales.* TO 'travel_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Update Application Properties
```properties
# src/main/resources/application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/travel_tales
spring.datasource.username=travel_user
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

#### Run Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/swagger-ui.html

## 📖 Usage

### Getting Started
1. **Register**: Create a new account with email and password
2. **Login**: Access your personal dashboard
3. **Create Journal**: Start your first travel journal with a custom title and cover
4. **Add Entries**: Document your travels with photos, locations, and descriptions
5. **Explore Map**: View your travel history on the interactive world map

### Core Workflows

#### Creating a Travel Journal
```
Dashboard → Create Journal → Add Title/Description/Cover → Save
```

#### Adding Travel Entry
```
Select Journal → Add Entry → Enter Details → Pin Location → Upload Media → Save
```

#### Managing Content
```
View Journal → Select Entry → Edit/Delete → Confirm Changes
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Journal Management
- `GET /api/journals` - Get user journals
- `POST /api/journals` - Create new journal
- `PUT /api/journals/{id}` - Update journal
- `DELETE /api/journals/{id}` - Delete journal

### Entry Management
- `GET /api/journals/{journalId}/entries` - Get journal entries
- `POST /api/journals/{journalId}/entries` - Create new entry
- `PUT /api/entries/{id}` - Update entry
- `DELETE /api/entries/{id}` - Delete entry

### Media Upload
- `POST /api/media/upload` - Upload media files

## 🧪 Testing

### Unit Testing
```bash
# Run backend tests
cd backend
mvn test

# Generate test coverage report
mvn jacoco:report
```

### Test Coverage
- **UserService**: Registration, authentication, profile management
- **JournalService**: CRUD operations for journals
- **EntryService**: Entry management with location and media
- **MediaService**: File upload and storage handling

### Manual Testing
The application includes comprehensive manual testing scenarios:
- User registration and login workflows
- Journal creation and management
- Entry creation with media uploads
- Map integration and location services

## 🚀 Future Improvements

### Performance Optimizations
- **Cloud Storage**: Migration to AWS S3/Google Cloud with CDN
- **Caching**: Redis implementation for improved response times
- **Database Optimization**: Query optimization and indexing

### User Experience Enhancements
- **Advanced Search**: Full-text search with filters
- **Social Features**: Public journal sharing and user following
- **Collaborative Journals**: Multi-user journal creation

### Technical Enhancements
- **Microservices**: Breaking monolith into scalable services
- **Real-time Updates**: WebSocket integration for live notifications
- **Mobile App**: React Native mobile application

### Feature Expansions
- **Advanced Maps**: Route planning and POI integration
- **Export Options**: PDF generation and photo album creation
- **Analytics**: Travel statistics and insights dashboard
