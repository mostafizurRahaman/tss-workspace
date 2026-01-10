import { Document, Model } from "mongoose";
import { TAuthRole, TAuthStatus } from "./user.constant";

export interface IUser extends Document {
   name: string;
   email: string;
   password: string;
   status: TAuthStatus;

   // roles:
   role: TAuthRole;

   // profile common properties:
   profileImage?: string;

   // 2FA:
   twoFactorSecret?: string;
   isTwoFactorEnabled: boolean;
   twoFactorBackupCodes?: string[];

   // reason:
   blockedReason?: string;
   deletionReason?: string;

   // common timestamps:
   blockedAt?: Date;
   deletedAt?: Date;
   passwordChangedAt?: Date;
   createdAt: Date;
   updatedAt: Date;
}

export interface IUserModel extends Model<IUser> {
   getUserById(id: string): Promise<IUser | null>;
   isUserExistByEmail(email: string): Promise<IUser | null>;
   isUserActive(user: IUser): Promise<boolean>;
   isUserDeleted(user: IUser): Promise<boolean>;
   isUserBlocked(user: IUser): Promise<boolean>;
   isUserUnderReview(user: IUser): Promise<boolean>;
   isUserStatusPending(user: IUser): Promise<boolean>;
   isTwoFactorEnabled: (user: IUser) => Promise<boolean>;
   createAccessToken: (user: IUser) => Promise<string>;
   createRefreshToken: (user: IUser) => Promise<string>;
   createResetToken: (user: IUser) => Promise<string>;
   compareUserPassword: (
      plainText: string,
      hashedPassword: string
   ) => Promise<boolean>;
   isJwtIssuedBeforePasswordChanged: (
      passwordChangedAt: Date,
      jwtIssuedTimestamps: string
   ) => Promise<boolean>;
}
