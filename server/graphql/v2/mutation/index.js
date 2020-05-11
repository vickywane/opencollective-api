import accountMutations from './AccountMutations';
import collectiveMutations from './CollectiveMutations';
import commentMutations from './CommentMutations';
import connectedAccountMutations from './ConnectedAccountMutations';
import conversationMutations from './ConversationMutations';
import createCollectiveMutations from './CreateCollectiveMutations';
import expenseMutations from './ExpenseMutations';
import commentReactionMutations from './CommentReactionMutations';
import payoutMethodMutations from './PayoutMethodMutations';

const mutation = {
  ...commentMutations,
  ...commentReactionMutations,
  ...connectedAccountMutations,
  ...conversationMutations,
  ...createCollectiveMutations,
  ...expenseMutations,
  ...accountMutations,
  ...collectiveMutations,
  ...payoutMethodMutations,
};

export default mutation;
