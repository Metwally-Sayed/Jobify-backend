import { User } from "../src/model/user.model";

declare module "express-serve-static-core" {
  interface Request {
    user?: User;
  }
}