#!/usr/bin/env node
import { Command } from "commander";
import pkg from "../package.json" assert { type: "json" };
import init from "./init.js";

const program = new Command();
program.name(pkg.name).description(pkg.description).version(pkg.version);
program.command("init").description("clone a system-cli template").action(init);
program.parse(process.argv);
