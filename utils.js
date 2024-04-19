const os = require("os");
const fs = require('fs');
const path = require('path')
const root = path.join(os.tmpdir(), "test")





async function createDirectory(name, currentDir) {

    if (currentDir !== undefined) {
        const pathDir = path.join(root, currentDir, name)
        await fs.promises.mkdir(pathDir)
    } else {
        const pathFile = path.join(root, name);
        await fs.promises.mkdir(pathFile)
    }


}


async function fileExist(path) {
    try {
        await fs.promises.access(path);
        return true;
    } catch {
        return false;

    }
}






module.exports = {createDirectory,fileExist}