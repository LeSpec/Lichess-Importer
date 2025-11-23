/*
TCN: data type from api.chess.com, alias: moveList (chess.com/callback)
Algorithm source: https://www.chess.com/clubs/forum/view/official-chess-com-movelist-pgn-help
Explanation: https://www.chess.com/clubs/forum/view/move-list-format-when-viewing-my-game-via-callback

Note: not every combination of two characters from the set is a valid move
*/
export default function decodeTcn(tcn) {
    const characterSet =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?" + "{~}(^)[_]@#$" + "&-*+="; // 64 squares + 4*3 promotions + 5 drop pieces
    const pieces = "qnrbp"; // queen, knight, rook, bishop, pawn
    let length = tcn.length;
    let result = [];

    for (let i = 0; i < length; i += 2) {
        let chessMove = {}; // attributes: from, to, promotion, drop (for crazyhouse)

        // first 6 bit represent the from square, 6 bit: 2^6 = 8 * 8 = rank * row
        let fromByte = characterSet.indexOf(tcn[i]);
        let toByte = characterSet.indexOf(tcn[i + 1]);

        if (toByte > 63) {
            chessMove.promotion = pieces[Math.floor((toByte - 64) / 3)]; // a pawn can move forward in 3 directions
            toByte = fromByte + (16 > fromByte ? -8 : 8) + ((toByte - 1) % 3) - 1; // -8/+8 for black/white pawn promotion
        }

        if (fromByte > 75) {
            chessMove.drop = pieces[fromByte - 76];
        } else {
            chessMove.from = characterSet[fromByte % 8] + (Math.floor(fromByte / 8) + 1);
        }

        chessMove.to = characterSet[toByte % 8] + (Math.floor(toByte / 8) + 1);

        result.push(chessMove);
    }

    return result;
}
