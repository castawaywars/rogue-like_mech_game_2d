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
