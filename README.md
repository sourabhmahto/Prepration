# Interview Preparation Website

A comprehensive web application for managing interview questions and answers, designed for technical interview preparation.

## Features

- **Fixed Admin Authentication** - No registration needed, secure admin access
- **Question Management** - Full CRUD operations with detailed question format
- **Categories**: JavaScript, .NET, SQL Server, Other
- **Advanced Search** - Search across all question fields
- **Responsive Design** - Works on mobile and desktop
- **Permanent Storage** - PostgreSQL/MySQL support for production

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: SQLite (local), PostgreSQL (production), MySQL (fallback)
- **Authentication**: JWT, bcrypt
- **Frontend**: Vanilla JavaScript, HTML5, CSS3

## Quick Start

### Local Development
```bash
npm install
npm start
```
Access at: `http://localhost:3000`

**Login Credentials:**
- Username: `admin`
- Password: `InterviewPrep2024!`

### Production Deployment
See `README_DEPLOYMENT.md` for detailed deployment instructions.

## Free Hosting Options

1. **Render.com** (Recommended)
   - Free PostgreSQL database
   - Automatic deployments
   - SSL included

2. **Railway.app**
   - $5 monthly credit
   - Easy GitHub integration

3. **Heroku**
   - Free tier available
   - PostgreSQL add-on

## Question Format

Each question includes:
- **Question & Answer** (required)
- **Why** - Purpose/importance
- **Where** - Usage context
- **Example** - Code snippets
- **FAQ** - Related questions
- **Difficulty** - Easy/Medium/Hard

## Environment Variables

```env
USE_SQLITE=true              # Local development
DATABASE_URL=                # PostgreSQL connection string
ADMIN_USERNAME=admin         # Admin login
ADMIN_PASSWORD=InterviewPrep2024!
JWT_SECRET=your-secret-key
```

## Mobile Support

Fully responsive design optimized for:
- Desktop browsers
- Tablets
- Mobile phones

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Environment variable protection
- CORS enabled

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## File Structure

```
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── README.md             # This file
├── interview_prep.db     # SQLite database (auto-created)
└── public/
    ├── index.html        # Main HTML file
    ├── styles.css        # CSS styling
    └── script.js         # Frontend JavaScript
```

## Contributing

Feel free to add more questions, improve the UI, or enhance functionality. The codebase is designed to be easily extensible.

## Default Sample Questions

The application comes pre-loaded with sample questions in three categories:

### JavaScript
- Variable declarations (let, const, var)
- Closures
- Event bubbling
- Promises

### .NET
- .NET Framework vs .NET Core
- Garbage Collection
- Dependency Injection
- Constructor types

### SQL Server
- JOIN operations
- Indexing
- Stored procedures
- Triggers

## Usage

1. **Registration/Login**: Create an account or login with existing credentials
2. **Browse Questions**: Navigate through different categories using tabs
3. **Search**: Use the search bar to find specific questions or answers
4. **Add Questions**: Click the "Add Question" button to create new questions
5. **Edit/Delete**: Use the action buttons on each question card to modify or remove questions

## API Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/categories` - Get all question categories
- `GET /api/questions/:category` - Get questions by category
- `POST /api/questions` - Add new question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `GET /api/search?q=query` - Search questions

## Deployment

This application is ready for deployment on platforms like:
- **GoDaddy Hosting**
- **Netlify**
- **Vercel**
- **Heroku**
- **DigitalOcean**

### For Node.js hosting (GoDaddy, Heroku):
1. Upload all files to your hosting provider
2. Install dependencies on the server
3. Start the application with `npm start`
4. Ensure your hosting provider supports Node.js applications

### Environment Variables
For production, consider setting:
- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - JWT secret key (change from default)

## Security Notes

- Change the JWT_SECRET in production
- Use HTTPS in production
- Consider using environment variables for sensitive data
- The SQLite database file will be created automatically

## File Structure

```
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── README.md             # This file
├── interview_prep.db     # SQLite database (auto-created)
└── public/
    ├── index.html        # Main HTML file
    ├── styles.css        # CSS styling
    └── script.js         # Frontend JavaScript
```

## Contributing

Feel free to add more questions, improve the UI, or enhance functionality. The codebase is designed to be easily extensible.

## License

MIT License - Feel free to use this project for personal or commercial purposes.
