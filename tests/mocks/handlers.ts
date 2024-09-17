import { http, HttpResponse } from "msw";
import { googleAuthResponse } from "../fixtures/auth";
const REQUEST_BASE_URL = "http://localhost:5173";

export const handlers = [
  http.get(`${REQUEST_BASE_URL}/google/callback`, () => {
    return HttpResponse.json(googleAuthResponse);
  }),
];
