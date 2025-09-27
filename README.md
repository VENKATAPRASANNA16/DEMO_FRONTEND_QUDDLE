# Quddle - Full Stack Web Application

A complete full-stack web application built with React frontend and Node.js backend.

## Project Structure

```
DEMO_FRONTEND_QUDDLE/
├── quddle-frontend/          # React frontend application
│   ├── public/              # Static assets
│   ├── src/                 # React source code
│   │   ├── App.js           # Main App component
│   │   ├── App.css          # App styles
│   │   ├── index.js         # React entry point
│   │   └── ...
│   └── package.json         # Frontend dependencies
│
├── quddle-backend/          # Node.js backend server
│   ├── models/              # Database models
│   │   ├── User.js          # User model
│   │   └── UserAction.js    # User actions model
│   ├── routes/              # API routes
│   │   ├── auth.js          # Authentication routes
│   │   └── user-actions.js  # User action routes
│   ├── uploads/             # File upload directory
│   ├── server.js            # Main server file
│   └── package.json         # Backend dependencies
│
└── README.md               # This file
```

## Prerequisites

Before running this application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/VENKATAPRASANNA16/DEMO_FRONTEND_QUDDLE.git
   cd DEMO_FRONTEND_QUDDLE
   ```

2. **Install backend dependencies:**
   ```bash
   cd quddle-backend
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd ../quddle-frontend
   npm install
   ```

## Running the Application

### Start the Backend Server

1. Navigate to the backend directory:
   ```bash
   cd quddle-backend
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   
   Or start with regular node:
   ```bash
   npm start
   ```

The backend server will start on `http://localhost:5000` (or the port specified in your environment variables).

### Start the Frontend Application

1. Open a new terminal window/tab and navigate to the frontend directory:
   ```bash
   cd quddle-frontend
   ```

2. Start the React development server:
   ```bash
   npm start
   ```

The frontend application will start on `http://localhost:3000` and automatically open in your browser.

## Available Scripts

### Backend (quddle-backend/)
- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with nodemon

### Frontend (quddle-frontend/)
- `npm start` - Start the development server
- `npm test` - Run the test suite
- `npm run build` - Build the app for production
- `npm run eject` - Eject from Create React App (irreversible)

## Environment Variables

Create `.env` files in both frontend and backend directories as needed:

### Backend (.env)
```
PORT=5000
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret_key
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

## Features

- User authentication and authorization
- User action tracking
- File upload functionality
- Responsive React frontend
- RESTful API backend
- Database integration

## API Endpoints

The backend provides the following main API routes:

- `/api/auth` - Authentication routes
- `/api/user-actions` - User action management
- `/uploads` - File upload handling

## Technologies Used

### Frontend
- React
- CSS3
- JavaScript (ES6+)

### Backend
- Node.js
- Express.js
- Database integration (check models for specific database)

## Development

1. Make sure both backend and frontend servers are running
2. Frontend will proxy API requests to the backend server
3. Any changes to the code will automatically reload the development servers

## Deployment

### Frontend Deployment
```bash
cd quddle-frontend
npm run build
```
Deploy the `build` folder to your hosting service.

### Backend Deployment
Ensure all environment variables are set and deploy the `quddle-backend` folder to your server.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **Dependencies not found**: Run `npm install` in both frontend and backend directories
2. **Port conflicts**: Change the port numbers in your environment variables
3. **CORS issues**: Ensure your backend is configured to accept requests from your frontend URL

### Getting Help

If you encounter any issues:
1. Check that all dependencies are installed
2. Verify environment variables are set correctly
3. Ensure both servers are running on different ports
4. Check the console for detailed error messages

## License

This project is licensed under the MIT License.

## Author

**VENKATAPRASANNA16**
- GitHub: [@VENKATAPRASANNA16](https://github.com/VENKATAPRASANNA16)

---

**Note**: Make sure to install dependencies with `npm install` before running the application for the first time.


<img width="1919" height="926" alt="image" src="https://github.com/user-attachments/assets/d9fe7fa0-d0c7-4ddf-868c-145566925a67" />
<img width="1919" height="922" alt="image" src="https://github.com/user-attachments/assets/e9438ef9-817f-4bd0-a8c3-0356cbaf909e" />
<img width="1919" height="915" alt="image" src="https://github.com/user-attachments/assets/03d8057c-74ec-48af-9ff0-52c15a7e5fa2" />

<img width="1918" height="917" alt="image" src="https://github.com/user-attachments/assets/f8bd788a-fdda-43d5-bbac-d8f4befd05b8" />
<img width="1918" height="924" alt="image" src="https://github.com/user-attachments/assets/df451851-0f9e-4c20-8aa3-10d4cd67de2e" />




