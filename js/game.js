var audio = new Audio('Media/mario-letsgo.WAV');
var bgsound = new Audio('Media/Theme_music_Game_Tower_Defense.mp3');

//Cette fonction gère le formulaire avant de lancer le jeux et lance une musique
$(function() {	
	$('form').on('submit', function(event) {
		event.preventDefault();
		var TWD = {
		pseudo : $('.pseudo').val(),
		level: $('.level').val(),
	};	
	audio.play();
	bgsound.play();
	bgsound.loop = true;
	Initialiser(TWD.level,TWD.pseudo);	
	$('#fivform').css({
		visibility: 'collapse',
		height: '0px'
	});
	$(".game").fadeIn();
	$(".game-constructor").fadeIn();
	$("body").css('backgroundColor', '#43a40e');	
	});

});

// Fonction jQuery : exécute le jeu une fois que le DOM est chargé
function Initialiser(level,pseudo) {

	/* ---------- ---------- */
	/* ----- SETTINGS ------ */
	/* ---------- ---------- */

	// Objet littéral qui stocke l'argent, les vies et la vitesse du jeu
	var	Player = {
			money: 200,
			life : 5,
			speed: level, // 10 = fast; 50 = normal mode
			time : 5, // time (in sec) before monsters move
			level: 1,
			bestlvl: 5,
			bestPlayer: "Yoann",
			pseudo: pseudo,
		}; 

	/* ---------- ---------- */
	/* ------ PARCOURS ----- */
	/* ---------- ---------- */

	// Objet littéral qui stocke le parcours des monstres
	var	Parcours = {
			start: 200, 
			sizeCourse: 150,
			course: [
				['down' ,200],
				['right' ,300],
				['down' ,280],
				['right' ,500],
				['up' ,200],
				['right' ,400],
				['up' ,100],
			]
		};

	// On appelle la fonction qui crée le parcours (visuel)
	makeCourse(Parcours);

	/* ---------- ---------- */
	/* ------ TOWERS ------- */
	/* ---------- ---------- */

	var towers = [];  // Tableau qui stocke toutes les tours du jeu

	// On affiche les tours que l'on peut créer à l'écran
	displayTowers(Player, towers); 

	// On appelle la fonction qui permet de créer des tours
	makeTowers(towers, Player);

	/* ---------- ---------- */
	/* ----- MONSTERS ------ */
	/* ---------- ---------- */

	var	monsters = []; // Tableau qui stocke tous les monstres du jeu

	// On appelle la fonction qui permet de créer des monstres
	makeMonsters(monsters, Parcours, Player.level, Player.level);

	/* ---------- ---------- */
	/* ------- GAME -------- */
	/* ---------- ---------- */

	// On appelle la fonction qui lance le jeu
	startGame(Player, Parcours, monsters, towers);

	ImgMonster(Player)

}

// ------------------------------------------------------------------------- //
// ----------------------- ALL FUNCTIONS FOR THE GAME ---------------------- //
// ------------------------------------------------------------------------- //

// ----------------------
// --- FUNCTIONS GAME ---
// ----------------------

// Fonction qui déclare les monstres à créer et les stocke dans le tableau des monstres
function makeMonsters(monsters, Parcours, nbmonster, hpMonster) {
	var MonsterToCreate;

	// On crée l'ensemble des monstres que l'on stocke dans un tableau
	for (var i = 0, max = nbmonster; i < max; i++) {
		// On crée un monstre
		MonsterToCreate = new Monster(-100*(i+1), Parcours.start, (hpMonster)*30, 'Pikachu', 20, 'https://cdn0.iconfinder.com/data/icons/Favorite_monsters/256/pink.png');
		monsters.push(MonsterToCreate);
	}
}

// Fonction qui lance le jeu
function startGame(Player, Parcours, monsters, towers) {
	// On affiche les informations du joueur (html)
	$('.infos span.time').text(Player.time);
	$('.infos span.life').text(Player.life);
	$('.infos span.money').text(Player.money);
	$('.infos span.level').text(Player.level);

	// On lance le décompte
	var timer = setInterval(function() {
		$('.infos span.time').text(Player.time); // On change chaque seconde le temps restant
		if (Player.time <= 0) {

			// On arrête le décompte
			clearInterval(timer);

			// On lance le timer pour déplacer les monstres et attaquer
			monsterMove(Player, Parcours, monsters, towers, Player.speed);
		}
		else {
			Player.time--;
		}
	}, 1000);
}

// ----------------------
// -- FUNCTIONS OTHERS --
// ----------------------

// Fonction qui calcule l'hypotenuse
function calcHypotenuse(a, b) {
  return(Math.sqrt((a * a) + (b * b)));
}

// Fonction qui retourne une valeur comprise en % d'un chiffre
function hpPourcent (hp, hpMax) {
	return parseInt(hp * 100 / hpMax);
}




