var width = 10, height = 20;
var colors = ['red','green','blue','orange'];
var VOID = 'lightgrey';
var FLASH = 'black';
var grid = {};
var gridElement = document.getElementById('grid');
var state;
var piece = {};
var canvas;
var gl = null;

function resize(){
	var style = '';
	style += 'canvas{width: '+window.innerWidth+'px;height: '+window.innerHeight+'px;}';
	document.getElementById('style').innerHTML = style;
}
function keydown(e){
	console.log(e);
	switch(e.key){
		case 'ArrowLeft':
			piece.x--;
			if(pieceCollide()) piece.x++;
			break;
		case 'ArrowRight':
			piece.x++;
			if(pieceCollide()) piece.x--;
			break;
		case 'ArrowUp':
			var tmp = piece.c[-2];
			piece.c[-2] = piece.c[-1];
			piece.c[-1] = piece.c[0];
			piece.c[0] = piece.c[1];
			piece.c[1] = tmp;
			break;
	}
}
function update(){
	switch(state){
		case 'playing':
			piece.y++;
			if(pieceCollide()){
				piece.y--;
				if(piece.y==0)
					state = 'gameover';
				else{ // Fixate piece
					for(var i=-2;i<2;i++)
						cellSet(piece.x+i,piece.y,piece.c[i]);
					resetPiece();
					state = 'falling';
				}
			}
			break;
		case 'falling':
			var over = true;
			for(var x=0;x<width;x++){
				for(var y=height-1;y>0;y--){
					if(cell(x,y)==VOID && cell(x,y-1)!=VOID){
						cellSet(x,y,cell(x,y-1));
						cellSet(x,y-1,VOID);
						over = false;
					}
				}
			}
			if(over)
				state = 'finding';
			break;
		case 'finding':
			var tetromino = findTetromino();
			if(tetromino){
				for(var i=0;i<4;i++)
					grid[tetromino[i]] = FLASH;
				state = 'showing';
			}else{ // No tetromino found, go back to playing
				state = 'playing';
			}
			break;
		case 'showing':
			for(var x=0;x<width;x++)
				for(var y=0;y<height;y++)
					if(cell(x,y)==FLASH)
						cellSet(x,y,VOID);
			state = 'falling';
			break;
		case 'gameover':
			reset();
			break;
	}
	draw();
}
function cell(x,y){
	return grid[x+'_'+y];
}
function cellSet(x,y,v){
	grid[x+'_'+y] = v;
}
function draw(){
	for(var id in grid)
		document.getElementById(id).style.backgroundColor = grid[id];
	if(state=='playing')
		for(var i=-2;i<2;i++)
			document.getElementById((piece.x+i)+'_'+piece.y).style.backgroundColor = piece.c[i];
}
function reset(){
	state = 'playing';
	for(var x=0;x<width;x++)
		for(var y=0;y<height;y++)
			cellSet(x,y,VOID);
	resetPiece();
}
function resetPiece(){
	piece.x = width/2;
	piece.y = 0;
	piece.c = [];
	for(var i=-2;i<2;i++)
		piece.c[i] = colors[parseInt(Math.random()*colors.length)];
}
function pieceCollide(){
	if(piece.y>=height
	|| piece.x-2<0
	|| piece.x+1>=width)
		return true;
	for(var i=-2;i<2;i++)
		if(cell(piece.x+i,piece.y)!=VOID)
			return true;
	return false;
}
function findTetromino(){
	for(var y=0;y<height;y++)
		for(var x=0;x<width;x++)
			if(cell(x,y)!=VOID){
				var tetromino = [];
				findTetrominoInner(tetromino,x,y,cell(x,y));
				if(tetromino.length==4)
					return tetromino;
			}
	return false;
}
function findTetrominoInner(tetromino,x,y,color){
	var id = x+'_'+y;
	if(tetromino.length<4 && x>=0 && y>=0 && x<width && y<height
	&& tetromino.indexOf(id)<0 && cell(x,y)==color){
		tetromino.push(id);
		findTetrominoInner(tetromino,x-1,y,color);
		findTetrominoInner(tetromino,x+1,y,color);
		findTetrominoInner(tetromino,x,y-1,color);
		findTetrominoInner(tetromino,x,y+1,color);
	}
}

// Initialize hooks
document.body.onresize = resize;
document.body.onkeydown = keydown;

for(var y=0;y<height;y++){
	for(var x=0;x<width;x++)
		gridElement.innerHTML += '<div id="'+x+'_'+y+'" class="cell"></div>';
	gridElement.innerHTML += '<br/>';
}

reset();
setInterval(update,100);

// Initialize canvas
/*
canvas = document.getElementById('canvas');
gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
if(!gl) alert('WebGL is unavailable');
else{ // Start game
	gl.clearColor(0.0,0.0,0.0,1.0);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);           // Enable depth testing
	gl.depthFunc(gl.LEQUAL);
	resize();
	reset();
	setInterval(update,100);
}
*/
