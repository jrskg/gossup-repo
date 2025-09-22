import ioredis from "ioredis";
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT, REDIS_USER } from "./env.index.js";

const pub = new ioredis({
  host:REDIS_HOST,
  port:REDIS_PORT,
  username:REDIS_USER,
  password:REDIS_PASSWORD
});

const sub = new ioredis({
  host:REDIS_HOST,
  port:REDIS_PORT,
  username:REDIS_USER,
  password:REDIS_PASSWORD
});

export { pub, sub };