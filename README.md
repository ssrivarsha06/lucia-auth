# lucia-auth
Lucia Auth Template
A secure authentication boilerplate built with Lucia, Express, and GitHub OAuth, featuring two-factor authentication (2FA) via email using Mailtrap for development and testing.

✨ Features
🔒 GitHub OAuth login

🧠 Session management with Lucia

📧 Email-based 2FA (via Mailtrap)

🗃 SQLite database for users and sessions

⚙️ Easy to customize and extend

🚀 Ideal for prototyping secure applications

📁 Project Structure
pgsql
Copy
Edit
lucia-auth-template/
├── public/
│   ├── index.html
│   └── styles.css
├── server.js
├── email.js
├── auth.js
├── db.js
├── auth-utils.js
├── sqlite-adapter.js
├── package.json
├── package-lock.json
├── .env
└── .gitignore
⚙️ Getting Started
1. Use this template
Go to the main page of this repository.

Click "Use this template".

Fill in the repo name, description, and visibility.

Click "Create repository from template".

2. Clone your repository
bash
Copy
Edit
git clone https://github.com/YOUR-USERNAME/YOUR-NEW-REPO.git
cd YOUR-NEW-REPO
3. Install dependencies
bash
Copy
Edit
npm install
✉️ Configure Mailtrap for Email 2FA
Sign up at mailtrap.io.

Create a new inbox under the Email Testing section.

Copy the SMTP credentials (host, port, username, password).

🔐 Setup Environment Variables
Create a .env file in the root of your project using the format below:

env
Copy
Edit
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
SESSION_SECRET=a_random_secret_string
PORT=3000
NODE_ENV=development
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_username
EMAIL_PASSWORD=your_mailtrap_password
⚠️ Important: Never commit your .env file to version control.

🏁 Start the Server
bash
Copy
Edit
node server.js
Visit http://localhost:3000 in your browser.

🔐 How Mailtrap is Used
This project uses Mailtrap's Email Sandbox to send and capture 2FA email verification codes during login. The email.js module handles SMTP configuration for development purposes.

Mailtrap ensures emails are not sent to real users.

Emails are only visible within your Mailtrap inbox.

For production, replace Mailtrap with your own email service provider.

📦 Git Ignore Notes
The following files and folders are excluded from version control:

.env, .env.local — Store sensitive config like secrets and API keys.

*.db, auth.db — SQLite database files generated at runtime.

node_modules/ — Dependencies installed via npm install.

*.log, npm-debug.log* — Log and debug files.

.DS_Store, Thumbs.db — OS-generated system files.

.vscode/, .idea/ — IDE-specific project settings.

🚀 Usage
Open http://localhost:3000.

Click “Login with GitHub”.

Enter the 2FA code sent to your Mailtrap inbox.

You’ll be redirected to the dashboard on successful login.

🛠 Troubleshooting
Missing environment variables?
Check that your .env file exists and is properly filled in.

Database issues?
Ensure your app has write access in the project directory.

Email not received?
Double-check Mailtrap SMTP credentials and review your Mailtrap inbox.

Enjoy building secure authentication systems with Lucia, Express, and Mailtrap! 🎉
