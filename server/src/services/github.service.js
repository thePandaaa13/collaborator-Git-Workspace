export const exchangeCodeForToken = async (code) => {

    const response = await fetch(
        "https://github.com/login/oauth/access_token",
        {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code: code
            })
        }
    );

    return await response.json();
};


export const getGithubUser = async (accessToken) => {

    const response = await fetch(
        "https://api.github.com/user",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github+json"
            }
        }
    );
    console.log("GitHub user response status:", response.status);
    return await response.json();
};


export const getGithubRepositories = async (accessToken) => {

    console.log("ACCESS TOKEN EXISTS:", !!accessToken);

    const response = await fetch(
        "https://api.github.com/user/repos",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github+json"
            }
        }
    );

    console.log("GitHub status:", response.status);

    return await response.json();
};

export const getGithubRepository = async (accessToken, repoId) => {
    const response = await fetch(
        `https://api.github.com/repositories/${repoId}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github+json"
            }
        }
    );
    console.log(" i am from githun service and my jon is to fetch the repo details from the githib",response)

    return await response.json();
};

export const getGithubRepositoryTree = async(accessToken, owner , repo , branch)=>{
    const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
        {
            headers :{
                Authorization : `Bearer ${accessToken}`,
                Accept : "application/vnd.github+json"
            }
        }
    );
    console.log("TREE URL:", 
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
);

console.log("TREE STATUS:", response.status);
    return await response.json();
}


export const getGithubFile = async (
    accessToken,
    owner,
    repo,
    path
) => {
    const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github+json"
            }
        }
    );

    return await response.json();
};

export const updateGithubFIle = async( accessToken,owner,repo,path, content, sha)=>{
    const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
            method : "PUT",

            headers: {
                Authorization : `Bearer ${accessToken}`,
                Accept : "application/vnd.github/json",
                "Content-Type": "application/json"

            },
            body : JSON.stringify({
                message : `Update ${path}`,
                content : Buffer.from(content).toString("base64"),
                sha
            })
        }

    );
    return await response.json();
}