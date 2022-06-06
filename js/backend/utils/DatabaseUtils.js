// utils for reading and writing to the database
import * as fs from "fs";

const DB_PATH = "../database/db.json";

export const dbWrite = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data));
};

export const dbRead = () => {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
};
