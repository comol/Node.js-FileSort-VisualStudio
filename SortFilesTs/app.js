"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
let srcpath = '';
let dstpath = '';
let needdelete = false;
let destdirs = [];
let Args = process.argv.slice(2);
//Копирует файл в правильный каталог по заданным правилам
function copyfile(src, needdelete) {
    let filestring = src;
    let firstletter = getshortfilename(filestring).substr(0, 1);
    let srcfile = src;
    let dstfile = path.join(dstpath, firstletter, getshortfilename(src));
    if (destdirs.indexOf(firstletter) == -1) {
        let dirpath = path.join(dstpath, firstletter);
        destdirs.push(firstletter);
        fs.exists(dirpath, (exists) => {
            if (!exists) {
                fs.mkdir(dirpath, (err) => {
                    if (err) {
                        console.log(`${dirpath} ' not created' `);
                    }
                    else {
                        syscopyfile(srcfile, dstfile, needdelete);
                    }
                });
            }
            else {
                syscopyfile(srcfile, dstfile, needdelete);
            }
        });
    }
}
function syscopyfile(srcfile, dstfile, move) {
    fs.exists(dstfile, (exists) => {
        if (!exists) {
            fs.copyFile(srcfile, dstfile, (err) => {
                if (err) {
                    console.log(`${dstfile} ' not created' `);
                }
                else {
                    if (move) {
                        fs.unlink(srcfile, (err) => {
                            if (err) {
                                console.log(`${srcfile} ' not deleted' `);
                            }
                        });
                    }
                }
            });
        }
    });
}
// Копирует и удаляет файлы в нужную папку
// рекурсивная функция
function ReadAllFiles(dir, needdelete, callback) {
    fs.readdir(dir, (err, readfiles) => {
        for (var i in readfiles) {
            let name = path.join(dir, readfiles[i]);
            fs.stat(name, function (err, filestats) {
                if (filestats.isDirectory()) {
                    ReadAllFiles(name, needdelete, () => {
                        fs.rmdir(name, (err) => {
                            if (err) {
                                console.log(`${name} ' not created' `);
                            }
                        });
                    });
                }
                else {
                    copyfile(name, needdelete);
                }
            });
        }
    });
}
// получает короткое имя файлов по полному
function getshortfilename(filename) {
    let filearray = filename.split('\\');
    let shortfilename = filearray[filearray.length - 1];
    return shortfilename;
}
// Основной раздел
if (Args.length < 2) {
    console.log('Usage: app.ts <source path> <destination path> [-delete]');
}
if (Args.length == 3) {
    if (Args[2] == '-delete') {
        needdelete = true;
    }
}
srcpath = Args[0];
dstpath = Args[1];
ReadAllFiles(srcpath, needdelete, () => { });
//# sourceMappingURL=app.js.map