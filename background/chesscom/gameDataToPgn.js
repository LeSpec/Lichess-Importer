import { Chess } from "../../lib/chess.js-0.13.4/chess.js";
import decodeTcn from "./decodeTcn.js";

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
    moveObjects.forEach((o) => chess.move(o));

    return chess.pgn();
}
