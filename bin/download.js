import chalk from "chalk";
import download from "download-git-repo";

const remote = process.argv[2];
const name = process.argv[3];
console.log(remote);

download(remote, name, { clone: true }, err => {
    if (err) {
        console.log("err", chalk.red(err));
        return;
    }
});
