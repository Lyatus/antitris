const width = 8, height = 18;
const colors = ['#ffff04','#f62e59','#3fc7f5','#ff6831'];
const VOID = '#071820';
const FLASH = '#E1F9D1';
let grid = {};
let state;
let piece = {};
let tick = 0;
let redraw = true;
let score, level

function keydown(e) {
	switch(e.key) {
		case 'ArrowLeft':
			piece.x--;
			if(piece_collide()) {
				piece.x++;
			} else {
				redraw = true;
			}
			break;
		case 'ArrowRight':
			piece.x++;
			if(piece_collide()) {
				piece.x--;
			} else {
				redraw = true;
			}
			break;
		case 'ArrowUp':
			let tmp = piece.c[-2];
			piece.c[-2] = piece.c[-1];
			piece.c[-1] = piece.c[0];
			piece.c[0] = piece.c[1];
			piece.c[1] = tmp;
			redraw = true;
			break;
	}
}
function update() {
	switch(state) {
		case 'playing':
			if((tick % 20) == 0) {
				piece.y++;
				if(piece_collide()) {
					piece.y--;
					if(piece.y==0) {
						state = 'gameover';
					} else { // Fixate piece
						for(let i = -2; i < 2; i++) {
							cell_set(piece.x + i, piece.y, piece.c[i]);
						}
						reset_piece();
						state = 'falling';
						return update(); // Do a falling update to avoid useless stalling
					}
				}
				redraw = true;
			}
			break;
		case 'falling':
			if(!(tick%10)) {
				let over = true;
				for(let x = 0; x < width; x++) {
					for(let y = height - 1; y > 0; y--) {
						if(cell(x,y) == VOID && cell(x,y-1) != VOID) {
							cell_set(x, y, cell(x, y - 1));
							cell_set(x, y - 1, VOID);
							over = false;
						}
					}
				}
				if(over) {
					state = 'finding';
				}
				redraw = true;
			}
			break;
		case 'finding':
			let tetromino = find_tetromino();
			if(tetromino) {
				for(let i = 0; i < 4; i++) {
					grid[tetromino[i]] = FLASH;
				}
				showingStartTick = tick;
				score += 100;
				state = 'showing';
			} else { // No tetromino found, go back to playing
				state = 'playing';
			}
			redraw = true;
			break;
		case 'showing':
			if(tick < showingStartTick + 50) {
				for(let x = 0; x < width; x++) {
					for(let y = 0; y < height; y++) {
						if(cell(x, y) == FLASH) {
							cell_set(x, y, VOID);
						}
					}
				}
				state = 'falling';
				update_score();
				redraw = true;
			}
			break;
		case 'gameover':
			reset();
			break;
	}
	if(redraw) {
		draw();
	}
	tick++;
}
function cell(x,y) {
	return grid[x+'_'+y];
}
function cell_set(x,y,v) {
	grid[x+'_'+y] = v;
}
function draw() {
	for(let id in grid) {
		document.getElementById(id).style.backgroundColor = grid[id];
	}
	if(state=='playing') {
		for(let i=-2;i<2;i++) {
			document.getElementById((piece.x+i)+'_'+piece.y).style.backgroundColor = piece.c[i];
		}
	}
	redraw = false;
}
function reset() {
	state = 'playing';
	for(let x = 0; x < width; x++) {
		for(let y = 0; y < height; y++) {
			cell_set(x, y, VOID);
		}
	}
	reset_piece();
	score = 0;
	update_score();
}
function reset_piece() {
	piece.x = width / 2;
	piece.y = 0;
	piece.c = [];
	for(let i = -2; i < 2; i++) {
		piece.c[i] = colors[parseInt(Math.random()*colors.length)];
	}
}
function piece_collide() {
	if(piece.y >= height
	|| piece.x - 2 < 0
	|| piece.x + 1 >= width) {
		return true;
	}
	for(let i = -2; i < 2; i++) {
		if(cell(piece.x + i, piece.y) != VOID) {
			return true;
		}
	}
	return false;
}
function find_tetromino() {
	for(let y = 0; y < height; y++) {
		for(let x = 0; x < width; x++) {
			if(cell(x, y) != VOID) {
				let tetromino = [];
				find_tetromino_inner(tetromino, x, y, cell(x, y));
				if(tetromino.length == 4) {
					return tetromino;
				}
			}
		}
	}
	return false;
}
function find_tetromino_inner(tetromino, x, y, color) {
	let id = x+'_'+y;
	if(tetromino.length < 4 && x >= 0 && y >= 0 && x < width && y < height
	&& tetromino.indexOf(id) < 0 && cell(x,y) == color) {
		tetromino.push(id);
		find_tetromino_inner(tetromino, x-1, y, color);
		find_tetromino_inner(tetromino, x+1, y, color);
		find_tetromino_inner(tetromino, x, y-1, color);
		find_tetromino_inner(tetromino, x, y+1, color);
	}
}
function update_score() {
	document.getElementById('score').innerHTML = score;
	document.getElementById('level').innerHTML = level = compute_level();
}
function compute_level() {
	return Math.ceil(Math.log2(Math.max(1,score)));
}

window.addEventListener('load', function() {
	document.body.onkeydown = keydown;

	const gridElement = document.getElementById('grid');
	for(let y = 0; y < height; y++) {
		for(let x = 0; x < width; x++) {
			gridElement.innerHTML += '<div class="frame"></div>';
			gridElement.innerHTML += '<div id="'+x+'_'+y+'" class="cell"></div>';
		}
		gridElement.innerHTML += '<div class="frame"></div>';
		gridElement.innerHTML += '<br/>';
	}

	reset();
	setInterval(update, 10);
});
