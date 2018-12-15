const fs = require('fs').promises;

let readInput = async () => {
    // let res = await fs.readFile('./input15.txt');
    let res = await fs.readFile('./testInput.txt');
    let inputs = res.toString().split('\n');
    return inputs
}

let initialize = (inputs) => {
    let board = Array(inputs.length).fill().map(() => []);
    let elfs = new Set();
    let goblins = new Set();
    // {i, j, hitPoints = 200 }

    for (let i = 0; i < inputs.length; i++) {
        for (let j = 0; j < inputs[0].length; j++) {
            board[j][i] = inputs[i][j];
            if (inputs[i][j] === 'E') {
                let elf = { x: j, y: i, u: 'E', hitPoints: 200 };
                elfs.add(elf);
            }
            if (inputs[i][j] === 'G') {
                let goblin = { x: j, y: i, u: 'G', hitPoints: 200 };
                goblins.add(goblin);
            }
        }
    }

    // console.log(board);
    // console.log(elfs);
    // console.log(goblins);

    return [board, elfs, goblins];
}

let initializeEG = (board) => {
    let elfs = new Set();
    let goblins = new Set();

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if (board[i][j] === 'E') {
                let elf = { x: j, y: i, u: 'E', hitPoints: board[i][j].hitPoints };
                elfs.add(elf);
            }
            if (board[i][j] === 'G') {
                let goblin = { x: j, y: i, u: 'G', hitPoints: board[i][j].hitPoints };
                goblins.add(goblin);
            }
        }
    }

    return [elfs, goblins];
}


let sortUnits = (elfs, goblins) => {
    let units = [...elfs.values(), ...goblins.values()];

    units.sort((u1, u2) => {
        if (u1.y !== u2.y) {
            return u1.y - u2.y;
        }
        return u1.x - u2.x;
    });

    return units;
}

let findDirectOppononent = (x, y, letter, board) => {
    if (y - 1 >= 0 && board[x][y - 1] === letter) {
        // attack the top opponent
        return [x, y - 1];
    }
    if (x - 1 >= 0 && board[x - 1][y] === letter) {
        // attack the left opponent
        return [x - 1, y];
    }
    if (x + 1 < board.length && board[x + 1][y] === letter) {
        // attack the right opponent
        return [x + 1, y];
    }
    if (y + 1 < board[0].length && board[x][y + 1] === letter) {
        // attack the bottom opponent
        return [x, y + 1];
    }
}

let search = (x, y, letter, board) => {
    let reachable = [[x, y]];
    let newReachable = [];

    let max = Math.max(board.length, board[0].length);
    // console.log(`Searching at most ${max} times`);
    while (max) {
        for (let pos of reachable) {
            [x, y] = pos;
            res = findDirectOppononent(x, y, letter, board);
            if (res) {
                // console.log(`[${x}, ${y}] has direct oppenent ${res}`);
                return res;
            }
            if (y - 1 >= 0 && board[x][y - 1] === '.') {
                newReachable.push([x, y - 1]);
            }
            if (x - 1 >= 0 && board[x - 1][y] === '.') {
                newReachable.push([x - 1, y]);
            }
            if (x + 1 < board.length && board[x + 1][y] === '.') {
                newReachable.push([x + 1, y]);
            }
            if (y + 1 < board[0].length && board[x][y + 1] === '.') {
                newReachable.push([x, y + 1]);
            }
        }
        reachable = newReachable.slice();
        // console.log(reachable);
        max--;
    }
}

let move = (unit, opponents, board) => {
    let [x, y] = [unit.x, unit.y];

    let opponent = [...opponents.values()][0];
    let opponentLetter = opponent.u;

    let target = search(x, y, opponentLetter, board);
    
    if (target) {
        if (target[0] !== x || target[1] !== y) {
            
            // console.log(`${x},${y} has target ${target}`);
            if (target[1] < y && board[x][y-1] === '.') {
                // move up
                return [x, y - 1];
            }
            if (target[0] < x && board[x-1][y] === '.') {
                // move left
                return [x - 1, y];
            }
            if (target[0] > x && board[x+1][y] === '.') {
                // move right
                return [x + 1, y];
            }
            if (target[1] > y && board[x][y+1] === '.') {
                // move down
                return [x, y + 1];
            }

    
        }
    }
}

let print = (board) => {
    let row = '';
    for (let i = 0; i < board[0].length; i++) {
        for (let j = 0; j < board.length; j++) {
            row = row + board[j][i];
        }
        console.log(row);
        row = '';
    }
}

let main = async () => {
    let inputs = (await readInput());
    let [board, elfs, goblins] = initialize(inputs);
    let units = sortUnits(elfs, goblins);

    let i = 3;

    while(i > 0) {
        for (let unit of units) {
            let opponents = elfs;
            if (unit.u === 'E') {
                opponents = goblins;
            }
            
            if (opponents.length === 0) {
                // No more opponents
                return;
            }
            
            let res = move(unit, opponents, board);
            
            if (res) {
                board[unit.x][unit.y] = '.';
                [unit.x, unit.y] = res;
                board[unit.x][unit.y] = unit.u;
            }
        }
        print(board);
        [elfs, goblins] = initializeEG(board);
        units = sortUnits(elfs, goblins);
        i--;
    }
}


main();



// After 1 round:
// #########
// #.G...G.#
// #...G...#
// #...E..G#
// #.G.....#
// #.......#
// #G..G..G#
// #.......#
// #########

// After 2 rounds:
// #########
// #..G.G..#
// #...G...#
// #.G.E.G.#
// #.......#
// #G..G..G#
// #.......#
// #.......#
// #########

// After 3 rounds:
// #########
// #.......#
// #..GGG..#
// #..GEG..#
// #G..G...#
// #......G#
// #.......#
// #.......#
// #########