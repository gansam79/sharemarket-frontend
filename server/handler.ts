import serverless from "serverless-http";
import app from "../server/index"; // uses your Express app

export default serverless(app);
