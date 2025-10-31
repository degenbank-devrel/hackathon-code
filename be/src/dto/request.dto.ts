import { Request } from 'express';

export interface UserRequest extends Request {
  user?: {
    user_id: string;
  };
}
