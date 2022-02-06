import { readFile, writeFile } from "fs/promises";
import transform from "./transform.js";

const [, , inPath, outPath] = process.argv;
const file = await readFile(inPath);
const tranformed = await transform(file.toString(), process.argv.includes("--nominify"));
await writeFile(outPath, tranformed);