const userService = require('../service');
const { verifyRefreshToken } = require('../../../utils/auth');
const logger = require('../../../utils/logger');

/**
 * Refresh token mutation
 */
const refreshToken = async (_, { refreshToken }) => {
  const operationName = 'Refresh Token';

  try {
    logger.info(`${operationName} - Attempt to refresh token`);

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      logger.warn(`${operationName} - Invalid or expired refresh token`);
      throw new Error('Invalid or expired refresh token');
    }

    // Get user
    const user = await userService.getUserById(decoded.id);
    
    // Validate session exists
    const session = await userService.getSessionByRefreshToken(refreshToken);
    if (!session) {
      logger.warn(`${operationName} - Session not found for user ID: ${decoded.id}`);
      throw new Error('Session not found or has expired');
    }

    logger.info(`${operationName} - Generating new tokens for user ID: ${decoded.id}`);

    // Generate new tokens
    const tokens = userService.generateAuthTokens(user);

    // Update session with new access token
    await session.update({ accessToken: tokens.accessToken });

    logger.info(`${operationName} - Successfully refreshed tokens for user ID: ${decoded.id}`);

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  } catch (error) {
    logger.error(`${operationName} - Error: ${error.message}`);
    throw error;
  }
};

/**
 * Update user info mutation
 */
const updateUserInfo = async (_, { id, username, email }, { user }) => {
  const operationName = 'Update User Info';

  try {
    logger.info(`${operationName} - Attempt for user ID: ${id}`);

    if (!user) {
      logger.warn(`${operationName} - Not authenticated`);
      throw new Error('Not authenticated');
    }

    if (user.id !== id) {
      logger.warn(`${operationName} - Unauthorized: User ${user.id} trying to update user ${id}`);
      throw new Error('Not authorized to update this user');
    }

    logger.info(`${operationName} - Updating user ID: ${id}`);
    const updatedUser = await userService.updateUser(id, { username, email });

    logger.info(`${operationName} - Successfully updated user ID: ${id}`);

    return updatedUser;
  } catch (error) {
    logger.error(`${operationName} - Error: ${error.message}`);
    throw error;
  }
};

/**
 * Delete user mutation
 */
const deleteUser = async (_, { id }, { user }) => {
  const operationName = 'Delete User';

  try {
    logger.info(`${operationName} - Attempt for user ID: ${id}`);

    if (!user) {
      logger.warn(`${operationName} - Not authenticated`);
      throw new Error('Not authenticated');
    }

    if (user.id !== id) {
      logger.warn(`${operationName} - Unauthorized: User ${user.id} trying to delete user ${id}`);
      throw new Error('Not authorized to delete this user');
    }

    logger.info(`${operationName} - Deleting user ID: ${id}`);
    await userService.deleteUser(id);

    logger.info(`${operationName} - Successfully deleted user ID: ${id}`);

    return true;
  } catch (error) {
    logger.error(`${operationName} - Error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  refreshToken,
  updateUserInfo,
  deleteUser
};
