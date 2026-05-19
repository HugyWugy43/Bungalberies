<<<<<<< HEAD
# Bungalberies
=======
# Online Shop Project

This project is a web application with a backend, frontend, and PostgreSQL database. 
It implements a main page, product catalog, shopping cart, and admin panel.

## Prerequisites

- Java 17 (Temurin)
- PostgreSQL
- Node.js and npm (for frontend)
- IntelliJ IDEA (for backend)
- VS Code (for frontend)

## Setup Instructions

### 1. Database

1. Create a PostgreSQL database.

2. Add initial data from the `resources` folder.

3. Configure database connection in `application_properties`.

### 2. Backend

1. Open the backend folder in IntelliJ IDEA (the folder containing `pom.xml`).

2. Run `ShopApplication.java`.

3. You should see in logs:
Tomcat started on port 8080

4. Backend API is now running at:  
[http://localhost:8080/api/products](http://localhost:8080/api/products)  
Open this link in a browser to see the JSON response.

### 3. Frontend

1. Open the frontend folder in VS Code: `OnlineShop/frontend`.
2. In the terminal, run:
npm install
npm start
Frontend will open at http://localhost:3000.

4. What Works
Product catalog
Shopping cart
User authentication
Admin panel

Notes
Backend must be running before starting the frontend.
Make sure database contains initial data before running the backend.
>>>>>>> 2b0b5becde13333383021dcfd23f48e42f61ca1f
