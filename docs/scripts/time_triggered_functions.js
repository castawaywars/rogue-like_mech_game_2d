// ---------- Time-triggered functions ----------

// ---------- spawn functions ----------

/**
 * spawns a new enemy if it can find a suitable space fast enough
 */
function spawn_enemy() {
	let spawners = document.getElementsByClassName("s");

	if (spawners.length == 0) {
		return; //there are no spawners on this map
	}

	//pick a random spawner to spawn a new enemy at
	let target_spawner = spawners[Math.floor(Math.random() * spawners.length)];
	let spawner_row = target_spawner.getAttribute("row");
	let spawner_col = target_spawner.getAttribute("column");

	let success = false;
	for (let i = 0; i < 5 && !success; i++) {//place an enemy on a random unoccupied adjacent tile. Since it's random, it has to stop after 5 tries to prevent endless attempts.
		let aim = Math.floor(Math.random() * 8);
		switch (aim) {
			case 0:
				if (try_place_enemy((+spawner_row) - 1, (+spawner_col) - 1)) {
					success = true;
				}
				break;
			case 1:
				if (try_place_enemy((+spawner_row) - 1, (+spawner_col))) {
					success = true;
				}
				break;
			case 2:
				if (try_place_enemy((+spawner_row) - 1, (+spawner_col) + 1)) {
					success = true;
				}
				break;
			case 3:
				if (try_place_enemy((+spawner_row), (+spawner_col) - 1)) {
					success = true;
				}
				break;
			case 4:
				if (try_place_enemy((+spawner_row), (+spawner_col) + 1)) {
					success = true;
				}
				break;
			case 5:
				if (try_place_enemy((+spawner_row) + 1, (+spawner_col) - 1)) {
					success = true;
				}
				break;
			case 6:
				if (try_place_enemy((+spawner_row) + 1, (+spawner_col))) {
					success = true;
				}
				break;
			case 7:
				if (try_place_enemy((+spawner_row) + 1, (+spawner_col) + 1)) {
					success = true;
				}
				break;
		}
	}
}

/**
 * tries placing an enemy at the assigned location
 * @param {number} target_row 
 * @param {number} target_col 
 * @returns true if enemy placed successfully, false otherwise
 */
function try_place_enemy(target_row, target_col) {
	if (!in_bounds(target_row, target_col)) {
		return false;
	}
	let target = the_table.children[target_row].children[target_col];
	if (target.classList.contains("0")) {
		target.classList.remove("0");
		target.classList.add("e")
		return true;
	} else {
		return false;
	}
}

// ---------- random enemy movement functions ----------

/**
 * moves an enemy in a random direction
 * if the enemy crashes into a mech, destroy to the mech and promote the enemy to a spawner
 */
function random_enemy_move(enemy_tile) {
	let current_row = enemy_tile.getAttribute("row");
	let current_col = enemy_tile.getAttribute("column");
	let target_row = current_row;
	let target_col = current_col;

	//pick a direction
	let aim = Math.floor(Math.random() * 4);
	switch (aim) {
		case 0:
			target_row--;
			break;
		case 1:
			target_col--;
			break;
		case 2:
			target_row++;
			break;
		case 3:
			target_col++;
			break;
	}

	if (!in_bounds(target_row, target_col)) {
		return;//if trying to move out of bounds, abort
	}

	let the_table = table_target();
	let target_tile = the_table.children[target_row].children[target_col];
	if (target_tile.classList.contains(0)) {
		//empty tile targeted. Move.
		tile_set_classes_to_zero(enemy_tile);
		target_tile.classList.remove("0");
		target_tile.classList.add("e");
	} else if (target_tile.classList.contains("n") || target_tile.classList.contains("m")) {
		tile_set_classes_to_zero(enemy_tile); //enemy disappears regardless of result

		//enemy detected.
		let mech = "";
		if (target_tile.classList.contains("m")) {
			mech = "m";
		} else if (target_tile.classList.contains("n")) {
			mech = "n";
		}

		//reduce mech health
		let mech_health_span = document.getElementById(mech + "_health");
		mech_health_span.innerHTML--;

		//If mech health =0, kill him and promote enemy into a spawner
		if (mech_health_span.innerHTML == 0) {
			tile_set_classes_to_zero(target_tile);
			target_tile.removeAttribute("id");
			target_tile.classList.remove("0");
			target_tile.classList.add("s");
		}
	}
}

// ---------- non-random enemy movement functions ----------

/**
 * figures out how agressive the enemies should behave, and triggers actions accordingly.
 */
function determine_aggressiveness() {
	//if there are spawners, and enough enemies around, cautiously approach
	//if there are spawners, and a lot of enemies around, recklessly charge and ignore losses
	//if there are spawners, and few enemies around, retreat and hope for more spawns
	//if there are no spawners, there's no point to waiting, full charge
	//if there are no enemies or no mechs, do nothing, to save processing power

	let spawners = document.getElementsByClassName("s");
	let enemies = document.getElementsByClassName("e");
	let m = document.getElementsByClassName("m");
	let n = document.getElementsByClassName("n");

	if (enemies.length == 0) {
		return;//no enemies, abort the function to save processing power
	}
	if (m.length == 0 && n.length == 0) {
		return;//no mechs, don't waste energy and processing power on trying to find them
	}
	if (spawners.length == 0) {
		seeking_enemy_move(pathfinder_map([]));
		return;
	}

	//at this point in the function, there are enemies, at least one mech, and spawners available.
	let the_table = table_target();
	let height = the_table.children.length;
	let width = the_table.children[0].children.length;

	if (enemies.length > height * width * 0.2) {
		//this means 20% of the map's tiles are covered by enemies, which is enough to be reckless.
		seeking_enemy_move(pathfinder_map([]));
		return;
	} else if (enemies.length > height * width * 0.05) {
		//this means that 5%-20% of the map's tiles is enemies, approach.
		seeking_enemy_move(pathfinder_map(find_line_of_fire_tiles()));
		return;
	} else {
		//with less than 5% of the map occupied by enemies, better to be careful and retreat.
		fleeing_enemy_move(pathfinder_map([]), find_line_of_fire_tiles());
		return;
	}
}

/**
 * finds where the mechs can shoot
 * @returns array of [x,y]-coordinates where mechs can shoot
 */
function find_line_of_fire_tiles() {
	let returner = [];
	let table = table_target();

	if (document.getElementById("m") != null) {
		let player = document.getElementById("m");
		let player_x = +player.getAttribute("row");
		let player_y = +player.getAttribute("column");
		let dir_mod = [0, 0]; //direction modifier to make steps following the gun line of fire
		let flame_available = document.getElementById("m_flame_ammo").innerHTML > 0;
		let flame_targetable = [];
		if (player.classList.contains("up")) {
			dir_mod[0] = -1;
			if (flame_available) {
				//flamethrower ammo available, add flamethrower covered fields to danger zone
				flame_targetable.push([+player_x - 1, +player_y]);
				flame_targetable.push([+player_x - 1, +player_y - 1]);
				flame_targetable.push([+player_x - 1, +player_y + 1]);
				flame_targetable.push([+player_x - 2, +player_y]);
			}
		} else if (player.classList.contains("down")) {
			dir_mod[0] = 1;
			if (flame_available) {
				//flamethrower ammo available, add flamethrower covered fields to danger zone
				flame_targetable.push([+player_x + 1, +player_y]);
				flame_targetable.push([+player_x + 1, +player_y - 1]);
				flame_targetable.push([+player_x + 1, +player_y + 1]);
				flame_targetable.push([+player_x + 2, +player_y]);
			}
		} else if (player.classList.contains("right")) {
			dir_mod[1] = 1;
			if (flame_available) {
				//flamethrower ammo available, add flamethrower covered fields to danger zone
				flame_targetable.push([+player_x, +player_y + 1]);
				flame_targetable.push([+player_x - 1, +player_y + 1]);
				flame_targetable.push([+player_x + 1, +player_y + 1]);
				flame_targetable.push([+player_x, +player_y + 2]);
			}
		} else if (player.classList.contains("left")) {
			dir_mod[1] = -1;
			if (flame_available) {
				//flamethrower ammo available, add flamethrower covered fields to danger zone
				flame_targetable.push([+player_x, +player_y - 1]);
				flame_targetable.push([+player_x - 1, +player_y - 1]);
				flame_targetable.push([+player_x + 1, +player_y - 1]);
				flame_targetable.push([+player_x, +player_y - 2]);
			}
		}

		//if flamethrower ammo is available, add those of the flamethrower-covered fields that are actually places the enemy can go to the returner
		if (flame_available) {
			let targeted_cell;
			for (let i = 0; i < 4; i++) {
				if (in_bounds(flame_targetable[i][0], flame_targetable[i][1])) {
					targeted_cell = table.children[flame_targetable[i][0]].children[flame_targetable[i][1]];
					if (targeted_cell.classList.contains("0") || targeted_cell.classList.contains("e")) {
						returner.push([flame_targetable[i][0], flame_targetable[i][1]]);
					}
				}
			}
		}

		let step_coords = [+player_x + dir_mod[0], +player_y + dir_mod[1]];
		while (in_bounds(step_coords[0], step_coords[1])) {
			if (table.children[step_coords[0]].children[step_coords[1]].classList.contains("0")) {
				returner.push([step_coords[0], step_coords[1]]);

				step_coords[0] = +step_coords[0] + dir_mod[0];
				step_coords[1] = +step_coords[1] + dir_mod[1];
			} else {
				//encountered obstacle, line of fire ceases
				break;
			}
		}
	}

	if (document.getElementById("n") != null) {
		//the same again for player 2 if player 2 exists
		let player = document.getElementById("n");
		let player_x = +player.getAttribute("row");
		let player_y = +player.getAttribute("column");
		let dir_mod = [0, 0]; //direction modifier to make steps following the gun line of fire
		let flame_available = document.getElementById("n_flame_ammo").innerHTML > 0;
		let flame_targetable = [];
		if (player.classList.contains("up")) {
			dir_mod[0] = -1;
			if (flame_available) {
				//flamethrower ammo available, add flamethrower covered fields to danger zone
				flame_targetable.push([+player_x - 1, +player_y]);
				flame_targetable.push([+player_x - 1, +player_y - 1]);
				flame_targetable.push([+player_x - 1, +player_y + 1]);
				flame_targetable.push([+player_x - 2, +player_y]);
			}
		} else if (player.classList.contains("down")) {
			dir_mod[0] = 1;
			if (flame_available) {
				//flamethrower ammo available, add flamethrower covered fields to danger zone
				flame_targetable.push([+player_x + 1, +player_y]);
				flame_targetable.push([+player_x + 1, +player_y - 1]);
				flame_targetable.push([+player_x + 1, +player_y + 1]);
				flame_targetable.push([+player_x + 2, +player_y]);
			}
		} else if (player.classList.contains("right")) {
			dir_mod[1] = 1;
			if (flame_available) {
				//flamethrower ammo available, add flamethrower covered fields to danger zone
				flame_targetable.push([+player_x, +player_y + 1]);
				flame_targetable.push([+player_x - 1, +player_y + 1]);
				flame_targetable.push([+player_x + 1, +player_y + 1]);
				flame_targetable.push([+player_x, +player_y + 2]);
			}
		} else if (player.classList.contains("left")) {
			dir_mod[1] = -1;
			if (flame_available) {
				//flamethrower ammo available, add flamethrower covered fields to danger zone
				flame_targetable.push([+player_x, +player_y - 1]);
				flame_targetable.push([+player_x - 1, +player_y - 1]);
				flame_targetable.push([+player_x + 1, +player_y - 1]);
				flame_targetable.push([+player_x, +player_y - 2]);
			}
		}

		//if flamethrower ammo is available, add those of the flamethrower-covered fields that are actually places the enemy can go to the returner
		if (flame_available) {
			let targeted_cell;
			for (let i = 0; i < 4; i++) {
				if (in_bounds(flame_targetable[i][0], flame_targetable[i][1])) {
					targeted_cell = table.children[flame_targetable[i][0]].children[flame_targetable[i][1]];
					if (targeted_cell.classList.contains("0") || targeted_cell.classList.contains("e")) {
						returner.push([flame_targetable[i][0], flame_targetable[i][1]]);
					}
				}
			}
		}

		let step_coords = [+player_x + dir_mod[0], +player_y + dir_mod[1]];
		while (in_bounds(step_coords[0], step_coords[1])) {
			if (table.children[step_coords[0]].children[step_coords[1]].classList.contains("0")) {
				returner.push([step_coords[0], step_coords[1]]);

				step_coords[0] = +step_coords[0] + dir_mod[0];
				step_coords[1] = +step_coords[1] + dir_mod[1];
			} else {
				//encountered obstacle, line of fire ceases
				break;
			}
		}
	}

	//remove duplicate coordinates
	let returner_unique = [];
	for (let i = 0; i < returner.length; i++) {
		if (!returner_unique.some(e => (e[0] == returner[i][0] && e[1] == returner[i][1]))) {
			returner_unique.push(returner[i]);
		}
	}

	return returner_unique;
}

/**
 * Command all enemies to approach the nearest mech according to pathfinder map
 * @param {Array} pathfinder_map pathfinder map with line of fire considered as per determined aggressiveness
 */
function seeking_enemy_move(pathfinder_map) {
	let the_table = table_target();
	let adjacent;
	let adjacent_raw;
	let tile_content;
	for (let enemy of document.getElementsByClassName("e")) {
		adjacent = [];
		adjacent_raw = adjacent_coords(+enemy.getAttribute("row"), +enemy.getAttribute("column"));

		for (let location of adjacent_raw) {
			if (!in_bounds(location[0], location[1])) {
				//out of bounds, discard
				continue;
			}

			tile_content = the_table.children[location[0]].children[location[1]].classList;
			if (tile_content.contains("m") || tile_content.contains("n") || tile_content.contains("0")) {
				//found tile where we can move
				adjacent.push(location);
			}
		}

		move_to_optimal_tile_approach(enemy, adjacent, pathfinder_map);
	}
}

/**
 * Commands all enemies to retreat from the mechs while avoiding line of fire
 * @param {Array} pathfinder_map 
 * @param {Array} line_of_fire_tiles 
 */
function fleeing_enemy_move(pathfinder_map, line_of_fire_tiles) {
	let the_table = table_target();
	let adjacent;
	let adjacent_raw;
	let tile_content;
	let pounce = false;
	for (let enemy of document.getElementsByClassName("e")) {
		pounce = false;
		adjacent = [];
		adjacent_raw = adjacent_coords(+enemy.getAttribute("row"), +enemy.getAttribute("column"));

		for (let location of adjacent_raw) {
			if (!in_bounds(location[0], location[1])) {
				//out of bounds, discard
				continue;
			}

			tile_content = the_table.children[location[0]].children[location[1]].classList;

			//if a mech is adjacent, pounce
			if (tile_content.contains("m") || tile_content.contains("n")) {
				let target_tile = the_table.children[location[0]].children[location[1]];
				tile_set_classes_to_zero(enemy); //enemy disappears regardless of result

				let mech = "";
				if (target_tile.classList.contains("m")) {
					mech = "m";
				} else if (target_tile.classList.contains("n")) {
					mech = "n";
				}

				//reduce mech health
				let mech_health_span = document.getElementById(mech + "_health");
				mech_health_span.innerHTML--;

				//If mech health =0, kill him and promote enemy into a spawner
				if (mech_health_span.innerHTML == 0) {
					tile_set_classes_to_zero(target_tile);
					target_tile.removeAttribute("id");
					target_tile.classList.remove("0");
					target_tile.classList.add("s");
				}

				pounce = true;

				break;
			} else if (tile_content.contains("0")) {
				//a tile to which we can move, if not in line of fire
				if (line_of_fire_tiles.some(e => (e[0] == location[0] && e[1] == location[1]))) {
					continue;
				} else {
					adjacent.push(location);
				}
			}
		}

		if (pounce) {
			continue;
		}

		//if enemy is in line of fire and no movement option except line of fire exists, allow moving in line of fire
		if (adjacent.length == 0 && line_of_fire_tiles.some(e => (e[0] == enemy.getAttribute("row") && e[1] == enemy.getAttribute("column")))) {
			for (let location of adjacent_raw) {
				if (!in_bounds(location[0], location[1])) {
					//out of bounds, discard
					continue;
				}

				tile_content = the_table.children[location[0]].children[location[1]].classList;

				//if a mech is adjacent, pounce
				if (tile_content.contains("0")) {
					//a tile to which we can move
					adjacent.push(location);
				}
			}
		}

		move_to_optimal_tile_retreat(enemy, adjacent, pathfinder_map);
	}
}

/**
 * Approach mode: Move a single enemy to the optimal tile out of a set of options given the pathfinding map.
 * @param {Element} enemy_tile Tile of the enemy
 * @param {Array} option_tiles Coordinates of movement options
 * @param {Array} pathfinder_map pathfinder map
 * @returns 
 */
function move_to_optimal_tile_approach(enemy_tile, option_tiles, pathfinder_map) {
	if (option_tiles.length == 0) {
		return;//no options to move to, abort
	}

	//find optimal tile;
	let min;
	let min_i;
	for (let i = 0; i < option_tiles.length; i++) {
		if (i == 0) {
			min_i = 0;
			min = pathfinder_map[option_tiles[i][0]][option_tiles[i][1]];
		} else if (pathfinder_map[option_tiles[i][0]][option_tiles[i][1]] < min) {
			min_i = i;
			min = pathfinder_map[option_tiles[i][0]][option_tiles[i][1]]
		}
	}

	//check if targeted tile is better than current
	if (min > pathfinder_map[enemy_tile.getAttribute("row")][enemy_tile.getAttribute("column")]) {
		return;
	}

	//do the actual move, logic copied from random_enemy_move, because that worked.

	let the_table = table_target();
	let target_tile = the_table.children[option_tiles[min_i][0]].children[option_tiles[min_i][1]];
	if (target_tile.classList.contains(0)) {
		//empty tile targeted. Move.
		tile_set_classes_to_zero(enemy_tile);
		target_tile.classList.remove("0");
		target_tile.classList.add("e");
	} else if (target_tile.classList.contains("n") || target_tile.classList.contains("m")) {
		tile_set_classes_to_zero(enemy_tile); //enemy disappears regardless of result

		//enemy detected.
		let mech = "";
		if (target_tile.classList.contains("m")) {
			mech = "m";
		} else if (target_tile.classList.contains("n")) {
			mech = "n";
		}

		//reduce mech health
		let mech_health_span = document.getElementById(mech + "_health");
		mech_health_span.innerHTML--;

		//If mech health =0, kill him and promote enemy into a spawner
		if (mech_health_span.innerHTML == 0) {
			tile_set_classes_to_zero(target_tile);
			target_tile.removeAttribute("id");
			target_tile.classList.remove("0");
			target_tile.classList.add("s");
		}
	}
}

/**
 * Retreat mode: Move a single enemy to the optimal tile out of a set of options given the pathfinding map.
 * @param {Element} enemy_tile Tile of the enemy
 * @param {Array} option_tiles Coordinates of movement options
 * @param {Array} pathfinder_map pathfinder map
 * @returns 
 */
function move_to_optimal_tile_retreat(enemy_tile, option_tiles, pathfinder_map) {
	if (option_tiles.length == 0) {
		return;//no options to move to, abort
	}

	//find optimal tile;
	let max;
	let max_i;
	for (let i = 0; i < option_tiles.length; i++) {
		if (i == 0) {
			max_i = 0;
			max = pathfinder_map[option_tiles[i][0]][option_tiles[i][1]];
		} else if (pathfinder_map[option_tiles[i][0]][option_tiles[i][1]] > max) {
			max_i = i;
			max = pathfinder_map[option_tiles[i][0]][option_tiles[i][1]]
		}
	}

	//check if targeted tile is better than current
	if (max < pathfinder_map[enemy_tile.getAttribute("row")][enemy_tile.getAttribute("column")]) {
		return;
	}

	//do the actual move, logic copied from random_enemy_move, because that worked.

	let the_table = table_target();
	let target_tile = the_table.children[option_tiles[max_i][0]].children[option_tiles[max_i][1]];
	if (target_tile.classList.contains(0)) {
		//empty tile targeted. Move.
		tile_set_classes_to_zero(enemy_tile);
		target_tile.classList.remove("0");
		target_tile.classList.add("e");
	} else if (target_tile.classList.contains("n") || target_tile.classList.contains("m")) {
		//this shouldn't happen here, we're retreating and pouncing an enemy should be handled elsewhere, not in this function.

		tile_set_classes_to_zero(enemy_tile); //enemy disappears regardless of result

		//enemy detected.
		let mech = "";
		if (target_tile.classList.contains("m")) {
			mech = "m";
		} else if (target_tile.classList.contains("n")) {
			mech = "n";
		}

		//reduce mech health
		let mech_health_span = document.getElementById(mech + "_health");
		mech_health_span.innerHTML--;

		//If mech health =0, kill him and promote enemy into a spawner
		if (mech_health_span.innerHTML == 0) {
			tile_set_classes_to_zero(target_tile);
			target_tile.removeAttribute("id");
			target_tile.classList.remove("0");
			target_tile.classList.add("s");
		}
	}
}

/**
 * Create a two-dimensional array of the same dimensions as the map with the numbers for pathfinding to the mechs
 * @param {Array} line_of_fire_tiles Array of tiles that are in the line of fire of the mechs. Leave empty if irrelevant.
 * @returns Two-dimensional Array with the pathfinding numbers, lower numbers towards the mechs.
 */
function pathfinder_map(line_of_fire_tiles) {
	let table = table_target();
	let board = [];
	//prepare board and place some initial values
	let content;
	for (let i = 0; i < table.children.length; i++) {
		board.push([]);
		for (let j = 0; j < table.children[i].children.length; j++) {
			content = table.children[i].children[j].classList;
			if (content.contains("0") || content.contains("e")) {
				//empty tile or enemy. Set to 0 for now.
				board[i].push(0);
			} else if (content.contains("m") || content.contains("n")) {
				//set the tile to 1 as a starting point for pathfinding
				board[i].push(1);
			} else {
				//some kind of obstacle. Set to x
				board[i].push("x");
			}
		}
	}

	let found_something = false;
	let found_something_before = false;
	let step = 1;
	let adjacent;
	do {
		//set the abort conditions. It's a bit roundabout because I need to keep more than one iteration in view.
		if (found_something) {
			found_something_before = true;
		} else {
			found_something_before = false;
		}
		found_something = false;

		//go through the entire board, look for numbers matching the current step
		for (let i = 0; i < board.length; i++) {
			for (let j = 0; j < board[0].length; j++) {
				if (board[i][j] == step) {
					//here we have to react.
					adjacent = adjacent_coords(i, j);

					for (let k = 0; k < 4; k++) {
						if (in_bounds(adjacent[k][0], adjacent[k][1])) {
							if (board[adjacent[k][0]][adjacent[k][1]] == 0) {
								//passable terrain, to be assigned value
								board[adjacent[k][0]][adjacent[k][1]] = step + 1;
								found_something = true;
								if (line_of_fire_tiles.some(e => (e[0] == adjacent[k][0] && e[1] == adjacent[k][1]))) {
									//line of fire. Avoid if possible, therefore set to higher value
									board[adjacent[k][0]][adjacent[k][1]] = step + 2;
								}
							}
						}
					}
				}
			}
		}

		step++;
	} while (found_something || found_something_before);

	return board;
}

/**
 * get adjacent coordinates to a given x and y
 * @param {Number} x 
 * @param {Number} y 
 * @returns array of adjacent coordinates
 */
function adjacent_coords(x, y) {
	return [[x, y - 1], [x - 1, y], [x, y + 1], [x + 1, y]];
}
