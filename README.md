# Shipment Management Backend API

A complete Node.js MongoDB authentication and shipment management system with structured folder organization.

## Features

### Authentication System
- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes with middleware
- Input validation

### Shipment Management
- Create, read, update, delete shipments
- Track shipments by tracking number
- Courier service integration
- Order management with products
- Payment processing (COD/Prepaid)
- Real-time tracking updates

### Product Management
- Product inventory management
- SKU-based product tracking
- Stock level management
- Category organization
- Supplier information

### Dashboard & Analytics
- Shipment statistics
- Revenue tracking
- Status overview
- Performance metrics

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
│   ├── shipmentController.js # Shipment CRUD operations
│   ├── productController.js  # Product management
│   ├── courierController.js  # Courier services
│   └── dashboardController.js # Analytics & stats
├── routes/
│   ├── authRoutes.js         # Authentication routes
│   ├── shipmentRoutes.js     # Shipment routes
│   ├── productRoutes.js      # Product routes
│   ├── courierRoutes.js      # Courier routes
│   └── dashboardRoutes.js    # Dashboard routes
├── middleware/
│   └── authMiddleware.js     # JWT authentication
├── utils/
│   ├── jwt.js               # JWT utilities
│   └── validation.js        # Input validation
├── server.js                # Main server file
└── package.json             # Dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Shipments
- `POST /api/shipments` - Create shipment (Protected)
- `GET /api/shipments` - Get all shipments (Protected)
- `GET /api/shipments/:id` - Get single shipment (Protected)
- `PUT /api/shipments/:id` - Update shipment (Protected)
- `DELETE /api/shipments/:id` - Delete shipment (Protected)
- `GET /api/shipments/track/:trackingNumber` - Track shipment (Public)

### Products
- `POST /api/products` - Create product (Protected)
- `GET /api/products` - Get all products (Protected)
- `GET /api/products/:id` - Get single product (Protected)
- `PUT /api/products/:id` - Update product (Protected)
- `DELETE /api/products/:id` - Delete product (Protected)
- `PATCH /api/products/:id/quantity` - Update stock quantity (Protected)
- `GET /api/products/categories` - Get product categories (Protected)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (Protected)
- `GET /api/dashboard/revenue` - Get revenue analytics (Protected)

### Couriers
- `GET /api/couriers` - Get available couriers (Protected)
- `POST /api/couriers` - Create courier service (Protected)

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shipment-be
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/shipment-db
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=30d
   ```

4. **Start the server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## Dependencies

### Core Dependencies
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `dotenv` - Environment variables
- `cors` - Cross-origin requests
- `validator` - Input validation

### Development Dependencies
- `nodemon` - Auto-restart server during development

## Authentication Flow

1. **Registration**: User provides email and password
2. **Password Hashing**: Password is hashed using bcrypt
3. **JWT Generation**: Token generated upon successful login
4. **Protected Routes**: JWT token required in Authorization header
5. **Token Validation**: Middleware validates token for protected routes

## Shipment Creation Flow

1. **Customer Information**: Sender and receiver details
2. **Product Selection**: Order items with quantities
3. **Courier Selection**: Service provider with cost and delivery details
4. **Payment Mode**: COD or Prepaid payment
5. **Package Details**: Weight, dimensions, and special instructions
6. **Tracking**: Automatic tracking number generation

## Testing

Test files are available for different components:
- `test-auth.js` - Authentication testing
- `test-api.js` - Shipment API testing
- `test-product-api.js` - Product API testing

Run tests using:
```bash
node test-auth.js
node test-api.js
node test-product-api.js
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- CORS configuration
- Environment variable protection
- Error handling middleware

## Database Models

### User Model
- Email, password, name
- Role-based access (future enhancement)
- Timestamps for creation and updates

### Shipment Model
- Customer information (sender/receiver)
- Order items with product references
- Courier service details
- Payment information
- Tracking history and status
- Package details and dimensions

### Product Model
- SKU, name, description
- Pricing and cost information
- Stock management
- Category and supplier details

### Courier Model
- Service provider information
- Pricing and delivery areas
- Service capabilities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC License
