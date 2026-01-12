const userService = require('../service');
const logger = require('../../../utils/logger');

/**
 * Sign up resolver
 */
const signUp = async (_, { username, email, password }, { user }) => {
  const operationName = 'User Sign Up';

  try {
    logger.info(`${operationName} - Attempt for email: ${email}, username: ${username}`);

    // Validate input
    if (!username || !email || !password) {
      logger.warn(`${operationName} - Missing required fields`);
      throw new Error('Username, email, and password are required');
    }

    // Validate password strength (optional)
    if (password.length < 6) {
      logger.warn(`${operationName} - Password too weak for email: ${email}`);
      throw new Error('Password must be at least 6 characters');
    }

    // Create user
    const newUser = await userService.createUser(username, email, password);
    logger.info(`${operationName} - User created successfully with ID: ${newUser.id}`);

    // Generate tokens
    const tokens = userService.generateAuthTokens(newUser);

    // Create session
    await userService.createSession(
      newUser.id,
      tokens.refreshToken,
      null, // IP address would be extracted from context if needed
      null  // User agent would be extracted from context if needed
    );

    logger.info(`${operationName} - Session created for user ID: ${newUser.id}`);

    return {
      user: newUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  } catch (error) {
    logger.error(`${operationName} - Error: ${error.message}`);
    throw error;
  }
};

module.exports = signUp;
