const userService = require('../service');
const logger = require('../../../utils/logger');

/**
 * Get logged in user query
 */
const getLoggedInUser = async (_, __, { user }) => {
  const operationName = 'Get Logged In User';

  try {
    logger.info(`${operationName} - Attempt for user ID: ${user?.id}`);

    if (!user) {
      logger.warn(`${operationName} - Not authenticated`);
      throw new Error('Not authenticated');
    }

    logger.debug(`${operationName} - Fetching user ID: ${user.id}`);
    const userData = await userService.getUserById(user.id);

    logger.info(`${operationName} - Success for user ID: ${user.id}`);

    return userData;
  } catch (error) {
    logger.error(`${operationName} - Error: ${error.message}`);
    throw error;
  }
};

/**
 * Get all users query
 */
const getAllUsers = async (_, __, { user }) => {
  const operationName = 'Get All Users';

  try {
    logger.info(`${operationName} - Attempt by user ID: ${user?.id}`);

    if (!user) {
      logger.warn(`${operationName} - Not authenticated`);
      throw new Error('Not authenticated');
    }

    logger.debug(`${operationName} - Fetching all users`);
    const users = await userService.getAllUsers();

    logger.info(`${operationName} - Retrieved ${users.length} users`);

    return users;
  } catch (error) {
    logger.error(`${operationName} - Error: ${error.message}`);
    throw error;
  }
};

/**
 * Get user by ID query
 */
const user = async (_, { id }, { user: authUser }) => {
  const operationName = 'Get User By ID';

  try {
    logger.info(`${operationName} - Attempt for user ID: ${id}, requested by: ${authUser?.id}`);

    if (!authUser) {
      logger.warn(`${operationName} - Not authenticated`);
      throw new Error('Not authenticated');
    }

    logger.debug(`${operationName} - Fetching user ID: ${id}`);

    try {
      const userData = await userService.getUserById(id);
      logger.info(`${operationName} - Success for user ID: ${id}`);
      return userData;
    } catch (error) {
      if (error.message === 'User not found') {
        logger.warn(`${operationName} - User ID: ${id} not found`);
        return null;
      }
      throw error;
    }
  } catch (error) {
    logger.error(`${operationName} - Error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getLoggedInUser,
  getAllUsers,
  user
};
