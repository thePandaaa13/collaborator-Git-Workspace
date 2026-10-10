import {
    useState,
    useEffect,
    useRef
} from "react";

import {
    useParams,
    useLocation
} from "react-router-dom";

import { io } from "socket.io-client";

import * as Y from "yjs";

import {
    MonacoBinding
} from "y-monaco";

import Editor from "@monaco-editor/react";


const languageMap = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    css: "css",
    html: "html",
    json: "json",
    md: "markdown"
};


const Workspace = () => {

    const { repoId } = useParams();

    const location = useLocation();


    const {
        sessionID: initialSessionID,
        name,
        role,
        filePath
    } = location.state || {};


    // ==================================================
    // SESSION
    // ==================================================

    const [
        sessionID,
        setSessionID
    ] = useState(initialSessionID);


    // ==================================================
    // FILE STATE
    // ==================================================

    const [
        tree,
        setTree
    ] = useState([]);


    const [
        selectedFile,
        setSelectedFile
    ] = useState(null);


    const [
        fileSha,
        setFileSha
    ] = useState(null);


    // ==================================================
    // COLLABORATION STATE
    // ==================================================

    const [
        collaboration,
        setCollaboration
    ] = useState(null);


    // ==================================================
    // YJS DOCUMENT
    // ==================================================

    const [
        ydoc
    ] = useState(
        () => new Y.Doc()
    );


    const ytext =
        ydoc.getText("code");


    // ==================================================
    // EDITOR REF
    // ==================================================

    const editorRef =
        useRef(null);


    // ==================================================
    // BINDING REF
    // ==================================================

    const bindingRef =
        useRef(null);


    // ==================================================
    // SOCKET REF
    // ==================================================

    const socketRef =
        useRef(null);


    // ==================================================
    // OPEN FILE
    // ==================================================

    const openFile = async (path) => {

        const response =
            await fetch(
                `http://localhost:5000/repositories/${repoId}/file?path=${encodeURIComponent(path)}`,
                {
                    credentials: "include"
                }
            );


        const data =
            await response.json();


        setSelectedFile(path);

        setFileSha(data.sha);


        // --------------------------------------------------
        // Put GitHub content into Yjs only once.
        // --------------------------------------------------

        if (ytext.length === 0) {

            ytext.insert(
                0,
                data.content
            );

        }


        console.log(
            "FILE OPENED"
        );

        console.log(
            "YJS CONTENT:",
            ytext.toString()
        );

    };


    // ==================================================
    // SAVE FILE
    // ==================================================

    const saveFile = async () => {

        if (!selectedFile) {
            return;
        }


        const response =
            await fetch(
                `http://localhost:5000/repositories/${repoId}/file`,
                {
                    method: "PUT",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        path:
                            selectedFile,

                        content:
                            ytext.toString(),

                        sha:
                            fileSha

                    })
                }
            );


        const data =
            await response.json();


        console.log(
            "GitHub save response:",
            data
        );

    };


    // ==================================================
    // START COLLABORATION
    // ==================================================

    const startCollaboration =
        async () => {

        console.log(
            "START COLLABORATION CALLED"
        );


        if (!selectedFile) {
            return;
        }


        // --------------------------------------------------
        // Create session
        // --------------------------------------------------

        const response =
            await fetch(
                `http://localhost:5000/collaboration/${repoId}`,
                {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        filePath:
                            selectedFile

                    })
                }
            );


        const data =
            await response.json();


        console.log(
            "COLLABORATION CREATED:",
            data
        );


        // --------------------------------------------------
        // Initialize server Y.Doc
        // --------------------------------------------------

        const initializeResponse =
            await fetch(
                `http://localhost:5000/collaboration/${data.sessionID}/initialize`,
                {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        update: Array.from(Y.encodeStateAsUpdate(ydoc))
                            

                    })
                }
            );


        const initializeData =
            await initializeResponse.json();


        console.log(
            "SERVER INITIALIZED:",
            initializeData
        );


        setCollaboration(data);


        // --------------------------------------------------
        // Start socket connection
        // --------------------------------------------------

        setSessionID(
            data.sessionID
        );

    };


    // ==================================================
    // FETCH REPOSITORY TREE
    // ==================================================

    useEffect(() => {

        if (
            role === "collaborator"
        ) {

            return;
        }


        const fetchTree =
            async () => {

            const response =
                await fetch(
                    `http://localhost:5000/repositories/${repoId}/tree`,
                    {
                        credentials: "include"
                    }
                );


            const data =
                await response.json();


            setTree(
                data.tree
            );

        };


        fetchTree();

    }, [
        repoId,
        role
    ]);


    // ==================================================
    // COLLABORATOR FILE
    // ==================================================

    useEffect(() => {

        if (
            role === "collaborator" &&
            filePath
        ) {

            setSelectedFile(
                filePath
            );

        }

    }, [
        role,
        filePath
    ]);


    // ==================================================
    // SOCKET + YJS
    // ==================================================

    useEffect(() => {

        if (!sessionID) {
            return;
        }


        console.log(
            "CONNECTING SESSION:",
            sessionID
        );


        const socket =
            io(
                "http://localhost:5000"
            );


        socketRef.current =
            socket;


        // ==================================================
        // LOCAL YJS UPDATE
        // ==================================================

        const handleYUpdate =
            (update, origin) => {

            console.log(
                "LOCAL YJS UPDATE",
                origin
            );


            // Don't send remote updates
            // back to server.

            if (
                origin === "remote"
            ) {

                return;
            }


            console.log(
                "SENDING YJS UPDATE TO SERVER"
            );


            socket.emit(
                "y-update",
                {

                    sessionID:
                        sessionID,

                    update:
                        Array.from(update)

                }
            );

        };


        ydoc.on(
            "update",
            handleYUpdate
        );


        // ==================================================
        // SOCKET CONNECTED
        // ==================================================

        socket.on(
            "connect",
            () => {

            console.log(
                "SOCKET CONNECTED:",
                socket.id
            );


            socket.emit(
                "join-room",
                {

                    sessionID:
                        sessionID,

                    name:
                        name,

                    role:
                        role

                }
            );

        });


        // ==================================================
        // INITIAL SYNC
        // ==================================================

        socket.on(
            "initial-sync",
            (update) => {

            console.log(
                "INITIAL SYNC RECEIVED"
            );


            const uint8Array =
                new Uint8Array(
                    update
                );


            Y.applyUpdate(
                ydoc,
                uint8Array,
                "remote"
            );


            console.log(
                "YJS AFTER INITIAL SYNC:",
                ytext.toString()
            );

        });


        // ==================================================
        // LIVE UPDATE
        // ==================================================

        socket.on(
            "y-update",
            (update) => {

            console.log(
                "LIVE UPDATE RECEIVED"
            );


            console.log(
                "RAW UPDATE:",
                update
            );


            const uint8Array =
                new Uint8Array(
                    update
                );


            Y.applyUpdate(
                ydoc,
                uint8Array,
                "remote"
            );


            console.log(
                "YJS AFTER LIVE UPDATE:",
                ytext.toString()
            );

        });


        // ==================================================
        // CLEANUP
        // ==================================================

        return () => {

            console.log(
                "CLEANING SESSION:",
                sessionID
            );


            ydoc.off(
                "update",
                handleYUpdate
            );


            socket.disconnect();


            socketRef.current =
                null;

        };


    }, [
        sessionID
    ]);


    // ==================================================
    // MONACO ↔ YJS BINDING
    // ==================================================

    useEffect(() => {

        if (
            !editorRef.current
        ) {

            return;
        }


        console.log(
            "CREATING MONACO BINDING"
        );


        const model =
            editorRef.current.getModel();


        if (!model) {
            return;
        }


        // Destroy old binding

        if (
            bindingRef.current
        ) {

            bindingRef.current.destroy();

            bindingRef.current =
                null;
        }


        // Create new binding

        bindingRef.current =
            new MonacoBinding(
                ytext,
                model,
                new Set([
                    editorRef.current
                ])
            );


        console.log(
            "MONACO BINDING CREATED"
        );


        console.log(
            "BOUND YJS CONTENT:",
            ytext.toString()
        );


        return () => {

            if (
                bindingRef.current
            ) {

                bindingRef.current.destroy();

                bindingRef.current =
                    null;
            }

        };

    }, [
        selectedFile
    ]);


    // ==================================================
    // LANGUAGE
    // ==================================================

    const extension =
        selectedFile
            ?.split(".")
            .pop();


    const language =
        languageMap[
            extension
        ] || "plaintext";


    // ==================================================
    // UI
    // ==================================================

    return (

        <div className="workspace">


            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="workspace-header">

                <h1>
                    Workspace
                </h1>

                <span>
                    Repository {repoId}
                </span>

            </div>


            {/* ==========================================
                BODY
            ========================================== */}

            <div className="workspace-body">


                {/* ======================================
                    FILE EXPLORER
                ====================================== */}

                <div className="file-explorer">

                    <h2>
                        Files
                    </h2>


                    {tree.map(
                        (item) => (

                        <div
                            key={
                                item.path
                            }

                            className="file-item"

                            onClick={() => {

                                if (
                                    item.type ===
                                    "blob"
                                ) {

                                    openFile(
                                        item.path
                                    );

                                }

                            }}
                        >

                            <span>

                                {
                                    item.type ===
                                    "tree"
                                        ? "📁"
                                        : "📄"
                                }

                            </span>


                            <span>

                                {
                                    item.path
                                }

                            </span>

                        </div>

                    ))}

                </div>


                {/* ======================================
                    EDITOR
                ====================================== */}

                <div className="editor-area">


                    <div className="editor-header">

                        <span>

                            {
                                selectedFile ||
                                "No file selected"
                            }

                        </span>


                        {role === "leader" &&
                            selectedFile &&
                            !collaboration && (

                            <button
                                onClick={
                                    startCollaboration
                                }
                            >

                                Start Collaboration

                            </button>

                        )}


                        {role === "leader" &&
                            selectedFile && (

                            <button
                                onClick={
                                    saveFile
                                }
                            >

                                Save

                            </button>

                        )}

                    </div>


                    <div className="editor-container">

                        {selectedFile ? (

                            <Editor

                                height="100%"

                                language={
                                    language
                                }


                                onMount={
                                    (editor) => {

                                    console.log(
                                        "MONACO EDITOR MOUNTED"
                                    );


                                    editorRef.current =
                                        editor;


                                    // Immediately bind
                                    // this editor to Yjs.

                                    const model =
                                        editor.getModel();


                                    if (
                                        bindingRef.current
                                    ) {

                                        bindingRef
                                            .current
                                            .destroy();

                                    }


                                    bindingRef.current =
                                        new MonacoBinding(
                                            ytext,
                                            model,
                                            new Set([
                                                editor
                                            ])
                                        );


                                    console.log(
                                        "MONACO BINDING CREATED"
                                    );


                                    console.log(
                                        "CURRENT YJS CONTENT:",
                                        ytext.toString()
                                    );

                                }}

                            />

                        ) : (

                            <div
                                className="editor-placeholder"
                            >

                                <h2>
                                    Select a file
                                </h2>

                                <p>
                                    Choose a file from
                                    the explorer to start
                                    editing.
                                </p>

                            </div>

                        )}

                    </div>

                </div>

            </div>


            {/* ==========================================
                COLLABORATION INFORMATION
            ========================================== */}

            {collaboration && (

                <div>

                    <p>

                        Collaboration started for:
                        {" "}

                        {
                            collaboration.filePath
                        }

                    </p>


                    <p>

                        Invite Token:
                        {" "}

                        {
                            collaboration.inviteToken
                        }

                    </p>

                </div>

            )}

        </div>

    );

};


export default Workspace;