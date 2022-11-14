// ----------------------
// - FUNCTIONS MONSTERS -
// ----------------------

// Fonction qui permet aux tours d'attaquer les monstres 
function monsterHitByTower(Tower,monsters,Player) {

	SpeedMonster(Monster);

	// SI le monstre est toujours à distance :
	if ( (Tower.minTop < Tower.monsterTarget.top) && (Tower.monsterTarget.top < Tower.maxTop) && (Tower.minLeft < Tower.monsterTarget.left) && (Tower.monsterTarget.left < Tower.maxLeft) && Tower.monsterTarget.hp > 0) {
		
		// On retire des HP au monstre cible
		Tower.monsterTarget.hp -= 1*Tower.damage;

		if (Tower.type == 'Ice') {
			Tower.monsterTarget.status = 'slow';
		}
		SpeedMonster(Tower.monsterTarget);

		// On change l'affichage de la barre de HP du monstre
		$(Tower.monsterTarget.DOM).find('div.progress-bar').text(parseInt(Tower.monsterTarget.hp));
		$(Tower.monsterTarget.DOM).find('div.progress-bar').css('width',hpPourcent(Tower.monsterTarget.hp, Tower.monsterTarget.hpMax) + '%');
		$(Tower.monsterTarget.DOM).find('div.progress-bar').attr('aria-valuenow',Tower.monsterTarget.hp);

		// Si le monstre n'a plus de hp
		if (Tower.monsterTarget.hp <= 1){

			// On supprime le monstre du jeu (html)
			$(Tower.monsterTarget.DOM).fadeOut('slow',function(){
				$(this).remove();
			});

			// On supprime le montre du tableau des monstres
			for (var i = 0; i < monsters.length; i++) {
			    if (monsters[i] == Tower.monsterTarget) {
			        monsters.splice(i,1);
			    }
			}

			// On fait gagner de l'argent au joueur
			Player.money += 20;
			$('.infos span.money').text(Player.money);

			// On retire la cible de la tour
			Tower.monsterTarget = null;

			// On réactualise l'affichage des tours à créer
			displayTowers(Player);
		}
	}
	// SINON, on retire la target de la tour
	else {
		Tower.monsterTarget = null;
	}	
}

// Fonction qui définit pour chaque tour le monstre le plus proche
function monsterClosetToTheTower(Tower, monsters){
	var hypo,
		distX   = 0,
		distY   = 0,
		distMin = 10000;
		
	// Pour chaque monstre
	for (var i = 0, c = monsters.length; i < c; i++) {

		// SI la tour peut attaquer (elle a fini d'être construite) ET que le montre est à distance de tir
		if ( (Tower.canAttack == true) && (Tower.minTop < monsters[i].top) && (monsters[i].top < Tower.maxTop) && (Tower.minLeft < monsters[i].left) && (monsters[i].left < Tower.maxLeft) ) {
			distX = Math.abs(monsters[i].left - Tower.left);
			distY = Math.abs(monsters[i].top - Tower.top);
			hypo  = calcHypotenuse(distX, distY); // On calcule la distance entre le monstre et la tour

			// Si la distance est inférieur on définit la nouvelle cible
			if (hypo < distMin) {
				distMin = hypo;
				Tower.monsterTarget = monsters[i];
			}
		}
	}
}

// Fonction qui détermine la vitesse du monstre
function SpeedMonster(Monster){

	//On réduit la vitesse des monstres
	if (Monster.status === 'slow') {
		Monster.speed *= 0.9955;

		//Permet de déterminer le temps de gele
		var freeze = setTimeout(function(){
			Monster.status = 'normal';
			Monster.speed = Monster.startspeed;
		},1250);
	}
}

// Fonction qui déplace les monstres et permet aux tours d'attaquer
function monsterMove(Player, Parcours, monsters, towers, speed) {
	var monsterMove = setInterval(function(){

		course(Parcours, monsters, Player, towers);

		// On lance les vérifications pour attaquer ou non les monstres
		for (var i = 0; i < towers.length; i++) {

			// Si la tour a une cible :
			if (towers[i].monsterTarget !== null) {
				
				// La tour attaque le monstre le plus proche
				monsterHitByTower(towers[i],monsters,Player);
			}
			// Sinon, elle recherche la cible la plus proche
			else {
				monsterClosetToTheTower(towers[i],monsters)	
			}			
		}

		// Si il n'y a plus de monstres, on arrête le jeu et on vérifie si il est possible de passer à la vague suivante
		if (monsters.length == 0) {
			clearInterval(monsterMove);

			/*if (Parcours.course[monsters[i].cStep]) {
			}else {
				startGame(Player, Parcours, monsters, towers);
			}*/

			// On augmente le niveau du joueur de 1
			Player.level++;
			$('.infos span.level').fadeOut('slow', function() {
				$(this).text(Player.level);
			}).fadeIn();

			Player.time = 5;
				if (Player.level > 0) {

					makeMonsters(monsters, Parcours, Player.level, Player.level);
					ImgMonster(Player);
					}

			//Condition applicable en fonction du nombre de vie du joueur
			if (Player.life<=0) {
				//On appel la fonction qui afficher les résultat
				bestScore(Player);
				//On ouvre la boite de dialogue puisque le joueur à perdu
				$('#staticBackdrop').modal('show');
			}else {
				startGame(Player, Parcours, monsters, towers);
			}
			
		}
	}, speed);
}

// Fonction qui crée un monstre
function Monster (top,left,hp,name,money,img,speed) {
	this.top     = top;
	this.topTemp = top;
	this.left    = left;
	this.leftTemp= 0;
	this.hp      = hp;
	this.name    = name;
	this.money   = money;
	this.img     = img;
	this.hpMax   = hp;
	this.cStep   = 0;
	this.status = 'normal';	
	this.speed   = speed;
	this.startspeed = speed;

	this.create = function() {
		var html  = $('<div class="monster" style="top:' + this.top + 'px; left: ' + this.left + 'px;" data-hp="' + this.hp + '" data-name="' + this.name + '">' +
						'<img src="' + this.img + '" alt="Monstre ' + this.name + '">' +
						'<div class="progress-bar bg-success" role="progressbar" aria-valuemin="0" aria-valuemax="' + hp + '" aria-valuenow="' + this.hp + '" style="width:100%;">' + hp + '</div>' +
					'</div>');

		this.DOM = html;
		$('.monsters').append(html);
	};

	// On appelle la méthode qui crée un monstre (html)
	this.create();

	// Méthode qui permet de déplacer le monstre vers le haut/bas
	this.moveUpDown = function () {
		$(this.DOM).css('top', this.top+'px');
	};

	// Méthode qui permet de déplacer le monstre vers la droite/gauche
	this.moveLeftRight = function () {
		$(this.DOM).css('left', this.left+'px');
	};
}

//Fonction qui change l'aspect du monstre en fonction du niveau
var palier = 2;
var eltimgMonster = 0;
function ImgMonster(Player) {
	var imgMonster = [
		'https://cdn0.iconfinder.com/data/icons/Favorite_monsters/256/pink.png',
		'https://cdn0.iconfinder.com/data/icons/CuteMonstersPNG/512/yellow_monster_angry.png',
		'https://cdn0.iconfinder.com/data/icons/Favorite_monsters/256/orange.png',
		'https://cdn0.iconfinder.com/data/icons/CuteMonstersPNG/512/green_monster_angry.png',
		'https://cdn0.iconfinder.com/data/icons/CuteMonstersPNG/512/red_monster_angry.png',
		'https://cdn3.iconfinder.com/data/icons/fantasy-and-role-play-game-adventure-quest/512/Monster-512.png'
		];	

		
		if (Player.level<=palier) {		
			$('.monster img').attr('src', imgMonster[eltimgMonster]);
		}else if (Player.level > palier) {
			palier+=2;
			eltimgMonster++;
			if (eltimgMonster == imgMonster.length) {
				eltimgMonster = 0;
			}
			$('.monster img').attr('src', imgMonster[eltimgMonster]);
			
		}			

}

