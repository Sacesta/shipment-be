# Shipment Management Backend API

A complete Node.js MongoDB backend system for shipment management with authentication, product tracking, courier management, and dashboard analytics.

## Features

- 🔐 **Authentication System** - Register, login, JWT tokens
- 📦 **Shipment Management** - Create, track, update shipments
- 📊 **Product Inventory** - Product CRUD with stock management
- 🚚 **Courier Management** - Courier services with pricing
- 📈 **Dashboard Analytics** - Statistics and analytics
- 🔒 **Protected Routes** - JWT-based authentication middleware
- 📱 **RESTful API** - Clean API structure

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, bcryptjs
- **Validation**: Validator
- **Security**: CORS, environment variables

## Project Structure

```
shipment-be/
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   ├── User.js              # User schema
│   ├── Shipment.js          # Shipment schema
│   ├── Product.js           # Product schema
│   └── Courier.js           # Courier schema
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── shipmentController.js # Shipment CRUD
│   ├── productController.js  # Product CRUD
│   ├── courierController.js  # Courier CRUD
│   └── dashboardController.js # Analytics
├── routes/
│   ├── authRoutes.js         # Auth routes
│   ├── shipmentRoutes.js     # Shipment routes
│   ├── productRoutes.js      # Product routes
│   ├── courierRoutes.js      # Courier routes
│   └── dashboardRoutes.js    # Dashboard routes
├── middleware/
│   └── authMiddleware.js     # JWT middleware
├── utils/
│   ├── jwt.js               # JWT utilities
│   └── validation.js        # Validation helpers
├── server.js                # Main server file
├── package.json             # Dependencies
└── .env                     # Environment variables
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shipment-be
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env` file and update with your configuration
   - Set `MONGODB_URI` to your MongoDB connection string
   - Set `JWT_SECRET` to a secure random string

4. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Shipments
- `GET /api/shipments` - Get all shipments (with pagination/filters)
- `POST /api/shipments` - Create new shipment
- `GET /api/shipments/:id` - Get single shipment
- `PUT /api/shipments/:id` - Update shipment
- `DELETE /api/shipments/:id` - Delete shipment
- `GET /api/shipments/track/:trackingNumber` - Track shipment (public)

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `GET /api/products/:id` - Get single product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PATCH /api/products/:id/quantity` - Update product quantity
- `GET /api/products/categories` - Get product categories

### Couriers
- `GET /api/couriers` - Get all couriers
- `POST /api/couriers` - Create new courier
- `GET /api/couriers/:id` - Get single courier
- `PUT /api/couriers/:id` - Update courier
- `DELETE /api/couriers/:id` - Delete courier
- `GET /api/couriers/active` - Get active couriers
- `POST /api/couriers/calculate-shipping` - Calculate shipping cost

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/analytics/shipments` - Get shipment analytics
- `GET /api/dashboard/analytics/products` - Get product analytics

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Request/Response Examples

### User Registration
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt_token_here"
  }
}
```

### Create Shipment
```json
POST /api/shipments
{
  "sender": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St, City, Country"
  },
  "receiver": {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+0987654321",
    "address": "456 Oak St, City, Country"
  },
  "package": {
    "description": "Electronics",
    "weight": 2.5,
    "dimensions": "30x20x10",
    "value": 500
  },
  "courier": "courier_id_here",
  "estimatedDelivery": "2024-01-15",
  "shippingCost": 25.50
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | - |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRE` | JWT expiration time | `30d` |
| `CLIENT_URL` | Frontend URL | `http://localhost:5173` |

## Development

- Use `npm run dev` for development with auto-restart
- API documentation available at the root endpoint
- All routes follow RESTful conventions
- Error handling with consistent response format

## Production

- Set `NODE_ENV=production`
- Use environment variables for sensitive data
- Enable proper CORS configuration
- Use a process manager like PM2

## License

ISC License
