var c, ctx;
var Pieces = [];
var NumberOfPieces;
var TriangleSide = 100;
var NumberOfColours = 4;
var A,B,C,D,E;
var RenderTX, RenderTY, RenderSc;
var BotCorner={X:0,Y:0};
var inset = 1;
var Timer;
var errors = 0;
var bw=0.5;
var startTime;
var Delta;
var steps = 0;
var GameType;
var Moves = [];
var GameColours = [
"#BFBFBF",
"#3F3F3F",
"#7F7F7F",

"#BF0000",
"#3F0000",
"#7F0000",

"#00BF00",
"#003F00",
"#007F00",

"#0000BF",
"#00003F",
"#00007F",

"#BFBF00",
"#3F3F00",
"#7F7F00",

"#00BFBF",
"#003F3F",
"#007F7F",

"#BF00BF",
"#3F003F",
"#7F007F"];

function Piece(PId) {
    this.Vertexes=[{X:0,Y:0},{X:0,Y:0},{X:0,Y:0}];
	this.Middle={X:0,Y:0};
	this.Id = PId;
	this.Neigh=[-1,-1,-1];
	this.Colours=[0,0,0];
}
function PieceRender(n) {
	
    for(var i = 0; i<3; i++) {
		ctx.beginPath();
		ctx.fillStyle = GameColours[Pieces[n].Colours[(i+2)%3]];
		ctx.moveTo(TXC(Pieces[n].Middle.X),TYC(Pieces[n].Middle.Y));
		ctx.lineTo(TXC(Pieces[n].Vertexes[i].X),TYC(Pieces[n].Vertexes[i].Y));
		ctx.lineTo(TXC(Pieces[n].Vertexes[(i+1)%3].X),TYC(Pieces[n].Vertexes[(i+1)%3].Y));
		ctx.fill();
	}
};
function sqr(x) {
	return x*x;
}
function random(x) {
	return Math.floor(x*Math.random());
}
function isPointInPoly(poly, pt){
	//+ Jonas Raoni Soares Silva
	//@ http://jsfromhell.com/math/is-point-in-poly [rev. #0]
	for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
		((poly[i].Y <= pt.Y && pt.Y < poly[j].Y) || (poly[j].Y <= pt.Y && pt.Y < poly[i].Y))
		&& (pt.X < (poly[j].X - poly[i].X) * (pt.Y - poly[i].Y) / (poly[j].Y - poly[i].Y) + poly[i].X)
		&& (c = !c);
	return c;
}
function GameStop() {
	clearInterval(Timer);
	RenderDeltaT();
	var stats = ReadStats();
	var Now = new Date().getTime();
	var Dt = Now-startTime;
	switch(GameType) {
		case 1:
			stats.Easy.Games++;
			stats.Easy.Playtime+=Dt;
			stats.Easy.Moves+=steps;
			stats.Easy.Speedrun = (stats.Easy.Speedrun==-1 || Dt < stats.Easy.Speedrun) ? Dt : stats.Easy.Speedrun;
			stats.Easy.MinMoves = (stats.Easy.MinMoves==-1 || steps < stats.Easy.MinMoves) ? steps : stats.Easy.MinMoves;
		break;
		case 2:
			stats.Medium.Games++;
			stats.Medium.Playtime+=Dt;
			stats.Medium.Moves+=steps;
			stats.Medium.Speedrun = (stats.Medium.Speedrun==-1 || Dt < stats.Medium.Speedrun) ? Dt : stats.Medium.Speedrun;
			stats.Medium.MinMoves = (stats.Medium.MinMoves==-1 || steps < stats.Medium.MinMoves) ? steps : stats.Medium.MinMoves;
		break;
		case 3:
			stats.Hard.Games++;
			stats.Hard.Playtime+=Dt;
			stats.Hard.Moves+=steps;
			stats.Hard.Speedrun = (stats.Hard.Speedrun==-1 || Dt < stats.Hard.Speedrun) ? Dt : stats.Hard.Speedrun;
			stats.Hard.MinMoves = (stats.Hard.MinMoves==-1 || steps < stats.Hard.MinMoves) ? steps : stats.Hard.MinMoves;
		break;
		case 5:
		case 6:
		$.post(
			"php/movetest.php",
			({Moves: JSON.stringify(Moves), E: E, Player:$("#UserName").val(), Time: Dt}),
			function( data ) {
				if(data != Moves.length) {
					alert("Moves not accepted...");
				}
			}
		);
		break;
	}
	SaveStats(stats);
	GameType = 0;
	
	
	$("#GameBlocker").css("visibility", "inherit");
	$("#GameGuiUndo").css("visibility", "hidden");
}
function GamePause() {
	clearInterval(Timer);
	RenderDeltaT();
	Delta = new Date().getTime() - startTime;
	Menu();
}
function GameResume() {
	startTime = new Date().getTime() - Delta;
	Timer = setInterval(RenderDeltaT, 30);
}
function GameInit(aa,bb,cc,dd,t) {
	$("#GameBlocker").css("visibility", "hidden");
	$("#GameGuiUndo").css("visibility", "inherit");
	if(errors == 0 || (GameType != t)) {
		c = document.getElementById("GameCanvas");
		ctx = c.getContext("2d");
		GameType = t;
		NumberOfPieces = 0;
		Pieces.length = 0;
		MainResize();
		if(1<=GameType&&GameType<=4) {
			A=aa;
			B=bb;
			C=cc;
			D=dd;
			GeneratePieces();
			startTime = new Date().getTime();
			Timer = setInterval(RenderDeltaT, 30);
			MainResize();
		}
		if(GameType==5) {//DC
			LoadPieces();
		}
		if(GameType==6) {//WC
			LoadPieces();
		}
		c.addEventListener("click", CanvasClick, true);
		window.addEventListener("resize", MainResize);
		document.getElementById("GameGuiStepCounter").innerText = steps;
		
	}
	else {
		GameResume();		
	}
}
function GameUndo() {
	if(Moves.length>0) {
		steps-=2;
		Flip(Moves[Moves.length-1].P,Moves[Moves.length-1].S);
		Moves.length-=2;
		MainRender();
	}
}
function TimeToText(Delta) {
	if(Delta == -1) {
		return "-";
	} else {
		return ("0" + Math.floor(Delta / 3600000)).slice(-1) + ":" + ("00" + Math.floor(Delta / 60000) % 60).slice(-2) + ":" + ("00" + Math.floor(Delta / 1000) % 60).slice(-2);
	}
}
function RenderDeltaT() {
	var Now = new Date().getTime();
	Delta = Now-startTime;
	document.getElementById("GameGuiTime").innerText = TimeToText(Delta);
}
function InPiece(Triangle,pX,pY) {
	return isPointInPoly([Pieces[Triangle].Vertexes[0],Pieces[Triangle].Vertexes[1],Pieces[Triangle].Vertexes[2],Pieces[Triangle].Vertexes[0]], {X:pX, Y:pY});
}
function InWhichPiece(X,Y) {
	var result=0;
	while ((result<NumberOfPieces) && !InPiece(result,X,Y)) {
		result++;
	}
	if (result==NumberOfPieces) {
		result=-1;
	}
	return result;
}
function InWhichSection(Triangle,X,Y) {
    var CurrentDistanceSquare;
	var MaxDistanceSquare=-1;
	var result=0;
	for (var i=0; i<=2; i++) {
		CurrentDistanceSquare=sqr(Pieces[Triangle].Vertexes[i].X-X)+sqr(Pieces[Triangle].Vertexes[i].Y-Y);
		if (CurrentDistanceSquare>MaxDistanceSquare) {
			result=i;
			MaxDistanceSquare=CurrentDistanceSquare;
		}
	}
	return result;
}
function GeneratePieces() {
	/*var Ia,Ib,Ic,Ir,It,Iv,Ipt,Ipv;
	var NetLeftRight,NetUp;
	var HexaMiddle = {X:0.0,Y:0.0};
	var TriangleMiddle = {X:0.0,Y:0.0};
	var NeighbourTriangle;
	
	NumberOfPieces=2*(A*B+B*C+C*A);
	NumberOfGeneratedPieces=0;
	Pieces.length = NumberOfPieces;
	BotCorner.X=-Math.sqrt(3)/4*(C-A)*TriangleSide;
	BotCorner.Y=+TriangleSide*(A/4+C/4+B/2);
	
	for (Ic=0; Ic < C; Ic++) {
		for (Ia=0; Ia < A; Ia++) {
			for (Ib=0; Ib < B; Ib++) {
				NetLeftRight=Ic-Ia;
				NetUp=Ib+Math.min(Ia,Ic);
				HexaMiddle.X=TriangleSide*NetLeftRight*Math.sqrt(3)/2-Math.sqrt(3)/4*(C-A)*TriangleSide;
				HexaMiddle.Y=-TriangleSide*(NetUp+Math.abs(NetLeftRight)/2)+TriangleSide*(A/4+C/4+B/2-1);
				for (Ir=0; Ir<=5; Ir++) {
					TriangleMiddle.X=Math.round(HexaMiddle.X+TriangleSide*Math.cos(Ir/3*Math.PI)/Math.sqrt(3));
					TriangleMiddle.Y=Math.round(HexaMiddle.Y+TriangleSide*Math.sin(Ir/3*Math.PI)/Math.sqrt(3));
					
					It=0;
					while ((It<NumberOfGeneratedPieces) && ((Pieces[It].Middle.X!=TriangleMiddle.X) || (Pieces[It].Middle.Y!=TriangleMiddle.Y))) {
						It++;
					}
					if (It==NumberOfGeneratedPieces) { // new triangle
						NumberOfGeneratedPieces++;
						
						Pieces[It] = new Piece(It);
						Pieces[It].Middle.X=TriangleMiddle.X;
						Pieces[It].Middle.Y=TriangleMiddle.Y;
						Pieces[It].Direction=Math.PI+Ir/3*Math.PI;
						for (Iv=0; Iv <= 2; Iv++) {
							Pieces[It].Vertexes[Iv].X=Pieces[It].Middle.X+(TriangleSide*inset/Math.sqrt(3)*Math.cos(Pieces[It].Direction+Iv*2/3*Math.PI));
							Pieces[It].Vertexes[Iv].Y=Pieces[It].Middle.Y+(TriangleSide*inset/Math.sqrt(3)*Math.sin(Pieces[It].Direction+Iv*2/3*Math.PI));
							Pieces[It].Colours[Iv]=(Iv-Ir+10) % 3;
						}
					}
				}
			}
		}
	}
    for (It=0; It < NumberOfPieces; It++) {
        for (Iv=0; Iv<=2; Iv++) {
			NeighbourTriangle=InWhichPiece(2*Pieces[It].Middle.X-Pieces[It].Vertexes[Iv].X,2*Pieces[It].Middle.Y-Pieces[It].Vertexes[Iv].Y);
			if (NeighbourTriangle==-1) {// border
				//Pieces[It].Neigh[Iv] = -1;
				switch (Pieces[It].Colours[Iv]) {
					case 0:
						Pieces[It].Colours[Iv]="#7f7f7f";
						Pieces[It].Neigh[Iv].Id = -1;
						break;
					case 1:
						Pieces[It].Colours[Iv]="#3f3f3f";
						Pieces[It].Neigh[Iv].Id = -2;
						break;
					case 2:
						Pieces[It].Colours[Iv]="#bfbfbf";
						Pieces[It].Neigh[Iv].Id = -3;
						break;
				}
			}
			else {
			    // non-border
				if (Pieces[NeighbourTriangle].Colours[InWhichSection(NeighbourTriangle,Pieces[It].Middle.X,Pieces[It].Middle.Y)]<10) {// neighbour has no colour yet
					switch(random(NumberOfColours)*3+Pieces[It].Colours[Iv]) {
						case 0:
							Pieces[It].Colours[Iv]="#ff0000";
							break;
						case 1:
							Pieces[It].Colours[Iv]="#7f0000";
							break;
						case 2:
							Pieces[It].Colours[Iv]="#ff7f7f";
							break;
						case 3:
							Pieces[It].Colours[Iv]="#00ff00";
							break;
						case 4:
							Pieces[It].Colours[Iv]="#007f00";
							break;
						case 5:
							Pieces[It].Colours[Iv]="#7fff7f";
							break;
						case 6:
							Pieces[It].Colours[Iv]="#0000ff";
							break;
						case 7:
							Pieces[It].Colours[Iv]="#00007f";
							break;
						case 8:
							Pieces[It].Colours[Iv]="#7f7fff";
							break;
						case 9:
							Pieces[It].Colours[Iv]="#00ffff";
							break;
						case 10:
							Pieces[It].Colours[Iv]="#007f7f";
							break;
						case 11:
							Pieces[It].Colours[Iv]="#7fffff";
							break;
					}
				}
				else {// neighbour has a colour
					Pieces[It].Colours[Iv]=Pieces[NeighbourTriangle].Colours[InWhichSection(NeighbourTriangle,Pieces[It].Middle.X,Pieces[It].Middle.Y)];
					Pieces[It].Neigh[Iv].Id = NeighbourTriangle;
					Pieces[It].Neigh[Iv].S = InWhichSection(NeighbourTriangle,Pieces[It].Middle.X,Pieces[It].Middle.Y);
					Pieces[NeighbourTriangle].Neigh[InWhichSection(NeighbourTriangle,Pieces[It].Middle.X,Pieces[It].Middle.Y)].Id = It;
					Pieces[NeighbourTriangle].Neigh[InWhichSection(NeighbourTriangle,Pieces[It].Middle.X,Pieces[It].Middle.Y)].S = Iv;
				}
			} // non-border
        }
	}*/
	var Ia,Ic,Ir;
	NumberOfPieces = 2*(A*B+B*C+C*A);
	Pieces.length = NumberOfPieces;
	BotCorner.X=-Math.sqrt(3)/4*(C-A)*TriangleSide;
	BotCorner.Y=+TriangleSide*(A/4+C/4+B/2);
					
				
	Ir = 0;
	for(Ia = 0; Ia < A+B; Ia++) {
		for(Ic = 0; Ic < C+B; Ic++) {
			if(-C<Ia+1-Ic && Ia+1-Ic<=A) {
				Pieces[Ir] = new Piece(Ir);
				Pieces[Ir].Vertexes[(Ia+Ic)%3].X=(Ia-Ic)*TriangleSide*Math.sqrt(3)/2-Math.sqrt(3)/4*(C-A)*TriangleSide;;
				Pieces[Ir].Vertexes[(Ia+Ic)%3].Y=-(Ia+Ic)*TriangleSide/2+TriangleSide*(A/4+C/4+B/2);;
				Pieces[Ir].Neigh[(Ia+Ic)%3]=-4;
				Pieces[Ir].Vertexes[(Ia+1+Ic)%3].X=(Ia+1-Ic)*TriangleSide*Math.sqrt(3)/2-Math.sqrt(3)/4*(C-A)*TriangleSide;;
				Pieces[Ir].Vertexes[(Ia+1+Ic)%3].Y=-(Ia+1+Ic)*TriangleSide/2+TriangleSide*(A/4+C/4+B/2);;
				Pieces[Ir].Neigh[(Ia+1+Ic)%3]=-3;
				Pieces[Ir].Vertexes[(Ia+1+Ic+1)%3].X=(Ia+1-Ic-1)*TriangleSide*Math.sqrt(3)/2-Math.sqrt(3)/4*(C-A)*TriangleSide;;
				Pieces[Ir].Vertexes[(Ia+1+Ic+1)%3].Y=-(Ia+1+Ic+1)*TriangleSide/2+TriangleSide*(A/4+C/4+B/2);;
				Pieces[Ir].Neigh[(Ia+1+Ic+1)%3]=-2;
				Pieces[Ir].Middle.X = (Pieces[Ir].Vertexes[0].X+Pieces[Ir].Vertexes[1].X+Pieces[Ir].Vertexes[2].X)/3;
				Pieces[Ir].Middle.Y = (Pieces[Ir].Vertexes[0].Y+Pieces[Ir].Vertexes[1].Y+Pieces[Ir].Vertexes[2].Y)/3;
				Ir++;
			}
			if(-A<Ic+1-Ia && Ic+1-Ia<=C) {
				Pieces[Ir] = new Piece(Ir);
				Pieces[Ir].Vertexes[(Ia+Ic)%3].X=(Ia-Ic)*TriangleSide*Math.sqrt(3)/2-Math.sqrt(3)/4*(C-A)*TriangleSide;;
				Pieces[Ir].Vertexes[(Ia+Ic)%3].Y=-(Ia+Ic)*TriangleSide/2+TriangleSide*(A/4+C/4+B/2);;
				Pieces[Ir].Neigh[(Ia+Ic)%3]=-2;
				Pieces[Ir].Vertexes[(Ia+Ic+1)%3].X=(Ia-Ic-1)*TriangleSide*Math.sqrt(3)/2-Math.sqrt(3)/4*(C-A)*TriangleSide;;
				Pieces[Ir].Vertexes[(Ia+Ic+1)%3].Y=-(Ia+Ic+1)*TriangleSide/2+TriangleSide*(A/4+C/4+B/2);;
				Pieces[Ir].Neigh[(Ia+Ic+1)%3]=-3;
				Pieces[Ir].Vertexes[(Ia+1+Ic+1)%3].X=(Ia+1-Ic-1)*TriangleSide*Math.sqrt(3)/2-Math.sqrt(3)/4*(C-A)*TriangleSide;;
				Pieces[Ir].Vertexes[(Ia+1+Ic+1)%3].Y=-(Ia+1+Ic+1)*TriangleSide/2+TriangleSide*(A/4+C/4+B/2);;
				Pieces[Ir].Neigh[(Ia+1+Ic+1)%3]=-4;
				Pieces[Ir].Middle.X = (Pieces[Ir].Vertexes[0].X+Pieces[Ir].Vertexes[1].X+Pieces[Ir].Vertexes[2].X)/3;
				Pieces[Ir].Middle.Y = (Pieces[Ir].Vertexes[0].Y+Pieces[Ir].Vertexes[1].Y+Pieces[Ir].Vertexes[2].Y)/3;
				Ir++;
			}
		}
	}
	for (Ir=0;Ir<NumberOfPieces;Ir++) {
		var P;
		P = InWhichPiece(2*Pieces[Ir].Middle.X-Pieces[Ir].Vertexes[0].X,2*Pieces[Ir].Middle.Y-Pieces[Ir].Vertexes[0].Y);
		if(P!=-1) {
			Pieces[Ir].Colours[0]=Pieces[Ir].Neigh[0];
			Pieces[Ir].Neigh[0]=P;
		} else {
			Pieces[Ir].Colours[0]=-2-Pieces[Ir].Neigh[0];
		}
		
		P = InWhichPiece(2*Pieces[Ir].Middle.X-Pieces[Ir].Vertexes[1].X,2*Pieces[Ir].Middle.Y-Pieces[Ir].Vertexes[1].Y);
		if(P!=-1) {
			Pieces[Ir].Colours[1]=Pieces[Ir].Neigh[1];
			Pieces[Ir].Neigh[1]=P;
		} else {
			Pieces[Ir].Colours[1]=-2-Pieces[Ir].Neigh[1];
		}
		P = InWhichPiece(2*Pieces[Ir].Middle.X-Pieces[Ir].Vertexes[2].X,2*Pieces[Ir].Middle.Y-Pieces[Ir].Vertexes[2].Y);
		if(P!=-1) {
			Pieces[Ir].Colours[2]=Pieces[Ir].Neigh[2];
			Pieces[Ir].Neigh[2]=P;
		} else {
			Pieces[Ir].Colours[2]=-2-Pieces[Ir].Neigh[2];
		}
	}
	for (Ir=0; Ir<NumberOfPieces; Ir++) {
		for(var Ir2=0; Ir2<3; Ir2++) {
			if(Ir < Pieces[Ir].Neigh[Ir2]) {
				Pieces[Ir].Colours[Ir2]=Pieces[Pieces[Ir].Neigh[Ir2]].Colours[Ir2]=3+3*random(D)+(-2-Pieces[Ir].Colours[Ir2]);
			}
		}
	}
	errors = 0;
	for(var i = 0; i < (A*B+B*C+C*A)*20; i++) {
		Flip(random(NumberOfPieces),random(3));
	}
	if(errors == 0) {
		GameStop();
	}
	steps = 0;
	Moves.length = 0;
}
function LoadPieces() {
	var GameTypeS = "Error";
	if(GameType == 5) {
		GameTypeS = "DailyChallange";
	}
	if(GameType == 6) {
		GameTypeS = "WeeklyChallange";
	}
	$.post(
		"php/board.php",
		{ type: GameTypeS},
		function( data ) {
			var BoardObj = JSON.parse(data);
			Pieces = BoardObj.Board.Board;
			errors = BoardObj.Board.Errors;
			A=BoardObj.A;
			B=BoardObj.B;
			C=BoardObj.C;
			D=BoardObj.D;
			E=BoardObj.E;
			NumberOfPieces = Pieces.length;
			Moves.length = 0;
			BotCorner.X=-Math.sqrt(3)/4*(C-A)*TriangleSide;
			BotCorner.Y=+TriangleSide*(A/4+C/4+B/2);
			startTime = new Date().getTime();
			Timer = setInterval(RenderDeltaT, 30);
			MainResize();
		}
	);
	
}
function SavePieces() {
	alert(JSON.stringify({Board:Pieces,A:A,B:B,C:C,D:D}));
}
function vw( val ) {
	var w=$(window).width()/100;
    return  w*val+'px';
}
function vh( val ) {
	var h=$(window).height()/100;
    return  h*val+'px';
}
function vmax( val ) {
	var w=$(window).width()/100;
	var h=$(window).height()/100;
    return  Math.max(h,w)*val+'px';
}
function vmin( val ) {
	var w=$(window).width()/100;
	var h=$(window).height()/100;
    return  Math.min(h,w)*val+'px';
}
function MainResize(){
    c.width = c.clientWidth;
    c.height = c.clientHeight;
    MainRender();
    $(".GameGui").css("fontSize", vw(4));
}
function IsSame(Piece, Segment) {
	if(Pieces[Piece].Neigh[Segment] >= 0) {
		return (Pieces[Piece].Colours[Segment])==(Pieces[Pieces[Piece].Neigh[Segment]].Colours[Segment]);
	} else {
		switch (Pieces[Piece].Neigh[Segment]) {
			case -2:
				return Pieces[Piece].Colours[Segment] == 0;
			break;
			case -3:
				return Pieces[Piece].Colours[Segment] == 1;
			break;
			case -4:
				return Pieces[Piece].Colours[Segment] == 2;
			break;
			default:
			alert(Pieces[Piece].Neigh[Segment]);
			break;
		}
	}
	return 1;
}
function Flip(Piece,Segment) {
	if(Piece >= 0 && Pieces[Piece].Neigh[Segment] >= 0) {
		steps++;
		document.getElementById("GameGuiStepCounter").innerText = steps;
		var OPiece = Pieces[Piece].Neigh[Segment];
		var delta = 0;
		delta += IsSame(Piece,0);
		delta += IsSame(Piece,1);
		delta += IsSame(Piece,2);
		delta += IsSame(OPiece,0);
		delta += IsSame(OPiece,1);
		delta += IsSame(OPiece,2);
		var offset;
		var test;
		
		offset = 0;
		test = Pieces[Piece].Colours[(Segment+offset)%3];
		Pieces[Piece].Colours[(Segment+offset)%3] = Pieces[OPiece].Colours[(Segment+offset)%3];
		Pieces[OPiece].Colours[(Segment+offset)%3] = test;
		
		offset = 1;
		test = Pieces[Piece].Colours[(Segment+offset)%3];
		Pieces[Piece].Colours[(Segment+offset)%3] = Pieces[OPiece].Colours[(Segment+offset)%3];
		Pieces[OPiece].Colours[(Segment+offset)%3] = test;
		
		offset = 2;
		test = Pieces[Piece].Colours[(Segment+offset)%3];
		Pieces[Piece].Colours[(Segment+offset)%3] = Pieces[OPiece].Colours[(Segment+offset)%3];
		Pieces[OPiece].Colours[(Segment+offset)%3] = test;
		
		delta -= IsSame(Piece,0);
		delta -= IsSame(Piece,1);
		delta -= IsSame(Piece,2);
		delta -= IsSame(OPiece,0);
		delta -= IsSame(OPiece,1);
		delta -= IsSame(OPiece,2);
		errors += delta;
		Moves.push({P:Piece,S:Segment});
		document.getElementById("GameGuiErrorCounter").innerText = errors;
		
	}
}
function CanvasClick(e) {
	var ClickX = (e.offsetX-RenderTX)/RenderSc;
	var ClickY = (e.offsetY-RenderTY)/RenderSc;
	var Piece = InWhichPiece(ClickX,ClickY);
	if(Piece != -1) {
		var Segment = InWhichSection(Piece, ClickX,ClickY);
		Flip(Piece, Segment);
		if(errors == 0) {
			GameStop();
		}
	}
	MainRender();
}
function DecCord(NW,NE,N) {
	return {X:TXC((NE-NW)*Math.sqrt(3)/2*TriangleSide+BotCorner.X),Y:TYC((-NE/2-NW/2-N)*TriangleSide+BotCorner.Y)};
}
function TXC(x) {
	return RenderTX+RenderSc*x;
}
function TYC(y) {
	return RenderTY+RenderSc*y;
}
function MainRender() {
	document.getElementById("GameGuiErrorCounter").innerText = errors;
	ctx.clearRect(0, 0, c.width, c.height);
	RenderTX=c.width/2;
	RenderTY=c.height/2;
	RenderSc=Math.min(c.width/(A+C+1)/Math.sqrt(3)*2/TriangleSide,c.height/(A/2+B+C/2+1)/TriangleSide);
	for(var i = 0; i < Pieces.length;i++) {
		PieceRender(i);
	}
	var Pos;
	ctx.beginPath();
	Pos = DecCord(0,0,0);
	ctx.moveTo(Pos.X,Pos.Y);
	Pos = DecCord(0,0,-bw);
	ctx.lineTo(Pos.X,Pos.Y);
	Pos = DecCord(A+bw,0,-bw);
	ctx.lineTo(Pos.X,Pos.Y);
	Pos = DecCord(A,0,0);
	ctx.lineTo(Pos.X,Pos.Y);
	ctx.fillStyle = GameColours[2];
	ctx.fill();
	
	ctx.beginPath();
	Pos = DecCord(A,0,0);
	ctx.moveTo(Pos.X,Pos.Y);
	Pos = DecCord(A+bw,0,-bw);
	ctx.lineTo(Pos.X,Pos.Y);
	Pos = DecCord(A+bw,0,B);
	ctx.lineTo(Pos.X,Pos.Y);
	Pos = DecCord(A,0,B);
	ctx.lineTo(Pos.X,Pos.Y);
	ctx.fillStyle = GameColours[1];
	ctx.fill();
		
	ctx.beginPath();
	Pos = DecCord(A,0,B);
	ctx.moveTo(Pos.X,Pos.Y);
	Pos = DecCord(A+bw,0,B);
	ctx.lineTo(Pos.X,Pos.Y);
	Pos = DecCord(A+bw,C+bw,B);
	ctx.lineTo(Pos.X,Pos.Y);
	Pos = DecCord(A,C,B);
	ctx.lineTo(Pos.X,Pos.Y);
	ctx.fillStyle = GameColours[0];
	ctx.fill();
	
	ctx.beginPath();
	Pos = DecCord(A,C,B);
	ctx.moveTo(Pos.X,Pos.Y);
	Pos = DecCord(A+bw,C+bw,B);
	ctx.lineTo(Pos.X,Pos.Y);
	Pos = DecCord(0,C+bw,B);
	ctx.lineTo(Pos.X,Pos.Y);
	Pos = DecCord(0,C,B);
	ctx.lineTo(Pos.X,Pos.Y);
	ctx.fillStyle = GameColours[2];
	ctx.fill();
	
	ctx.beginPath();
	Pos = DecCord(0,C,B);
	ctx.moveTo(Pos.X,Pos.Y);
	Pos = DecCord(0,C+bw,B);
	ctx.lineTo(Pos.X,Pos.Y);
	Pos = DecCord(0,C+bw,-bw);
	ctx.lineTo(Pos.X,Pos.Y);
	Pos = DecCord(0,C,0);
	ctx.lineTo(Pos.X,Pos.Y);
	ctx.fillStyle = GameColours[1];
	ctx.fill();
		
	ctx.beginPath();
	Pos = DecCord(0,C,0);
	ctx.moveTo(Pos.X,Pos.Y);
	Pos = DecCord(0,C+bw,-bw);
	ctx.lineTo(Pos.X,Pos.Y);
	Pos = DecCord(0,0,-bw);
	ctx.lineTo(Pos.X,Pos.Y);
	Pos = DecCord(0,0,0);
	ctx.lineTo(Pos.X,Pos.Y);
	ctx.fillStyle = GameColours[0];
	ctx.fill();
}