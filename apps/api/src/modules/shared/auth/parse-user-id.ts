import { InvalidUserIdException, MissingUserIdException } from './auth.exception';

export const USER_ID_HEADER = 'X-User-Id';

// Inteiro positivo que cabe num INT do MySQL.
const USER_ID_FORMAT = /^[1-9]\d{0,9}$/;
const MAX_USER_ID = 2_147_483_647;

export const parseUserId = (value: string | undefined): number => {
  if (value === undefined || value === '') {
    throw new MissingUserIdException();
  }
  const userId = Number(value);
  if (!USER_ID_FORMAT.test(value) || userId > MAX_USER_ID) {
    throw new InvalidUserIdException();
  }
  return userId;
};
