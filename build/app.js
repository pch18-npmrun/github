#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const shell_tools_1 = __importDefault(require("@pch18/shell-tools"));
const github_1 = __importDefault(require("./github"));
const rw_pkg_1 = __importDefault(require("./rw_pkg"));
const github = new github_1.default();
const main = () => __awaiter(this, void 0, void 0, function* () {
    yield github.login();
    const p = new rw_pkg_1.default();
    const repoName = yield shell_tools_1.default.askInput('请输入github库名称', p.pkgExis ? p.getName() : undefined);
    if (yield shell_tools_1.default.askConfirm('这是一个组织的库吗?', false)) {
        const orgs = yield github.readOrgs();
        const orgName = yield shell_tools_1.default.askList('请选择组织名称', orgs.map(t => t.login));
        const repoAddr = yield github.makeRepo(repoName, orgName);
        yield github.setGitRemote(repoAddr);
    }
    else {
        const repoAddr = yield github.makeRepo(repoName);
        yield github.setGitRemote(repoAddr);
    }
});
main()
    .then(() => console.info('运行结束,退出'))
    .catch(console.error)
    .finally(() => process.exit());
//# sourceMappingURL=app.js.map