import * as usersService from "./users.service.js";

function toUserResponse(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at.toISOString(),
  };
}

export async function registerUserController(req, res, next) {
  try {
    const user = await usersService.registerUser(req.body);
    res.status(201).json(toUserResponse(user));
  } catch (e) {
    next(e);
  }
}
