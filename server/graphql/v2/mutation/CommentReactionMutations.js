import { GraphQLNonNull, GraphQLString } from 'graphql';
import { CommentReaction } from '../object/CommentReaction';
import models from '../../../models';
import { FeatureNotAllowedForUser, Unauthorized } from '../../errors';
import { canUseFeature } from '../../../lib/user-permissions';
import FEATURE from '../../../constants/feature';
import { CommentReactionCreateInput } from '../input/CommentReactionCreateInput';

async function createCommentReaction(entity, args, req) {
  if (!req.remoteUser) {
    throw new Unauthorized();
  } else if (!canUseFeature(req.remoteUser, FEATURE.CONVERSATIONS)) {
    throw new FeatureNotAllowedForUser();
  }

  const { emoji, comment } = args;

  return await models.CommentReaction.addCommentReaction(req.remoteUser, comment, emoji);
}

async function deleteCommentReaction(id, remoteUser) {
  if (!remoteUser) {
    throw new Unauthorized();
  } else if (!canUseFeature(remoteUser, FEATURE.CONVERSATIONS)) {
    throw new FeatureNotAllowedForUser();
  }
  return await models.CommentReaction.addCommentReaction(id);
}

const commentReactionMutations = {
  addCommentReaction: {
    type: CommentReaction,
    args: {
      commentReaction: {
        type: new GraphQLNonNull(CommentReactionCreateInput),
      },
    },
    resolve: async (entity, args, req) => {
      return createCommentReaction(entity, args, req);
    },
  },

  removeCommentReaction: {
    type: CommentReaction,
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLString),
      },
    },
    resolve(_, { id }, { remoteUser }) {
      return deleteCommentReaction(id, remoteUser);
    },
  },
};

export default commentReactionMutations;
