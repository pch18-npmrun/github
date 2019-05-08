export default class rw_pkg {
    static pkgPath: string;
    static pkgExis: boolean;
    pkgPath: string;
    pkgExis: boolean;
    pkg: {
        name: string;
        version: string;
        main: string;
        description?: string;
        keywords?: string[];
        scripts?: {
            test?: string;
            start?: string;
        };
        author?: string;
        license?: string;
        repository?: {
            type: string;
            url: string;
        };
        bugs?: {
            url: string;
        };
        homepage?: string;
    };
    constructor();
    save(): void;
    getName(): string;
    getOrgName(): string | null;
}
//# sourceMappingURL=rw_pkg.d.ts.map