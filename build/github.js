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
const request_1 = require("@pch18/request");
const fs_1 = __importDefault(require("fs"));
const shell_tools_1 = __importDefault(require("@pch18/shell-tools"));
require("colors");
const rw_pkg_1 = __importDefault(require("./rw_pkg"));
class github {
    constructor() {
        this.confJson = {
            user: '',
            pass: ''
        };
        this.myInfo = {
            login: '',
            name: '',
            id: 0,
            node_id: '',
            avatar_url: '',
            repos_url: ''
        };
    }
    //shell
    setGitRemote(gitAddr) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield shell_tools_1.default.processSpawn([
                'git init',
                'git remote add origin ' + gitAddr,
            ], '设置remote地址'))) {
                const old_addr = yield shell_tools_1.default.spawnString('git remote get-url origin');
                if (old_addr.toLowerCase() == gitAddr.toLowerCase()) {
                    console.info('存在相同remote,忽略设定'.cyan, old_addr, gitAddr);
                }
                else {
                    if (yield shell_tools_1.default.askConfirm(`当前git推送是${old_addr},是否覆盖?`, true)) {
                        yield shell_tools_1.default.processSpawn([
                            'git remote remove origin',
                            'git remote add origin ' + gitAddr
                        ], '覆盖remote地址');
                    }
                }
            }
            if (rw_pkg_1.default.pkgExis &&
                (yield shell_tools_1.default.askConfirm('发现package.json,是否写入git地址?', true))) {
                const p = new rw_pkg_1.default();
                delete p.pkg.repository;
                delete p.pkg.bugs;
                delete p.pkg.homepage;
                p.save();
                yield shell_tools_1.default.processSpawn('npm init -y', '更新package.json');
            }
        });
    }
    //api
    makeRepo(name, orgName) {
        return __awaiter(this, void 0, void 0, function* () {
            let api_repos = 'https://api.github.com/user/repos';
            if (orgName) {
                api_repos = `https://api.github.com/orgs/${orgName}/repos`;
            }
            if (!(yield shell_tools_1.default.askConfirm(`您要创建 ${name}` +
                (orgName ? ` 在 ${orgName} 中` : '') +
                ' 对吗?'))) {
                throw new Error('用户终止操作');
            }
            const result = yield request_1.Request.post_json(api_repos, { name: name }, {
                auth: { user: this.confJson.user, pass: this.confJson.pass },
                allowCode: t => true,
                raw: true
            });
            if (result.code == 201) {
                // return result.data.ssh_url
                console.info('仓库创建成功'.cyan);
                return `git@github.com:${orgName || this.myInfo.login}/${name}.git`;
            }
            else if (result.code == 422 && (yield shell_tools_1.default.askConfirm('github存在同名库,是否使用?', true))) {
                console.info(`使用github已存在的[${orgName || this.myInfo.login}/${name}]仓库`.cyan);
                return `git@github.com:${orgName || this.myInfo.login}/${name}.git`;
            }
            else if (result.code == 422) {
                throw new Error('存在同名仓库,创建失败');
            }
            else {
                throw new Error('创建失败');
            }
        });
    }
    readOrgs() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield request_1.Request.get_json('https://api.github.com/user/orgs', { auth: { user: this.confJson.user, pass: this.confJson.pass } });
            return result;
        });
    }
    readRepos(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield request_1.Request.get_json('https://api.github.com/user/repos', { auth: { user: this.confJson.user, pass: this.confJson.pass } });
            return result;
        });
    }
    getMyInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userinfo = yield request_1.Request.get_json('https://api.github.com/user', {
                    auth: { user: this.confJson.user, pass: this.confJson.pass }
                });
                Object.assign(this.myInfo, userinfo);
            }
            catch (e) {
                if (e.code == 401) {
                    console.error('账户认证失败,请重新输入登录信息'.red);
                    yield this.readConfig(true);
                    yield this.getMyInfo();
                }
                else {
                    throw new Error('连接github服务器失败');
                }
            }
        });
    }
    login() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.readConfig();
            yield this.getMyInfo();
            // console.log(this.myInfo)
            console.info(`你好${this.myInfo.name} Github登录成功`.yellow);
        });
    }
    readConfig(force = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (force) {
                    throw new Error('强制重新录入账号密码');
                }
                const confJson = require('../config.json');
                if (!confJson.user || !confJson.pass) {
                    throw new Error('配置文件读取失败');
                }
                else {
                    Object.assign(this.confJson, confJson);
                }
            }
            catch (_a) {
                console.log('您第一次使用需要先设置github的账号'.yellow);
                this.confJson.user = yield shell_tools_1.default.askInput('请输入github用户名', undefined, /^\w+$/, '用户名不应该出现特殊字符');
                this.confJson.pass = yield shell_tools_1.default.askPassword('请输入密码');
                fs_1.default.writeFileSync(__dirname + '/../config.json', JSON.stringify(this.confJson, null, '\t'));
            }
        });
    }
}
exports.default = github;
//# sourceMappingURL=github.js.map