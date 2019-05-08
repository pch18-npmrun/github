import fs from 'fs';

export default class rw_pkg {
    static pkgPath = process.cwd() + '/package.json'
    static pkgExis = fs.existsSync(rw_pkg.pkgPath)
    pkgPath = rw_pkg.pkgPath
    pkgExis = rw_pkg.pkgExis
    pkg: {
        name: string,
        version: string,
        main: string,
        description?: string,
        keywords?: string[],
        scripts?: {
            test?: string,
            start?: string,
        },
        author?: string,
        license?: string,
        repository?: {
            type: string,
            url: string
        },
        bugs?: {
            url: string
        },
        homepage?: string
    }

    constructor() {
        if (rw_pkg.pkgExis) {
            this.pkg = require(rw_pkg.pkgPath)
        } else {
            throw new Error('没有package.json')
        }
    }

    save() {
        fs.writeFileSync(rw_pkg.pkgPath, JSON.stringify(this.pkg, null, '\t'))
    }

    getName() {
        return this.pkg.name.replace(/^@.*?\//, '')
    }

    getOrgName() {
        const match = this.pkg.name.match(/^@(.*?)\//)
        if (match) {
            return match[1]
        } else {
            return null
        }
    }
}