import { Request } from '@pch18/request'
import fs from 'fs';
import Shell from '@pch18/shell-tools';
import 'colors'
import rw_pkg from './rw_pkg';

interface github_user {
    login: string,
    id: number,
    node_id: string,
    avatar_url: string,
    repos_url: string
}
interface github_repo {
    id: number
    node_id: string
    private: boolean
    name: string
    full_name: string
    owner: github_user[]
    html_url: string
    ssh_url: string
    clone_url: string
}
interface github_org {
    login: string,
    id: number,
    node_id: string,
    url: string,
    repos_url: string,
    issues_url: string,
    members_url: string,
    public_members_url: string,
    avatar_url: string,
    description: string | null
}


export default class github {
    confJson = {
        user: '',
        pass: ''
    }
    myInfo: github_user & { name: string } = {
        login: '',
        name: '',
        id: 0,
        node_id: '',
        avatar_url: '',
        repos_url: ''
    }
    constructor() {

    }
    //shell
    async setGitRemote(gitAddr: string) {
        if (!await Shell.processSpawn([
            'git init',
            'git remote add origin ' + gitAddr,
        ], '设置remote地址')) {
            const old_addr = await Shell.spawnString('git remote get-url origin')
            if (old_addr.toLowerCase() == gitAddr.toLowerCase()) {
                console.info('存在相同remote,忽略设定'.cyan, old_addr, gitAddr)
            } else {
                if (await Shell.askConfirm(`当前git推送是${old_addr},是否覆盖?`, true)) {
                    await Shell.processSpawn([
                        'git remote remove origin',
                        'git remote add origin ' + gitAddr
                    ], '覆盖remote地址')
                }
            }
        }
        if (
            rw_pkg.pkgExis &&
            await Shell.askConfirm('发现package.json,是否写入git地址?', true)
        ) {
            const p = new rw_pkg()
            delete p.pkg.repository
            delete p.pkg.bugs
            delete p.pkg.homepage
            p.save()
            await Shell.processSpawn('npm init -y', '更新package.json')
        }
    }




    //api
    async makeRepo(name: string, orgName?: string): Promise<string> {
        let api_repos = 'https://api.github.com/user/repos'
        if (orgName) {
            api_repos = `https://api.github.com/orgs/${orgName}/repos`
        }
        if (!await Shell.askConfirm(
            `您要创建 ${name}` +
            (orgName ? ` 在 ${orgName} 中` : '') +
            ' 对吗?'
        )) {
            throw new Error('用户终止操作')
        }
        const result = await Request.post_json<github_repo>(
            api_repos,
            { name: name },
            {
                auth: { user: this.confJson.user, pass: this.confJson.pass },
                allowCode: t => true,
                raw: true
            }
        )
        if (result.code == 201) {
            // return result.data.ssh_url
            console.info('仓库创建成功'.cyan)
            return `git@github.com:${orgName || this.myInfo.login}/${name}.git`
        } else if (result.code == 422 && await Shell.askConfirm('github存在同名库,是否使用?', true)) {
            console.info(`使用github已存在的[${orgName || this.myInfo.login}/${name}]仓库`.cyan)
            return `git@github.com:${orgName || this.myInfo.login}/${name}.git`
        } else if (result.code == 422) {
            throw new Error('存在同名仓库,创建失败')
        } else {
            throw new Error('创建失败')
        }
    }

    async readOrgs(): Promise<github_org[]> {
        const result = await Request.get_json('https://api.github.com/user/orgs',
            { auth: { user: this.confJson.user, pass: this.confJson.pass } }
        )
        return result as any
    }

    async readRepos(name: string): Promise<github_repo[]> {
        const result = await Request.get_json('https://api.github.com/user/repos',
            { auth: { user: this.confJson.user, pass: this.confJson.pass } }
        )
        return result as any
    }

    async getMyInfo(): Promise<void> {
        try {
            const userinfo = await Request.get_json('https://api.github.com/user', {
                auth: { user: this.confJson.user, pass: this.confJson.pass }
            })
            Object.assign(this.myInfo, userinfo)
        } catch (e) {
            if (e.code == 401) {
                console.error('账户认证失败,请重新输入登录信息'.red)
                await this.readConfig(true)
                await this.getMyInfo()
            } else {
                throw new Error('连接github服务器失败')
            }
        }
    }

    async login() {
        await this.readConfig()
        await this.getMyInfo()
        // console.log(this.myInfo)
        console.info(`你好${this.myInfo.name} Github登录成功`.yellow)
    }

    async readConfig(force = false) {
        try {
            if (force) {
                throw new Error('强制重新录入账号密码')
            }
            const confJson = require('../config.json')
            if (!confJson.user || !confJson.pass) {
                throw new Error('配置文件读取失败')
            } else {
                Object.assign(this.confJson, confJson)
            }
        } catch{
            console.log('您第一次使用需要先设置github的账号'.yellow)
            this.confJson.user = await Shell.askInput('请输入github用户名', undefined, /^\w+$/, '用户名不应该出现特殊字符')
            this.confJson.pass = await Shell.askPassword('请输入密码')
            fs.writeFileSync(__dirname + '/../config.json', JSON.stringify(this.confJson, null, '\t'))
        }
    }
}