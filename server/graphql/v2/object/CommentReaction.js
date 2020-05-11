import { GraphQLObjectType, GraphQLString } from 'graphql';
import { GraphQLDateTime } from 'graphql-iso-date';

const CommentReaction = new GraphQLObjectType({
  name: 'CommentReaction',
  description: 'This represents an Comment Reaction',
  fields: () => {
    return {
      id: {
        type: GraphQLString,
        description: 'An unique identifier for this comment reaction',
      },
      UserId: {
        type: GraphQLString,
        description: 'An unique identifier for the user id associated with this comment reaction',
      },
      CommentId: {
        type: GraphQLString,
        description: 'An unique identifier for the comment id associated with this comment reaction',
      },
      emoji: {
        type: GraphQLString,
        description: 'The emoji associated with this user and comment',
      },

      createdAt: {
        type: GraphQLDateTime,
        description: 'The time this comment was created',
      },
      updatedAt: {
        type: GraphQLDateTime,
        description: 'The time this comment reaction was last updated',
      },
    };
  },
});

export { CommentReaction };
