const userService = require('../service');
const logger = require('../../../utils/logger');

/**
 * Login resolver
 */
const login = async (_, { email, password }, { user }) => {
  const operationName = 'User Login';
  
  try {
    logger.info(`${operationName} - Attempt for email: ${email}`);

    // Validate input
    if (!email || !password) {
      logger.warn(`${operationName} - Missing email or password`);
      throw new Error('Email and password are required');
    }

    // Authenticate user
    const authenticatedUser = await userService.authenticateUser(email, password);
    const formattedUser = userService.formatUser(authenticatedUser);
    
    // Generate tokens
    const tokens = userService.generateAuthTokens(authenticatedUser);

    // Create session
    await userService.createSession(
      authenticatedUser.id,
      tokens.refreshToken,
      null, // IP address would be extracted from context if needed
      null  // User agent would be extracted from context if needed
    );

    logger.info(`${operationName} - Success for user ID: ${authenticatedUser.id}`);

    return {
      user: formattedUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  } catch (error) {
    logger.error(`${operationName} - Error: ${error.message}`);
    throw error;
  }
};

module.exports = login;
