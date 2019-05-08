"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class rw_pkg {
    constructor() {
        this.pkgPath = rw_pkg.pkgPath;
        this.pkgExis = rw_pkg.pkgExis;
        if (rw_pkg.pkgExis) {
            this.pkg = require(rw_pkg.pkgPath);
        }
        else {
            throw new Error('没有package.json');
        }
    }
    save() {
        fs_1.default.writeFileSync(rw_pkg.pkgPath, JSON.stringify(this.pkg, null, '\t'));
    }
    getName() {
        return this.pkg.name.replace(/^@.*?\//, '');
    }
    getOrgName() {
        const match = this.pkg.name.match(/^@(.*?)\//);
        if (match) {
            return match[1];
        }
        else {
            return null;
        }
    }
}
rw_pkg.pkgPath = process.cwd() + '/package.json';
rw_pkg.pkgExis = fs_1.default.existsSync(rw_pkg.pkgPath);
exports.default = rw_pkg;
//# sourceMappingURL=rw_pkg.js.map