# GraphQL PostgreSQL API with Authentication

A secure Node.js GraphQL API with user authentication, JWT token management, and PostgreSQL database.

## Features

✅ User authentication (Sign up & Login)
✅ JWT access tokens (15 min expiry) and refresh tokens (7 days expiry)
✅ User CRUD operations with auth protection
✅ Password hashing with bcrypt
✅ Database migrations
✅ Master user bootstrap script
✅ GraphQL schema in .graphql file
✅ Protected queries requiring authentication

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL installed and running locally
- npm or yarn

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example env file and update with your credentials:

```bash
cp .env.example .env
```

Update `.env` with your PostgreSQL credentials and JWT secrets:

```env
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=graphql_db

JWT_SECRET=your_access_token_secret_key
JWT_REFRESH_SECRET=your_refresh_token_secret_key
```

### 3. Create PostgreSQL Database

```sql
CREATE DATABASE graphql_db;
```

### 4. Run Migrations

```bash
npm run migrate
```

This creates the `users` table with fields for username, email, and hashed password.

### 5. Create Master User (Admin)

```bash
npm run boot
```

Default master user credentials:
- **Username**: `admin`
- **Email**: `admin@admin.com`
- **Password**: `admin123`

⚠️ **Change these credentials after first login!**

### 6. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The GraphQL server will be available at: `http://localhost:4000/graphql`

---

## Authentication Flow

### 1. Sign Up

```graphql
mutation {
  signUp(
    username: "john_doe"
    email: "john@example.com"
    password: "securePassword123"
  ) {
    user {
      id
      username
      email
    }
    accessToken
    refreshToken
  }
}
```

### 2. Login

```graphql
mutation {
  login(
    email: "john@example.com"
    password: "securePassword123"
  ) {
    user {
      id
      username
      email
    }
    accessToken
    refreshToken
  }
}
```

### 3. Use Access Token

Include the access token in the Authorization header for protected queries:

```
Authorization: Bearer <accessToken>
```

### 4. Refresh Token

When access token expires (15 minutes), use refresh token to get new tokens:

```graphql
mutation {
  refreshToken(refreshToken: "<refreshToken>") {
    user {
      id
      username
      email
    }
    accessToken
    refreshToken
  }
}
```

---

## GraphQL Operations

### Protected Queries (Require Authentication)

**Get logged-in user info:**
```graphql
query {
  getLoggedInUser {
    id
    username
    email
    createdAt
    updatedAt
  }
}
```

**Get all users:**
```graphql
query {
  getAllUsers {
    id
    username
    email
    createdAt
    updatedAt
  }
}
```

**Get specific user:**
```graphql
query {
  user(id: 1) {
    id
    username
    email
    createdAt
    updatedAt
  }
}
```

### Public Mutations (No Authentication Required)

**Sign up:**
```graphql
mutation {
  signUp(
    username: "newuser"
    email: "newuser@example.com"
    password: "password123"
  ) {
    user {
      id
      username
      email
    }
    accessToken
    refreshToken
  }
}
```

**Login:**
```graphql
mutation {
  login(
    email: "newuser@example.com"
    password: "password123"
  ) {
    user {
      id
      username
      email
    }
    accessToken
    refreshToken
  }
}
```

### Protected Mutations (Require Authentication)

**Update user info (only own profile):**
```graphql
mutation {
  updateUserInfo(id: 1, username: "updated_name", email: "newemail@example.com") {
    id
    username
    email
    updatedAt
  }
}
```

**Delete user account:**
```graphql
mutation {
  deleteUser(id: 1)
}
```

**Refresh token:**
```graphql
mutation {
  refreshToken(refreshToken: "<refreshToken>") {
    user {
      id
      username
      email
    }
    accessToken
    refreshToken
  }
}
```

---

## Project Structure

```
.
├── src/
│   ├── index.js              # Main server file
│   ├── graphql/
│   │   ├── schema.graphql    # GraphQL schema definitions
│   │   └── resolvers.js      # Resolver functions
│   ├── utils/
│   │   └── auth.js           # JWT & password utilities
│   └── db/
│       ├── pool.js           # PostgreSQL connection pool
│       ├── migrate.js        # Database migrations
│       └── boot.js           # Master user bootstrap
├── .env.example              # Environment variables template
├── package.json
└── README.md
```

## Technologies Used

- **Express.js** - Web framework
- **Apollo Server** - GraphQL server
- **GraphQL** - Query language
- **pg** - PostgreSQL client
- **jsonwebtoken** - JWT token generation & verification
- **bcrypt** - Password hashing
- **Nodemon** - Auto-reload during development

## Token Details

### Access Token
- **Expiry**: 15 minutes
- **Usage**: Include in `Authorization: Bearer <token>` header for protected queries
- **Secret**: `JWT_SECRET` environment variable

### Refresh Token
- **Expiry**: 7 days
- **Usage**: Use to generate new access tokens when expired
- **Secret**: `JWT_REFRESH_SECRET` environment variable

## Security Notes

1. ✅ Passwords are hashed with bcrypt (10 salt rounds)
2. ✅ JWT tokens are signed with secure secrets
3. ✅ Protected queries verify authentication
4. ✅ Users can only update/delete their own accounts
5. ⚠️ Change JWT secrets in production
6. ⚠️ Use HTTPS in production
7. ⚠️ Keep `.env` file out of version control

## Error Handling

All errors are returned with meaningful messages:

```graphql
{
  "errors": [
    {
      "message": "Not authenticated"
    }
  ]
}
```

Common errors:
- `"Not authenticated"` - Missing or invalid access token
- `"Invalid or expired refresh token"` - Refresh token issue
- `"Email or username already exists"` - User already registered
- `"Invalid email or password"` - Wrong login credentials
- `"Not authorized to update this user"` - Trying to modify another user's account

## License

ISC
