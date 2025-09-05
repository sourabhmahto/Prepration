# GoDaddy Deployment Guide

## Prerequisites
1. Purchase a domain from GoDaddy
2. Purchase GoDaddy Web Hosting (Shared, VPS, or Dedicated)
3. Ensure your hosting plan supports Node.js applications

## Step 1: Prepare Your Files

### Required Files for Upload:
- `server.js` - Main application server
- `package.json` - Dependencies configuration
- `.env` - Environment variables (create for production)
- `public/` folder - All frontend files
  - `index.html`
  - `styles.css`
  - `script.js`

### Create Production .env File:
```env
# Database Configuration (Update with GoDaddy MySQL details)
DB_HOST=your_godaddy_mysql_host
DB_USER=your_godaddy_mysql_username
DB_PASSWORD=your_godaddy_mysql_password
DB_NAME=your_godaddy_database_name

# Admin Credentials (Change these!)
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_password

# JWT Secret (Generate a strong secret)
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Server Configuration
PORT=3000
NODE_ENV=production
```

## Step 2: Set Up MySQL Database on GoDaddy

1. **Access cPanel/Hosting Dashboard**
   - Log into your GoDaddy hosting account
   - Go to cPanel or hosting dashboard

2. **Create MySQL Database**
   - Find "MySQL Databases" section
   - Create a new database (e.g., `interview_prep`)
   - Create a database user with full privileges
   - Note down: hostname, database name, username, password

3. **Database will be auto-created**
   - The application will automatically create the `questions` table
   - Sample questions will be inserted on first run

## Step 3: Upload Files to GoDaddy

### Option A: File Manager (cPanel)
1. Access File Manager in cPanel
2. Navigate to `public_html` or your domain folder
3. Upload all project files
4. Extract if uploaded as ZIP

### Option B: FTP Upload
1. Use FTP client (FileZilla, WinSCP)
2. Connect using FTP credentials from GoDaddy
3. Upload all files to the correct directory

## Step 4: Install Dependencies

### If GoDaddy supports SSH:
```bash
cd /path/to/your/website
npm install
```

### If no SSH access:
- Upload `node_modules` folder manually (not recommended)
- Or use GoDaddy's Node.js app deployment if available

## Step 5: Configure Node.js Application

1. **Set Node.js Version**
   - In cPanel, find "Node.js" or "Node.js Selector"
   - Choose Node.js version (14+ recommended)
   - Set application root to your website folder

2. **Set Startup File**
   - Set startup file to `server.js`
   - Configure environment variables from your `.env` file

3. **Install Dependencies**
   - Use the interface to run `npm install`

## Step 6: Configure Domain

1. **Point Domain to Application**
   - If using subdomain: create subdomain pointing to app folder
   - If using main domain: ensure files are in `public_html`

2. **SSL Certificate**
   - Enable SSL in GoDaddy hosting panel
   - Force HTTPS redirects

## Step 7: Test Deployment

1. **Access Your Website**
   - Go to `https://yourdomain.com`
   - Should see the welcome screen

2. **Test Login**
   - Click Login button
   - Use admin credentials from `.env` file
   - Should access the question management system

3. **Test Functionality**
   - Add a test question
   - Edit/delete questions
   - Search functionality
   - Mobile responsiveness

## Step 8: Database Backup (Important!)

1. **Set Up Regular Backups**
   - Use cPanel backup tools
   - Or set up automated MySQL backups
   - Store backups securely

## Troubleshooting

### Common Issues:

1. **"Cannot find module" errors**
   - Ensure all dependencies are installed
   - Check Node.js version compatibility

2. **Database connection errors**
   - Verify MySQL credentials in `.env`
   - Check if MySQL service is running
   - Ensure database user has proper privileges

3. **Port issues**
   - GoDaddy may require specific ports
   - Check hosting documentation for Node.js port requirements

4. **File permissions**
   - Ensure proper file permissions (755 for folders, 644 for files)
   - Make sure Node.js can read all files

### Support Resources:
- GoDaddy Node.js hosting documentation
- GoDaddy customer support
- cPanel documentation for your hosting plan

## Security Recommendations

1. **Change Default Credentials**
   - Update admin username/password in `.env`
   - Use strong, unique passwords

2. **Secure JWT Secret**
   - Generate a random, long JWT secret
   - Never commit secrets to version control

3. **Database Security**
   - Use strong database passwords
   - Limit database user privileges to necessary operations only

4. **HTTPS Only**
   - Force HTTPS redirects
   - Use secure cookies in production

## Maintenance

1. **Regular Updates**
   - Keep Node.js dependencies updated
   - Monitor for security vulnerabilities

2. **Database Maintenance**
   - Regular backups
   - Monitor database size and performance

3. **Monitoring**
   - Set up uptime monitoring
   - Monitor application logs for errors

## Admin Credentials

**Default credentials (CHANGE THESE!):**
- Username: `admin`
- Password: `InterviewPrep2024!`

**Important:** Change these in your production `.env` file before deployment!
