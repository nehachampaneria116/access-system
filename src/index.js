require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const fs = require('fs');
const path = require('path');
const sequelize = require('./db/sequelize');
const resolvers = require('./graphql/resolvers');
const { verifyAccessToken } = require('./utils/auth');
const logger = require('./utils/logger');

// Load models
const User = require('./schema/users.model');
const Session = require('./schema/session.model');

// Setup associations
User.associate({ Session });
Session.belongsTo(User, { foreignKey: 'user_id' });

// Function to merge schema files
function mergeSchemas() {
  const baseSchema = fs.readFileSync(
    path.join(__dirname, './graphql/schema.graphql'),
    'utf-8'
  );

  const userSchema = fs.readFileSync(
    path.join(__dirname, './modules/users/schema.graphql'),
    'utf-8'
  );

  return `${baseSchema}\n\n${userSchema}`;
}

const typeDefs = mergeSchemas();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('✓ Database connected successfully');

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req }) => {
        // Get token from headers
        const token = req.headers.authorization?.split('Bearer ')[1];

        let user = null;
        if (token) {
          user = verifyAccessToken(token);
        }

        return { user };
      },
      formatError: (error) => {
        logger.error(`GraphQL Error: ${error.message}`);
        return error;
      }
    });

    await server.start();

    server.applyMiddleware({ app });

    app.get('/', (req, res) => {
      logger.debug('Health check endpoint accessed');
      res.json({
        message: 'GraphQL API is running',
        graphqlEndpoint: `http://localhost:${PORT}${server.graphqlPath}`,
        docs: 'Send Authorization header: Bearer <accessToken>'
      });
    });

    app.listen(PORT, () => {
      logger.info(`✓ Server running at http://localhost:${PORT}`);
      logger.info(`✓ GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

startServer();
