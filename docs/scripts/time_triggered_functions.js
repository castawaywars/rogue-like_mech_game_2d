// ---------- Time-triggered functions ----------

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
/**
 * finds where the mechs can shoot
 * @returns array of [x,y]-coordinates where mechs can shoot
 */
function find_line_of_fire_tiles() {
	let returner = [];
	let table = table_target();

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
		if (table.children[step_coords[0]].children[step_coords[1]].classList.contains["0"]) {
			returner.push([step_coords[0], step_coords[1]]);

			step_coords[0] = +step_coords[0] + dir_mod[0];
			step_coords[1] = +step_coords[1] + dir_mod[1];
		} else {
			//encountered obstacle, line of fire ceases
			break;
		}
	}

	if (!single_player) {
		//the same again for player 2 if player 2 exists
		player = document.getElementById("n");
		player_x = +player.getAttribute("row");
		player_y = +player.getAttribute("column");
		dir_mod = [0, 0]; //direction modifier to make steps following the gun line of fire
		flame_available = document.getElementById("n_flame_ammo").innerHTML > 0;
		flame_targetable = [];
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
			if (table.children[step_coords[0]].children[step_coords[1]].classList.contains["0"]) {
				returner.push([step_coords[0], step_coords[1]]);

				step_coords[0] = +step_coords[0] + dir_mod[0];
				step_coords[1] = +step_coords[1] + dir_mod[1];
			} else {
				//encountered obstacle, line of fire ceases
				break;
			}
		}
	}

	let returner_unique = [...new Set(returner)]; //according to https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-a-javascript-array this should remove all duplicates from the line of fire tile list, which will make things easier to handle

	return returner_unique;
}

