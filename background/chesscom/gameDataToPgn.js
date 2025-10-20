import { KING, Chess } from "../../lib/chess.js-0.13.4/chess.js";
import decodeTcn from "./decodeTcn.js";
import { handleError } from "../../lib/utility.js";

export default function gameDataToPgn(gameData) {
    const chess = new Chess();
    const header = gameData.pgnHeaders;

    // convert chess.com to lichess header
    if (/^\d*$/.test(header.TimeControl)) header.TimeControl += "+0";
    header.Termination = /on time/.test(header.Termination) ? "Time forfeit" : "Normal";

    for (const key in header) {
        chess.header(key, header[key] + ""); // .header can only handle strings, so we cast player ratings
    }

    // add chess moves
    const tcn = gameData.moveList;
    const moveObjects = decodeTcn(tcn);

    for (const moveObj of moveObjects) {
        if (!makeMove(chess, moveObj)) {
            handleError("Illegal move: " + JSON.stringify(moveObj) + "\nhistory: " + chess.history());
            break;
        }
    }

    return chess.pgn();
}

function makeMove(chess, moveObj) {
    if (!chess.move(moveObj)) {
        const fixedMove = fixMove(chess, moveObj);
        if (!fixedMove) return false;

        if (!chess.move(fixedMove)) return false;
    }

    return true;
}

function fixMove(chess, moveObj) {
    if (chess.get(moveObj.from).type === KING && moveObj.to && moveObj.from[1] === moveObj.to[1]) {
        if (moveObj.from < moveObj.to) return "O-O";
        if (moveObj.from > moveObj.to) return "O-O-O";
    }
    return null;
}
