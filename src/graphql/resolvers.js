const userResolvers = require('../modules/users/users.resolvers');

const resolvers = {
  Query: {
    ...userResolvers.Query
  },
  Mutation: {
    ...userResolvers.Mutation
  }
};

module.exports = resolvers;
