function MainInit() {
	
}
function ReadStats() {
	var Stats = $.cookie("FlipStats");
	var StatsJSON;
	if(Stats) {
		StatsJSON = JSON.parse(Stats);
	} else {
		StatsJSON = {};
	}
	StatsJSON.Easy = StatsJSON.Easy || {Games:0,Playtime:0,Moves:0,Speedrun:-1,MinMoves:-1};
	StatsJSON.Medium = StatsJSON.Medium || {Games:0,Playtime:0,Moves:0,Speedrun:-1,MinMoves:-1};
	StatsJSON.Hard = StatsJSON.Hard || {Games:0,Playtime:0,Moves:0,Speedrun:-1,MinMoves:-1};
	return StatsJSON;
}
function SaveStats(Stats) {
	$.cookie("FlipStats",JSON.stringify(Stats),{expires:1000});
}
function StartGame(aa,bb,cc,dd,t) {
	$("#Game").removeClass("hidden");
	$("#Menu").addClass("hidden");
	$("#Menubar").removeClass("hidden");
	GameInit(aa,bb,cc,dd,t);
}
function StartStatistics() {
	$("#Statistics").removeClass("hidden");
	$("#Menu").addClass("hidden");
	$("#Menubar").removeClass("hidden");
	var StatsJSON = ReadStats();
	$('#StatisticsTable tr').eq(1).find('td').eq(1).text(StatsJSON.Easy.Games);
	$('#StatisticsTable tr').eq(1).find('td').eq(2).text(StatsJSON.Medium.Games);
	$('#StatisticsTable tr').eq(1).find('td').eq(3).text(StatsJSON.Hard.Games);
	$('#StatisticsTable tr').eq(2).find('td').eq(1).text(TimeToText(StatsJSON.Easy.Playtime));
	$('#StatisticsTable tr').eq(2).find('td').eq(2).text(TimeToText(StatsJSON.Medium.Playtime));
	$('#StatisticsTable tr').eq(2).find('td').eq(3).text(TimeToText(StatsJSON.Hard.Playtime));
	$('#StatisticsTable tr').eq(3).find('td').eq(1).text(StatsJSON.Easy.Moves);
	$('#StatisticsTable tr').eq(3).find('td').eq(2).text(StatsJSON.Medium.Moves);
	$('#StatisticsTable tr').eq(3).find('td').eq(3).text(StatsJSON.Hard.Moves);
	$('#StatisticsTable tr').eq(4).find('td').eq(1).text(TimeToText(StatsJSON.Easy.Speedrun));
	$('#StatisticsTable tr').eq(4).find('td').eq(2).text(TimeToText(StatsJSON.Medium.Speedrun));
	$('#StatisticsTable tr').eq(4).find('td').eq(3).text(TimeToText(StatsJSON.Hard.Speedrun));
	$('#StatisticsTable tr').eq(5).find('td').eq(1).text((StatsJSON.Easy.MinMoves==-1) ? "-" : StatsJSON.Easy.MinMoves);
	$('#StatisticsTable tr').eq(5).find('td').eq(2).text((StatsJSON.Medium.MinMoves==-1) ? "-" : StatsJSON.Medium.MinMoves);
	$('#StatisticsTable tr').eq(5).find('td').eq(3).text((StatsJSON.Hard.MinMoves==-1) ? "-" : StatsJSON.Hard.MinMoves);
	
}
function StartAchivements() {
	$("#Achivements").removeClass("hidden");
	$("#Menu").addClass("hidden");
	$("#Menubar").removeClass("hidden");
}
function StartHighScores() {
	$("#HighScores").removeClass("hidden");
	$("#Menu").addClass("hidden");
	$("#Menubar").removeClass("hidden");
	$("#HighscoreTable1").html('<tr><td>Loading...</td></tr>');
	$.post(
			"php/highscore.php",
			({type: "Daily"}),
			function( data ) {
				var HS = JSON.parse(data);
				$("#HighscoreTable1").html('<tr><td>Player</td><td>Moves</td><td>Time</td><td>Date</td></tr>');
				for(var i=0;i<HS.length;i++) {
					$("#HighscoreTable1").append('<tr><td></td><td></td><td></td><td></td></tr>');
					$('#HighscoreTable1 tr:last').find('td').eq(0).text(HS[i].Player);
					$('#HighscoreTable1 tr:last').find('td').eq(1).text(HS[i].Moves);
					$('#HighscoreTable1 tr:last').find('td').eq(2).text(TimeToText(HS[i].Time));
					$('#HighscoreTable1 tr:last').find('td').eq(3).text(HS[i].Date);
				}
			}
		);
	
}
function StartFriends() {
	$("#Friends").removeClass("hidden");
	$("#Menu").addClass("hidden");
	$("#Menubar").removeClass("hidden");
	$("#HighscoreTable2").html('<tr><td>Loading...</td></tr>');
	$.post(
			"php/highscore.php",
			({type: "Weekly"}),
			function( data ) {
				var HS = JSON.parse(data);
				$("#HighscoreTable2").html('<tr><td>Player</td><td>Moves</td><td>Time</td><td>Date</td></tr>');
				for(var i=0;i<HS.length;i++) {
					$("#HighscoreTable2").append('<tr><td></td><td></td><td></td><td></td></tr>');
					$('#HighscoreTable2 tr:last').find('td').eq(0).text(HS[i].Player);
					$('#HighscoreTable2 tr:last').find('td').eq(1).text(HS[i].Moves);
					$('#HighscoreTable2 tr:last').find('td').eq(2).text(TimeToText(HS[i].Time));
					$('#HighscoreTable2 tr:last').find('td').eq(3).text(HS[i].Date);
				}
			}
		);
}
function StartSettings() {
	$("#Settings").removeClass("hidden");
	$("#Menu").addClass("hidden");
	$("#Menubar").removeClass("hidden");
}
function StartHelp() {
	$("#Help").removeClass("hidden");
	$("#Menu").addClass("hidden");
	$("#Menubar").removeClass("hidden");
}
function Menu() {
	document.getElementById("Menu-1").innerHTML = "<span>Easy</span>";
	document.getElementById("Menu-2").innerHTML = "<span>Medium</span>";
	document.getElementById("Menu-3").innerHTML = "<span>Hard</span>";
	document.getElementById("Menu-4").innerHTML = "<span>Custom</span>";
	document.getElementById("Menu-5").innerHTML = "<span>Daily chalange</span>";
	document.getElementById("Menu-6").innerHTML = "<span>Weekly challange</span>";

	switch(GameType) {
		case 1:
			document.getElementById("Menu-1").innerHTML = "<span>Countinue</span>";
		break;
		case 2:
			document.getElementById("Menu-2").innerHTML = "<span>Countinue</span>";
		break;
		case 3:
			document.getElementById("Menu-3").innerHTML = "<span>Countinue</span>";
		break;
		case 4:
			document.getElementById("Menu-4").innerHTML = "<span>Countinue</span>";
		break;
		case 5:
			document.getElementById("Menu-5").innerHTML = "<span>Countinue</span>";
		break;
		case 6:
			document.getElementById("Menu-6").innerHTML = "<span>Countinue</span>";
		break;
	}
	$("#Game").addClass("hidden");
	$("#Statistics").addClass("hidden");
	$("#Achivements").addClass("hidden");
	$("#HighScores").addClass("hidden");
	$("#Friends").addClass("hidden");
	$("#Settings").addClass("hidden");
	$("#Help").addClass("hidden");
	$("#Menu").removeClass("hidden");
	//$("#Menubar").addClass("hidden");
}
