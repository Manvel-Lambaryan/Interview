import { Prisma } from "@prisma/client";
import { AppError } from "../../errors/AppError.js";
import { ErrorCodes } from "../../errors/codes.js";
import * as urlsRepository from "../urls/urls.repository.js";
import * as usersRepository from "./users.repository.js";

export async function registerUser(input) {
  try {
    return await usersRepository.createUser(input);
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new AppError(
        409,
        "A user with this email already exists",
        ErrorCodes.CONFLICT_EMAIL,
      );
    }
    throw e;
  }
}

export async function listUserUrls(userId) {
  const user = await usersRepository.findUserById(userId);
  if (!user) {
    throw new AppError(404, "User not found", ErrorCodes.NOT_FOUND_USER);
  }
  return urlsRepository.findManyByUserId(userId);
}
