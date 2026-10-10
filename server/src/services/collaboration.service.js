import * as Y from "yjs";

const documents = new Map();

export const getDocument = (sessionID) => {

    if (!documents.has(sessionID)) {

        documents.set(
            sessionID,
            new Y.Doc()
        );

    }

    return documents.get(sessionID);
};