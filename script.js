const width = 8, height = 18;
let grid = {};
let state = 'gameover';
let piece = {};
let tick = 0;
let redraw = true;
let score = 0;
let level;
let combo_counter;

function keydown(e) {
	if(state == 'gameover') {
		if(tick > 20 && e.key == ' ') {
			reset();
		}
		return;
	}
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
		case 'ArrowDown':
			piece.y++;
			if(piece_collide()) {
				piece.y--;
			} else {
				redraw = true;
			}
			break;
		case ' ':
			do {
				piece.y++;
			} while(!piece_collide());
			piece.y--;
			redraw = true;
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
					if(piece.y == 0) {
						gameover();
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
						if(cell(x,y) == '' && cell(x,y-1) != '') {
							cell_set(x, y, cell(x, y - 1));
							cell_set(x, y - 1, '');
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
					grid[tetromino[i]] = 'flash';
				}
				tick = 0;
				score += 1 + combo_counter;
				combo_counter += 1;
				state = 'showing';
			} else { // No tetromino found, go back to playing
				state = 'playing';
				combo_counter = 0;
			}
			redraw = true;
			break;
		case 'showing':
			if(tick > 5) {
				for(let x = 0; x < width; x++) {
					for(let y = 0; y < height; y++) {
						if(cell(x, y) == 'flash') {
							cell_set(x, y, '');
						}
					}
				}
				state = 'falling';
				update_score();
				redraw = true;
			}
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
		document.getElementById(id).className = grid[id];
	}
	if(state == 'playing') {
		for(let i = -2; i < 2; i++) {
			document.getElementById((piece.x+i)+'_'+piece.y).className = piece.c[i];
		}
	}
	redraw = false;
}
function reset() {
	document.getElementById('popup').classList.remove('show');
	state = 'playing';
	for(let x = 0; x < width; x++) {
		for(let y = 0; y < height; y++) {
			cell_set(x, y, '');
		}
	}
	reset_piece();
	score = 0;
	combo_counter = 0;
	update_score();
}
function reset_piece() {
	piece.x = width / 2;
	piece.y = 0;
	piece.c = [];
	for(let i = -2; i < 2; i++) {
		piece.c[i] = 'c' + parseInt(Math.random() * 4);
	}
}
function piece_collide() {
	if(piece.y >= height
	|| piece.x - 2 < 0
	|| piece.x + 1 >= width) {
		return true;
	}
	for(let i = -2; i < 2; i++) {
		if(cell(piece.x + i, piece.y) != '') {
			return true;
		}
	}
	return false;
}
function find_tetromino() {
	for(let y = 0; y < height; y++) {
		for(let x = 0; x < width; x++) {
			if(cell(x, y) != '') {
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
	return Math.ceil(Math.max(1, Math.log2(score)));
}
function gameover() {
	state = 'gameover';
	tick = 0;
	const popup = document.getElementById('popup');
	popup.innerHTML = '<h2>Game Over</h2><h2>Press Space To Restart</h2>';
	popup.classList.add('show');
}

window.addEventListener('load', function() {
	document.body.onkeydown = keydown;

	const grid_el = document.getElementById('grid');
	for(let y = 0; y < height; y++) {
		for(let x = 0; x < width; x++) {
			const cell = document.createElement('cell')
			cell.id = `${x}_${y}`;
			grid_el.appendChild(document.createElement('dot'));
			grid_el.appendChild(cell);
		}
		grid_el.appendChild(document.createElement('dot'));
		grid_el.appendChild(document.createElement('br'));
	}

	update_score();
	setInterval(update, 10);
});
