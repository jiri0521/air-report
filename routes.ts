/**An array of routes that are accessible to the public
 * These routes do not equire authentication
 * @type {string[]}
 */
export const publicRoutes = [
    "/"
    ];

/**An array of routes that are use authentication
 * These routes will redirect logged in users to /settings
 * @type {string[]}
 */
export const authRoutes = [
    "/login",
    "/register",
    ];

/**the prefix for API authentication routes
 * Routes that start with this prefix are use for API
 * @type {string[]}
 */
export const apiAuthPrefix ="/api/";


/**the default redirect path after logging in 
 * @type {string[]}
 */
export const DEFAULT_LOGIN_REDIRECT ="/";