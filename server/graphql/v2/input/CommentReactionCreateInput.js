import { GraphQLInputObjectType, GraphQLInt, GraphQLObjectType, GraphQLString } from 'graphql';

import { ExpenseReferenceInput } from './ExpenseReferenceInput';

/**
 * Input type to use as the type for the comment input in createComment mutation.
 */
export const CommentReactionCreateInput = new GraphQLInputObjectType({
  name: 'CommentReactionCreateInput',
  fields: () => ({
    emoji: {
      type: GraphQLString,
      description: 'The emoji associated with the reaction',
    },
    UserId: {
      type: GraphQLString,
      description: 'An unique identifier for the user id associated with this comment reaction',
    },
    CommentId: {
      type: GraphQLString,
      description: 'An unique identifier for the comment id associated with this comment reaction',
    },
    expense: {
      type: ExpenseReferenceInput,
      description: 'If your comment is linked to an expense, set it here',
    },
    ExpenseId: {
      type: GraphQLInt,
      deprecationReason: '2019-02-26: Please use the expense field',
    },
    ConversationId: { type: GraphQLString },
  }),
});
