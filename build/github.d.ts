import 'colors';
interface github_user {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    repos_url: string;
}
interface github_repo {
    id: number;
    node_id: string;
    private: boolean;
    name: string;
    full_name: string;
    owner: github_user[];
    html_url: string;
    ssh_url: string;
    clone_url: string;
}
interface github_org {
    login: string;
    id: number;
    node_id: string;
    url: string;
    repos_url: string;
    issues_url: string;
    members_url: string;
    public_members_url: string;
    avatar_url: string;
    description: string | null;
}
export default class github {
    confJson: {
        user: string;
        pass: string;
    };
    myInfo: github_user & {
        name: string;
    };
    constructor();
    setGitRemote(gitAddr: string): Promise<void>;
    makeRepo(name: string, orgName?: string): Promise<string>;
    readOrgs(): Promise<github_org[]>;
    readRepos(name: string): Promise<github_repo[]>;
    getMyInfo(): Promise<void>;
    login(): Promise<void>;
    readConfig(force?: boolean): Promise<void>;
}
export {};
//# sourceMappingURL=github.d.ts.map