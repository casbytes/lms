/**
 * LiteFS is a server module that provides a way to connect to a LiteFS instance.
 * We have to import and reexport the functions to make sure Remix properly
 * detects the server-only usage of these functions and not bundle them in the client.
 * @module litefs
 * @see https://github.com/litefs/litefs
 */
export {
  getInstanceInfo,
  getAllInstances,
  getInternalInstanceDomain,
  getInstanceInfoSync,
} from "litefs-js";
export { ensureInstance, ensurePrimary } from "litefs-js/remix";
