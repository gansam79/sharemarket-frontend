import serverless from "serverless-http";
import app from "../server/index"; // your express app export

export default serverless(app);
