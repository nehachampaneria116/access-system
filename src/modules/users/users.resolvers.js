const queryResolvers = require('./queries');
const signUp = require('./mutations/signup');
const login = require('./mutations/login');
const { refreshToken, updateUserInfo, deleteUser } = require('./mutations');

const userResolvers = {
  Query: {
    getLoggedInUser: queryResolvers.getLoggedInUser,
    getAllUsers: queryResolvers.getAllUsers,
    user: queryResolvers.user
  },

  Mutation: {
    signUp,
    login,
    refreshToken,
    updateUserInfo,
    deleteUser
  }
};

module.exports = userResolvers;
