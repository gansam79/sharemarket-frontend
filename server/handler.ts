import serverless from "serverless-http";
import app from "./index";  // import your express app

export const handler = serverless(app);
