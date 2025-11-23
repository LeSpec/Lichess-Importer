import { fen, variant, pgn, san } from "../../lib/chessops/chessops.min.js";
import decodeTcn from "./decodeTcn.js";

const { parseFen } = fen;
const { setupPosition } = variant;
const { Node, ChildNode, makePgn } = pgn;
const { makeSanAndPlay, parseSan } = san;

export default function gameDataToPgn(gameData) {
    const header = gameData.pgnHeaders;
    const fen = header.FEN;
    const timestamps = gameData.moveTimestamps?.split(",").map(Number) ?? [];

    // convert chess.com to lichess header
    if (/^\d*$/.test(header.TimeControl)) header.TimeControl += "+0";
    header.Termination = /on time/.test(header.Termination)
        ? "Time forfeit"
        : "Normal";

    // convert header to Map<string, string>
    const headers = new Map(
        Object.entries(header).map(([k, v]) => [k, String(v)]),
    );

    // load starting position
    const setup = parseFen(fen).unwrap();
    const rules = decideRules(header.Variant);
    const pos = setupPosition(rules, setup).unwrap();

    // make chess moves and build PGN nodes
    const tcn = gameData.moveList;
    const moveObjects = decodeTcn(tcn);
    const moves = moveObjects.map(convertMove);
    const firstNode = buildPgnNodes(pos, moves, timestamps);

    return makePgn({ headers: headers, moves: firstNode });
}

function decideRules(variant) {
    const variantAliases = {
        chess: [
            "chess",
            "chess960",
            "960",
            "fischerrandom",
            "fischerandom",
            "fischer",
        ],
        antichess: ["antichess"],
        kingofthehill: ["koth", "king of the hill"],
        "3check": ["3-check", "three-check", "threecheck"],
        atomic: ["atomic"],
        horde: ["horde"],
        racingkings: ["racingkings"],
        crazyhouse: ["crazyhouse"],
    };

    const aliasMap = Object.fromEntries(
        Object.entries(variantAliases).flatMap(([canonical, aliases]) =>
            aliases.map((a) => [a.toLowerCase(), canonical]),
        ),
    );

    const rules = aliasMap[variant?.toLowerCase() ?? "chess"];
    if (!rules) {
        throw new Error("Unknown variant: " + variant);
    }

    return rules;
}

function convertMove(moveObj) {
    const pieceMap = {
        p: "pawn",
        n: "knight",
        b: "bishop",
        r: "rook",
        q: "queen",
        k: "king",
    };

    const move = new Object();
    if (moveObj.from) move.from = squareToNumber(moveObj.from);
    if (moveObj.promotion) move.promotion = pieceMap[moveObj.promotion];
    if (moveObj.drop) move.role = pieceMap[moveObj.drop];
    move.to = squareToNumber(moveObj.to);

    return move;
}

// square number: 0-63
function squareToNumber(square) {
    const file = square[0].toLowerCase(); // letter: a–h
    const rank = parseInt(square[1]); // digit: 1–8

    const fileIndex = file.charCodeAt(0) - "a".charCodeAt(0); // 0–7
    const rankIndex = rank - 1; // 0–7

    return rankIndex * 8 + fileIndex;
}

function buildPgnNodes(pos, moves, timestamps) {
    const firstNode = new Node();

    let currNode = firstNode;
    for (let [move, timestamp] of moves.map((m, i) => [m, timestamps[i]])) {
        move = fixCastling(pos, move);

        if (!pos.isLegal(move)) {
            throw new Error(
                `Illegal ${pos.rules} move: ${JSON.stringify(move)}`,
            );
        }

        const pgnNodeData = {
            san: makeSanAndPlay(pos, move),
            comments: timestamp ? [`[%clk ${deciSecToClk(timestamp)}]`] : [],
        };
        const childNode = new ChildNode(pgnNodeData);
        currNode.children.push(childNode);
        currNode = childNode;
    }

    return firstNode;
}

function fixCastling(pos, move) {
    const isCastling =
        pos.board.get(move.from).role === "king" &&
        sameRank(move.from, move.to) &&
        Math.abs(move.from - move.to) > 1;

    return isCastling
        ? parseSan(pos, move.from < move.to ? "O-O" : "O-O-O")
        : move;
}

function sameRank(a, b) {
    return a >> 3 === b >> 3; // >> 3 is the same as integer division by 8
}

function deciSecToClk(ds) {
    const totalSeconds = Math.trunc(ds / 10);
    const deci = ds % 10;
    const h = Math.trunc(totalSeconds / 3600);
    const m = Math.trunc((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    const pad = (n) => n.toString().padStart(2, "0");
    return `${h}:${pad(m)}:${pad(s)}.${deci}`;
}
