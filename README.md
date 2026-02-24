# Student Management (Express + SQLite + Vanilla Frontend)

Requirements
- Node.js (16+) (includes npm). Download and install from https://nodejs.org/

**Installing on Windows**
1. Run the Node.js installer and follow prompts.
2. Open a new PowerShell or command prompt.
3. Verify installation:
   ```bash
   node -v
   npm -v
   ```

Setup & Run

```bash
cd student-management
npm install          # install dependencies
npm start            # start the server
```

> On first launch the app creates a `database.sqlite` file in the project root.
>
> If `npm` is not recognized, restart your terminal or log out/in after installing Node.

Browse to http://localhost:3000 to use the application. You can also use
`npm run dev` (requires `nodemon` installed) for automatic restarts during development.
