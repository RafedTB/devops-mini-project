import { UserType } from './enum';

export type JWTPayloadType = {
  id: number;
  userType: UserType;
};

export type accessTokenType = {
  accessToken: string;
};
