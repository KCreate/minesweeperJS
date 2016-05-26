function undefinedArray(length, value) {
    var array = Array.from(new Array(length)).map(() => value);
    return array;
};

var Minesweeper = function() {

    // Properties
    this.field = [];
    this.renderTarget = undefined;

    // Get amount of bombs in radius of 3x3
    this.bombsForField = function(x, y) {

        // Outside bounds East, South
        if (y > (this.field.length-1) || x > (this.field[0].length-1)) {
            return 0;
        }

        // Outside bounds North, West
        if (y < 0 || x < 0) {
            return 0;
        }

        // Bombs are not being counted
        if (this.field[y][x].bomb) {
            return 0;
        }

        var fieldModifiers = [
            [-1, -1],
            [0, -1],
            [1, -1],
            [-1, 0],
            [1, 0],
            [-1, 1],
            [0, 1],
            [1, 1],
        ];

        var amountOfBombs = 0;
        fieldModifiers.forEach((mod) => {
            if (this.field[y + mod[1]]) {
                if (this.field[y + mod[1]][x + mod[0]]) {
                    if (this.field[y + mod[1]][x + mod[0]].bomb) {
                        amountOfBombs++;
                    }
                }
            }
        });

        return amountOfBombs;
    }

    // Configure method
    this.configure = function({ fieldSize, renderTarget }) {

        // Construct the field
        this.field = undefinedArray(fieldSize.y, undefinedArray(fieldSize.x, undefined));
        this.field = this.field.map((row, y) => row.map((tile, x) => (new (function(game) {

            // Properties
            this.bomb = !Math.floor(Math.random() * 7);
            this.bombsAround = 0;
            this.flagged = false;
            this.open = false;
            this.game = game;
            this.x = x;
            this.y = y;

            // Tile methods
            this.leftClick = (event) => {
                if (this.bomb) {
                    this.game.loose();
                } else {
                    this.bombsAround = this.game.bombsForField(this.x, this.y);
                    this.open = true;
                    this.flagged = false;
                    this.game.render();
                }
            };
            this.rightClick = (event) => {
                event.preventDefault(); // hide context menu

                if (!this.open) {
                    this.flagged = !this.flagged;
                    this.game.render();
                }
            };
        })(this))));

        // Render target
        this.renderTarget = renderTarget;

        this.loose = function() {
            alert('You have lost!');
            loadGame();
        };
    };

    // Render the game into the target
    this.render = function() {

        // Generate the innerHTML
        var rows = this.field.map((fieldRow, rowIndex) => {
            var row = document.createElement('div');
            row.className = 'row';

            // Get tile elements
            var tileElements = fieldRow.map((tile, tileIndex) => {

                // Get the classnames
                var classNames = {
                    tile: true,
                    // bomb: tile.bomb, // Enable this to show all bombs on the screen
                    open: tile.open,
                    flagged: tile.flagged,
                    ['bombs-' + tile.bombsAround]: true
                };
                classNames = Object.keys(classNames).filter((key) => (classNames[key])).join(' ');

                // Create the element
                var element = document.createElement('div');
                element.className = classNames;
                element.onclick = tile.leftClick;
                element.oncontextmenu = tile.rightClick;

                if (!tile.bomb && tile.open) {
                    element.innerHTML = tile.bombsAround;
                }

                return element;
            });

            tileElements.forEach((tile) => {
                row.appendChild(tile);
            });

            return row;
        });

        // Put it into the game
        this.renderTarget.innerHTML = '';
        rows.forEach((row) => {
            this.renderTarget.appendChild(row);
        });
    };
};

function loadGame() {
    var game = new Minesweeper();
    game.configure({
        fieldSize: {
            x: 30,
            y: 15,
        },
        renderTarget: document.getElementById('app')
    });
    game.render();
}

loadGame();
