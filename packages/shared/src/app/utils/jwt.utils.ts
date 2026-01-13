import jwt from "jsonwebtoken";
import { IJwtUserPayload } from "@/app/types";

// 1. Create Token
export const createToken = async (
   payload: IJwtUserPayload,
   privateKey: string,
   expiresIn: number
) => {
   try {
      const token = await jwt.sign(payload, privateKey, {
         expiresIn,
      });
      return token;
   } catch (error) {}
};

// 2. Verify
