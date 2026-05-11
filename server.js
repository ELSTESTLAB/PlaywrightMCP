import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const usersFile = path.join(__dirname, 'users.json');

// Load users from file
let users = {};
if (fs.existsSync(usersFile)) {
  try {
    const data = fs.readFileSync(usersFile, 'utf8');
    users = JSON.parse(data);
  } catch (e) {
    console.error('Error loading users:', e);
  }
}

function saveUsers() {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 }
}));

app.post('/clear-users', (req, res) => {
  users = {};
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  res.json({ success: true, message: 'Users cleared' });
});

app.get('/', (req, res) => {
  if (req.session.user) {
    res.send(`
      <html>
      <head><style>body { font-family: Arial; padding: 20px; }</style></head>
      <body>
        <h1>Welcome, ${req.session.user.name}!</h1>
        <p>Email: ${req.session.user.email}</p>
        <button role="button" onclick="logout()">Logout</button>
        <script>
          async function logout() {
            await fetch('/logout', {method: 'POST'});
            location.reload();
          }
        </script>
      </body>
      </html>
    `);
  } else {
    res.send(`
      <html>
      <head>
        <style>
          body { font-family: Arial; padding: 20px; }
          button { padding: 10px 20px; margin: 10px 0; cursor: pointer; }
          form { margin: 20px 0; border: 1px solid #ccc; padding: 20px; }
          form input { margin: 10px 0; width: 200px; padding: 5px; display: block; }
          form label { display: block; margin: 10px 0 5px 0; }
          .hidden { display: none !important; }
        </style>
      </head>
      <body>
        <h1>CodeSlaps Authentication</h1>
        <button role="button" onclick="showLogin()">Authenticate</button>

        <div id="loginForm" class="hidden">
          <h2>Login</h2>
          <form method="POST" action="/login">
            <label for="loginEmail">Email ID</label>
            <input id="loginEmail" name="email" type="email" required>

            <label for="loginPassword">Password</label>
            <input id="loginPassword" name="password" type="password" required>

            <button type="submit" role="button">Login</button>
            <button type="button" onclick="showRegister()" role="button">New User</button>
          </form>
        </div>

        <div id="registerForm" class="hidden">
          <h2>Sign Up</h2>
          <form method="POST" action="/signup">
            <label for="registerName">Name</label>
            <input id="registerName" name="name" type="text" required>

            <label for="registerEmail">Email ID</label>
            <input id="registerEmail" name="email" type="email" required>

            <label for="registerPassword">Password</label>
            <input id="registerPassword" name="password" type="password" required>

            <label for="registerConfirm">Confirm Password</label>
            <input id="registerConfirm" name="confirmPassword" type="password" required>

            <label for="registerDesignation">Designation</label>
            <input id="registerDesignation" name="designation" type="text" required>

            <label for="registerCountry">Country</label>
            <input id="registerCountry" name="country" type="text" required>

            <button type="submit" role="button">Create Account</button>
            <button type="button" onclick="showLogin()" role="button">Back</button>
          </form>
        </div>

        <script>
          function showLogin() {
            document.getElementById('loginForm').classList.remove('hidden');
            document.getElementById('registerForm').classList.add('hidden');
          }
          function showRegister() {
            document.getElementById('loginForm').classList.add('hidden');
            document.getElementById('registerForm').classList.remove('hidden');
          }
        </script>
      </body>
      </html>
    `);
  }
});

app.post('/signup', (req, res) => {
  const { name, email, password, confirmPassword, designation, country } = req.body;

  if (password !== confirmPassword) {
    res.send('<h2>Passwords do not match!</h2><a href="/">Back</a>');
    return;
  }

  if (users[email]) {
    res.send('<h2>User already exists!</h2><a href="/">Back</a>');
    return;
  }

  users[email] = { name, email, password, designation, country };
  saveUsers();
  req.session.user = { name, email, designation, country };
  res.send('<h2>Account created successfully!</h2><p>Welcome ' + name + '!</p><a href="/">Back</a>');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!users[email] || users[email].password !== password) {
    res.send('<h2>Invalid email or password!</h2><a href="/">Back</a>');
    return;
  }

  req.session.user = {
    name: users[email].name,
    email: users[email].email,
    designation: users[email].designation,
    country: users[email].country
  };
  res.redirect('/');
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.listen(3000, () => {
  console.log('Local auth server running at http://localhost:3000');
  console.log('Loaded users:', Object.keys(users).length);
});
