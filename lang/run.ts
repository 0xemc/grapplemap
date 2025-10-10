import fs from "fs";
import { parse } from "./parse";

const input = fs.readFileSync("./test.grpl", "utf-8");

const { transitions } = parse(input) ?? {}

console.log(transitions)