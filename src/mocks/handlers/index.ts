import { studyHandlers } from './study';
import { qnaHandlers } from './qna';
import { infoHandlers } from './info';
import { signUpHandlers } from './signup';

export const handlers = [
  ...studyHandlers,
  ...qnaHandlers,
  ...infoHandlers,
  ...signUpHandlers,
];
