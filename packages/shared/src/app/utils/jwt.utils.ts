/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from 'jsonwebtoken'
import type { IJwtUserPayload } from '../types'

// 1. Create Token
export const createToken = (
  payload: IJwtUserPayload,
  privateKey: string,
  expiresIn: string | number
) => {
  try {
    const token = jwt.sign(payload, privateKey, {
      expiresIn: expiresIn as number,
    })
    return token
  } catch (error: any) {
    throw new Error(error)
  }
}
