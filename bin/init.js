import inquirer from "inquirer";
import fs from "fs";
import ora from "ora";
import chalk from "chalk";
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import figlet from "figlet";

const process = (command, params, options) =>
    new Promise((resolve, reject) => {
        //stdio不设置ignore就需要监听stdout来进行数据消费，不然pipe满了就会堵塞导致子进程无法exit
        const child = spawnSync(command, params, {
            ...options,
            shell: global.process.platform === "win32",
            // stdio: "ignore",
        });
        if (!child.status) {
            resolve(child.stdout.toString());
            return;
        }
        reject(child.stderr.toString());
    });

// 远程模板列表
const web = {
    vue: "https://github.com/jzxznb/apps-cli.git#vue",
};
const server = {
    koa2: "https://github.com/jzxznb/apps-cli.git#koa2",
};
export default async () => {
    const downSpinner = ora("正在下载模板...");
    try {
        const { projectName } = await inquirer.prompt([
            { name: "projectName", message: "输入项目名称", type: "input" },
        ]);
        if (fs.existsSync(`${projectName}`)) throw new Error("存在相同名称目录");
        await process("mkdir", [projectName]);
        const { front, end } = await inquirer.prompt([
            { name: "front", message: "请选用前端框架", type: "list", choices: [{ name: "vue", value: "vue" }] },
            { name: "end", message: "请选用后端框架", type: "list", choices: [{ name: "koa2", value: "koa2" }] },
        ]);
        downSpinner.start();
        const pro1 = process(
            "node",
            [fileURLToPath(`${path.dirname(import.meta.url)}/download.js`), `direct:${web[front]}`, "web"],
            { cwd: `${global.process.cwd()}/${projectName}` }
        );
        const pro2 = process(
            "node",
            [fileURLToPath(`${path.dirname(import.meta.url)}/download.js`), `direct:${server[end]}`, "server"],
            { cwd: `${global.process.cwd()}/${projectName}` }
        );
        await Promise.all([pro1, pro2]);
        downSpinner.succeed(chalk.green("模板下载成功！"));
        console.log(
            "\r\n" +
                figlet.textSync("apps-cli", {
                    font: "3D-ASCII",
                    horizontalLayout: "default",
                    verticalLayout: "default",
                    width: 80,
                    whitespaceBreak: true,
                })
        );
        console.log(chalk.blue(`\n\n\n cd ${projectName}\n pnpm install -r \n cd web || cd server \n pnpm run dev`));
    } catch (error) {
        downSpinner.fail(chalk.red(`${error}`));
    }
};
