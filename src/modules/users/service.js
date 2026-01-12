const User = require('../../schema/users.model');
const Session = require('../../schema/session.model');
const {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken
} = require('../../utils/auth');
const { Op } = require('sequelize');

class UserService {
  /**
   * Create a new user
   */
  async createUser(username, email, password) {
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      throw new Error('Email or username already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    return this.formatUser(user);
  }

  /**
   * Get user by ID
   */
  async getUserById(id) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('User not found');
    }
    return this.formatUser(user);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    const user = await User.findOne({ where: { email } });
    return user;
  }

  /**
   * Get all users
   */
  async getAllUsers() {
    const users = await User.findAll({
      order: [['id', 'ASC']]
    });
    return users.map(user => this.formatUser(user));
  }

  /**
   * Update user
   */
  async updateUser(id, updates) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Only allow updating username and email
    const allowedUpdates = {};
    if (updates.username !== undefined) {
      allowedUpdates.username = updates.username;
    }
    if (updates.email !== undefined) {
      allowedUpdates.email = updates.email;
    }

    if (Object.keys(allowedUpdates).length === 0) {
      throw new Error('No valid fields to update');
    }

    await user.update(allowedUpdates);
    return this.formatUser(user);
  }

  /**
   * Delete user
   */
  async deleteUser(id) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('User not found');
    }

    await user.destroy();
    return true;
  }

  /**
   * Authenticate user (login)
   */
  async authenticateUser(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      throw new Error('Invalid email or password');
    }

    return user;
  }

  /**
   * Generate auth tokens
   */
  generateAuthTokens(user) {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return {
      accessToken,
      refreshToken
    };
  }

  /**
   * Create a new session
   */
  async createSession(userId, refreshToken, ipAddress, userAgent) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const session = await Session.create({
      userId,
      refreshToken,
      ipAddress,
      userAgent,
      expiresAt,
      isActive: true
    });

    return session;
  }

  /**
   * Get active sessions for user
   */
  async getUserSessions(userId) {
    const sessions = await Session.findAll({
      where: {
        userId,
        isActive: true,
        expiresAt: {
          [Op.gte]: new Date()
        }
      },
      order: [['createdAt', 'DESC']]
    });

    return sessions;
  }

  /**
   * Invalidate session by refresh token
   */
  async invalidateSession(refreshToken) {
    const session = await Session.findOne({
      where: { refreshToken }
    });

    if (session) {
      await session.update({ isActive: false });
    }

    return true;
  }

  /**
   * Invalidate all user sessions
   */
  async invalidateAllUserSessions(userId) {
    await Session.update(
      { isActive: false },
      { where: { userId } }
    );

    return true;
  }

  /**
   * Get session by refresh token
   */
  async getSessionByRefreshToken(refreshToken) {
    const session = await Session.findOne({
      where: {
        refreshToken,
        isActive: true,
        expiresAt: {
          [Op.gte]: new Date()
        }
      }
    });

    return session;
  }

  /**
   * Format user for GraphQL response
   */
  formatUser(user) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      password: '',
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: user.updatedAt?.toISOString() || new Date().toISOString()
    };
  }
}

module.exports = new UserService();
