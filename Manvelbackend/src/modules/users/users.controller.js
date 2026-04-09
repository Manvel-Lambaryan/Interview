import { getUserAnalytics } from "../clicks/clicks.service.js";
import { toShortUrlResponse } from "../urls/urls.presenter.js";
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

export async function listUserUrlsController(req, res, next) {
  try {
    const rows = await usersService.listUserUrls(req.params.id);
    res.status(200).json(rows.map(toShortUrlResponse));
  } catch (e) {
    next(e);
  }
}

export async function getUserAnalyticsController(req, res, next) {
  try {
    const analytics = await getUserAnalytics(req.params.id);
    res.status(200).json(analytics);
  } catch (e) {
    next(e);
  }
}
