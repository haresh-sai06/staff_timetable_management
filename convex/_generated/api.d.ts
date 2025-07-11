/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as classrooms from "../classrooms.js";
import type * as departments from "../departments.js";
import type * as http from "../http.js";
import type * as reports from "../reports.js";
import type * as router from "../router.js";
import type * as staff from "../staff.js";
import type * as subjects from "../subjects.js";
import type * as timetable from "../timetable.js";
import type * as updateRole from "../updateRole.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  classrooms: typeof classrooms;
  departments: typeof departments;
  http: typeof http;
  reports: typeof reports;
  router: typeof router;
  staff: typeof staff;
  subjects: typeof subjects;
  timetable: typeof timetable;
  updateRole: typeof updateRole;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
