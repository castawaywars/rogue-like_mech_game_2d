// ---------- Time-triggered functions ----------

/**
 * spawns a new enemy if it can find a suitable space fast enough
 */
function spawn_enemy() {
	let spawners = document.getElementsByClassName("s");

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
 * TODO: moves an enemy in a random direction
 */
function random_enemy_move() { }
