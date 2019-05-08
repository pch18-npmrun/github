#!/usr/bin/env node
import shell from '@pch18/shell-tools'
import Github from './github'
import rw_pkg from './rw_pkg';

const github = new Github()
const main = async () => {
    await github.login()

    const p = new rw_pkg()
    const repoName = await shell.askInput('请输入github库名称', p.pkgExis ? p.getName() : undefined)

    if (await shell.askConfirm('这是一个组织的库吗?', false)) {
        const orgs = await github.readOrgs()
        const orgName = await shell.askList('请选择组织名称', orgs.map(t => t.login))
        const repoAddr = await github.makeRepo(repoName, orgName)
        await github.setGitRemote(repoAddr)
    } else {
        const repoAddr = await github.makeRepo(repoName)
        await github.setGitRemote(repoAddr)
    }
    
}
main()
    .then(() => console.info('运行结束,退出'))
    .catch(console.error)
    .finally(() => process.exit())