import pool from "../config/db.js"
import {getGithubRepositories, getGithubRepository, getGithubRepositoryTree, getGithubFile, updateGithubFIle } from "../services/github.service.js"

export const getRepositories = async (req, res) => {

    console.log("GET REPOSITORIES CONTROLLER STARTED");

    const result = await pool.query(
        `
        SELECT access_token
        FROM users
        WHERE id = $1
        `,
        [req.user.id]
    );

    console.log("TOKEN FOUND");

    const accessToken = result.rows[0].access_token;

    const repositories = await getGithubRepositories(accessToken);

    console.log("GITHUB REPOSITORIES RECEIVED");

    console.log(repositories);

    res.send(repositories);
};

export const getRepository = async(req,res)=>{
    const result = await pool.query(
        `
        SELECT access_token
        FROM users 
        WHERE id = $1
        `,
        [req.user.id]
    );
    const accessToken = result.rows[0].access_token

    const repoId = req.params.repoId;
    const repository = await getGithubRepository(
        accessToken,
        repoId
    );
    console.log(repository.full_name);
console.log(repository.default_branch);
    res.send(repository)

}

export const getRepositoryTree = async (req, res) => {

    const result = await pool.query(
        `
        SELECT access_token
        FROM users
        WHERE id = $1
        `,
        [req.user.id]
    );

    const accessToken = result.rows[0].access_token;

    const repoId = req.params.repoId;
    console.log("REPO ID RECIVED BY BACKEND",repoId)

    const repository = await getGithubRepository(
        accessToken,
        repoId
    );
 

console.log("REPOSITORY:", repository);
console.log("FULL NAME:", repository.full_name);
console.log("DEFAULT BRANCH:", repository.default_branch);

    const [owner, repo] = repository.full_name.split("/");

    const tree = await getGithubRepositoryTree(
        accessToken,
        owner,
        repo,
        repository.default_branch
    );

    res.send(tree);
};

export const getFile = async (req, res) => {
    const result = await pool.query(
    `
    SELECT access_token
    FROM users
    WHERE id = $1
    `,
    [req.user.id]
);

const accessToken = result.rows[0].access_token;

const repoId = req.params.repoId;
const path = req.query.path;

if (!path) {
    return res.status(400).send("File path is required");
}
const repository = await getGithubRepository(
    accessToken,
    repoId
);


const [owner,repo ] = repository.full_name.split("/");

const file = await getGithubFile(
    accessToken,
    owner,
    repo,
    path
);
const content = Buffer.from(file.content, "base64").toString("utf-8");

res.send({
    name : file.name,
    path: file.path,
    sha : file.sha,
    content:content
});


};

export const saveFile = async(req,res)=>{
    const result = await pool.query(
        `SELECT access_token
        FROM users
        WHERE id = $1`,
        [req.user.id]
    )

    const accessToken = result.rows[0].access_token;

    const repoId = req.params.repoId
   const {path, content, sha} = req.body;

   if(!path || content === undefined || !sha ){
    return res.status(400).send("either the path is NOT given or the content is undefined or the sha is NOT provided")


   }

   const repository = await getGithubRepository(
    accessToken,
    repoId
   )
   console.log("REPOSITORY:", repository);

   console.log(repository.full_name)
   const [owner , repo] = repository.full_name.split("/")
   const resultFromGithub = await updateGithubFIle(
    accessToken,
    owner,
    repo,
    path,
    content,
    sha
   )

   res.send(resultFromGithub)
}