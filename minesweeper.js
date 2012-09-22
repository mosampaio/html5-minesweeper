//classe dto com as coordenadas x,y do canvas
var Ponto = Class.create();
Ponto.prototype = {
	initialize: function(x, y) {
		this.setX(x);
		this.setY(y);
	},
	setX: function(x) {
		this.x = x;
	},
	setY: function(y) {
		this.y = y;
	}
}
var Quadrado = Class.create();
Quadrado.prototype = {
	initialize: function(visivel, temBomba) {
		this.setVisivel(visivel);
		this.setTemBomba(temBomba);
		this.setMarcado = false;
	},
	setVisivel: function(visivel) {
		this.visivel = visivel;
	},
	setTemBomba: function(temBomba) {
		this.temBomba = temBomba;
	},
	setMarcado: function(marcado) {
		this.marcado = marcado;
	}
}
//retorna a coordenada x,y relativa ao canvas
function posicaoCursor(e) {
	var x;
	var y;
	if (e.pageX || e.pageY) {
	  x = e.pageX;
	  y = e.pageY;
	} else {
	  x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
	  y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	x -= canvas.offsetLeft;
	y -= canvas.offsetTop;
	return new Ponto(x,y);
}
var canvas;
var ctx;
var cinza = 'rgb(168,168,168)';
var cinzaClaro = 'rgb(240,240,240)';
var cinzaEscuro = 'rgb(80,80,80)';
var vermelho = 'rgb(255,0,0)';
var azul = 'rgb(0,0,255)';

var lado=34;//tamanho do lado do quadrado em pixels
var borda=2;//tamanho da borda em pixels

var canvasHeight = 308; //altura do canvas
var canvasWidth = 308; //largura do canvas
var mapa;
var terminou;
var toggle;
var bombasFaltando;
var iniciou;

var flgImg = new Image();
flgImg.src = 'flag-red.png';
var mineImg = new Image();
mineImg.src = 'mine.png';


		
function preencheMapa() {
	mapa = new Array(9);
	for (var i=0; i<9;i++) {
		mapa[i] = new Array(9);
		for (var j=0; j<9;j++) {
			mapa[i][j] = new Quadrado(false, false);
		}
	}
	randomBombs(0);
}
function randomBombs(total) {
	var i = Math.floor(Math.random()*9);
	var j = Math.floor(Math.random()*9);
	if (!mapa[i][j].temBomba) {
		mapa[i][j].temBomba = true;
		total++;
		if (total <10) {
			randomBombs(total);
		}
	} else {
		randomBombs(total);
	}
}
function venceu() {
	var retorno = true;
	outerloop:
	for (var i=0; i<9; i++) {
		for (var j=0; j<9; j++) {
			var quadrado = mapa[i][j];
			if (!quadrado.visivel && !quadrado.temBomba) {
				retorno = false;
				break outerloop;
			}
		}
	}
	return retorno;
}
function novo() {
	canvas = $('canvas');
	ctx = canvas.getContext('2d');
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
	ctx.fillStyle = cinza;
	ctx.fillRect(0,0,canvasWidth,canvasHeight);
	for (var i=0; i<9; i++) {
		for (var j=0; j<9; j++) {
			ctx.fillStyle = cinzaClaro;
			pintarQuadrado(i,j);
		}
	}
	preencheMapa();
	terminou = false;
	toggle = false;
	toggleClick();
	bombasFaltando = 10;
	$('bombasFaltando').innerHTML = bombasFaltando;
	tempo = 0;
	$('tempo').innerHTML = tempo;
	iniciou = false;
	clearInterval(refreshIntervalId);
}

var refreshIntervalId;
var tempo;
function incTempo() {
	tempo++;
	$('tempo').innerHTML = tempo;
}
/*escuta o clique do mouse*/
function main(e) {
	if (!iniciou) {
		iniciou = true;
		refreshIntervalId = setInterval(incTempo, 1000);
	}
	if (!terminou) {
		var ponto = posicaoCursor(e);
		var i = Math.floor(ponto.x/lado);
		var j = Math.floor(ponto.y/lado);
		if (toggle) {
			verifica(i,j);
			if (terminou) {
				showBombs();
				alert('LOST! Perdeu playboy!');
				
			}else if(venceu()) {
				alert('WIN! Parabens!');
				terminou = true;
			}
		} else {
			if (!mapa[i][j].visivel){
				setFlag(i,j);
			}
		}
	}
	if (terminou) {
		clearInterval(refreshIntervalId);
	}
}

function showBombs() {
	for (var i=0; i<9;i++) {
		for (var j=0; j<9;j++) {
			var quadrado = mapa[i][j];
			if (quadrado.temBomba && quadrado.marcado) {
				pintarBomba(i,j, true);
			} else if (quadrado.temBomba) {
				pintarBomba(i,j);
			}
		}
	}
}
function verifica(i,j) {
	try {
		if (!mapa[i][j].visivel && !mapa[i][j].marcado) {
			mapa[i][j].visivel = true;
			if (mapa[i][j].temBomba) {
				//ctx.fillStyle = vermelho;
				//pintarQuadrado(i,j);
				pintarBomba(i,j);
				terminou = true;
			} else {
				ctx.fillStyle = cinzaEscuro;
				var numero = bombasAoRedor(i,j);
				pintarQuadrado(i,j, numero);
				if (numero == 0) {
					for (var x=-1; x<=1; x++) {
						for (var y=-1; y<=1; y++) {
							if (x!=0 || y!=0) {
								verifica(i + x,j + y);
							}
						}
					}
				}
			}
		}
	} catch(e) {}
}

function bombasAoRedor(i,j) {
	var bombas = 0;
	for (var x=-1; x<=1; x++) {
		for (var y=-1; y<=1; y++) {
			if (x!=0 || y!=0) {
				if (temBomba(i + x,j + y)) {
					bombas++;
				}
			}
		}
	}
	return bombas;
}
function temBomba(i,j) {
	try {
		if (mapa[i][j] != null) {
			return mapa[i][j].temBomba;
		} else {
			return false;
		}
	} catch(e){	return false;}
}
function setFlag(i,j) {
	if (!mapa[i][j].marcado) {
		ctx.drawImage(flgImg, borda+10+i*lado, borda+9+j*lado);
		bombasFaltando--;
	}else {
		ctx.fillStyle = cinzaClaro;
		pintarQuadrado(i,j);
		bombasFaltando++;
	}
	mapa[i][j].marcado = !mapa[i][j].marcado;
	$('bombasFaltando').innerHTML = bombasFaltando;
}
function pintarQuadrado(i,j, bombasAoRedor) {
	ctx.fillRect(borda+i*lado, borda+j*lado, lado-borda, lado-borda);
	if (bombasAoRedor != null) {
		var cor = 'rgb(255,255,255)';
		if (bombasAoRedor == 1) {
			cor = 'rgb(0,0,255)';
		}else if (bombasAoRedor == 2) {
			cor = 'rgb(0,255,0)';
		}else if (bombasAoRedor == 3) {
			cor = 'rgb(255,0,0)';
		}else if (bombasAoRedor == 4) {
			cor = 'rgb(0,0,127)';
		}else if (bombasAoRedor == 5) {
			cor = 'rgb(0,127,0)';
		}else if (bombasAoRedor == 6) {
			cor = 'rgb(127,0,0)';
		}else if (bombasAoRedor == 7) {
			cor = 'rgb(0,127,127)';
		}else if (bombasAoRedor == 8) {
			cor = 'rgb(127,127,0)';
		}
		
		ctx.fillStyle = cor;
		if (bombasAoRedor>0) {
			ctx.font = "24px Arial";
			ctx.fillText(bombasAoRedor,borda+11+i*lado, borda+25+j*lado);
		} 
	} 
}
function pintarBomba(i,j, flag) {
	var fundo = flag ? azul: vermelho;
	ctx.fillStyle = fundo;
	ctx.fillRect(borda+i*lado, borda+j*lado, lado-borda, lado-borda);
	ctx.drawImage(mineImg, borda+10+i*lado, borda+9+j*lado, 16, 16);
	if (flag) {
		ctx.drawImage(flgImg, borda+10+i*lado, borda+9+j*lado, 16, 16);
	}
}
function toggleClick() {
	toggle = !toggle;
	if (toggle) {
		$('flag').value='Clique aqui para marcar as bombas.';
	} else {
		$('flag').value='Marcando as bombas. Clique aqui para nao marcar.';
	}
}