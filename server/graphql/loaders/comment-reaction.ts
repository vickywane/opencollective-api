import DataLoader from 'dataloader';
import models from '../../models';
import { Op } from 'sequelize';

/**
 * Loader for all collective's payout methods
 */
export default {
  generateCommentReactionsLoader: (): DataLoader<number, object> =>
    new DataLoader(async (commentIds: number[]) => {
      const commentReactions = await models.CommentReaction.findAll({
        where: { CommentId: { [Op.in]: commentIds } },
      });

      return commentReactions;
    }),
};