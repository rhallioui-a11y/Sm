# Student Management - Vercel Deployment Guide

## ✅ Vercel-Ready Configuration

This project has been adapted for serverless deployment on **Vercel** platform.

### 📁 Project Structure

```
├── api/
│   ├── index.js              # Root handler (serves index.html)
│   ├── students.js           # GET all students, POST new
│   ├── students/
│   │   └── [id].js          # GET/PUT/DELETE specific student
│   └── db.js                # Database utility (SQLite handler)
├── public/
│   ├── index.html           # Frontend HTML
│   ├── app.js               # Frontend JavaScript (with error handling)
│   └── styles.css           # CSS styles
├── vercel.json              # Vercel configuration
├── .vercelignore            # Files to ignore on Vercel
├── server.js                # Local Express server (for development)
└── package.json             # Dependencies
```

### 🚀 Deployment to Vercel

#### Option 1: Using Vercel CLI
```bash
npm install -g vercel
vercel
```

#### Option 2: GitHub Integration
1. Ensure your code is pushed to GitHub (already done ✅)
2. Visit [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository: `rhallioui-a11y/Sm`
5. Vercel will auto-detect the configuration and deploy

### ⚙️ Key Features

✅ **Serverless Functions** - API routes run as serverless functions  
✅ **CORS Enabled** - Cross-origin requests handled  
✅ **SQLite Database** - Uses `/tmp` for ephemeral storage  
✅ **Static File Serving** - Frontend served from Vercel  
✅ **Error Handling** - Comprehensive error management  

### ⚠️ Important Notes

#### Database Persistence
- SQLite database stored in `/tmp` directory (Vercel ephemeral storage)
- **Data is NOT persisted between deployments**
- For production, migrate to a managed database:
  - PostgreSQL (Vercel Postgres)
  - MongoDB (MongoDB Cloud)
  - Supabase
  - Firebase Firestore

#### Environment Variables
If you need environment variables on Vercel:
1. Go to Vercel Dashboard → Project Settings
2. Add variables under "Environment Variables"
3. Redeploy

### 🧪 Local Testing

```bash
# Install dependencies
npm install

# Run local Express server
npm start

# Or with auto-reload
npm run dev
```

Then visit `http://localhost:3000`

### 📦 Vercel Configuration

The `vercel.json` file includes:
- **Routes** - Proper URL routing for API and static files
- **Functions** - Memory and timeout limits (512MB, 30s)
- **Builds** - Node.js serverless function builder

### 🔧 Troubleshooting

**Deployment fails?**
- Check build logs on Vercel Dashboard
- Ensure `package.json` build command exists: ✅ Added
- Verify Node.js version compatibility: ✅ v18.x specified

**API endpoints not responding?**
- Check function logs in Vercel Dashboard
- Ensure CORS headers are sent: ✅ Configured
- Verify database path: Uses `/tmp` on Vercel: ✅ Configured

**Frontend not loading?**
- Check public files are included
- Verify routing in `vercel.json`: ✅ Configured

### 📚 API Endpoints

**GET** `/api/students` - Fetch all students  
**POST** `/api/students` - Create student (body: name, email, age)  
**GET** `/api/students/[id]` - Get specific student  
**PUT** `/api/students/[id]` - Update student  
**DELETE** `/api/students/[id]` - Delete student  

### ✨ Next Steps

1. Connect to Vercel:
   ```bash
   vercel
   ```

2. After first deployment, visit your Vercel URL

3. (Optional) Migrate to persistent database for production

---

**Status**: ✅ Ready for Vercel deployment  
**Last Updated**: February 24, 2026
