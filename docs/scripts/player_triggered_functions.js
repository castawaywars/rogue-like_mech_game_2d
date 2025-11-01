// ---------- Player-triggered functions ----------
/**
 * moves a mech up if the path is clear
 * @param {String} mech
 */
function move_up(mech) {
	let mech_cell = document.getElementById(mech);
	mech_cell.classList = "";
	mech_cell.classList.add(mech);
	mech_cell.classList.add("up");
	let table = table_target();
	if ((+mech_cell.getAttribute("row")) - 1 >= 0) {//check for out-of-bounds
		let target_cell = table.children[(+mech_cell.getAttribute("row")) - 1].children[(+mech_cell.getAttribute("column"))];
		move_mech(mech_cell, mech, target_cell, "up");
	}
}

/**
 * moves a mech left if the path is clear
 * @param {String} mech 
 */
function move_left(mech) {
	let mech_cell = document.getElementById(mech);
	mech_cell.classList = "";
	mech_cell.classList.add(mech);
	mech_cell.classList.add("left");
	let table = table_target();
	if ((+mech_cell.getAttribute("column")) - 1 >= 0) {//check for out-of-bounds
		let target_cell = table.children[(+mech_cell.getAttribute("row"))].children[(+mech_cell.getAttribute("column")) - 1];
		move_mech(mech_cell, mech, target_cell, "left");
	}
}

/**
 * moves a mech down if the path is clear
 * @param {String} mech 
 */
function move_down(mech) {
	let mech_cell = document.getElementById(mech);
	mech_cell.classList = "";
	mech_cell.classList.add(mech);
	mech_cell.classList.add("down");
	let table = table_target();
	if ((+mech_cell.getAttribute("row")) + 1 <= table.children.length - 1) {//check for out-of-bounds
		let target_cell = table.children[(+mech_cell.getAttribute("row")) + 1].children[(+mech_cell.getAttribute("column"))];
		move_mech(mech_cell, mech, target_cell, "down");
	}
}

/**
 * moves a mech right if the path is clear
 * @param {String} mech 
 */
function move_right(mech) {
	let mech_cell = document.getElementById(mech);
	mech_cell.classList = "";
	mech_cell.classList.add(mech);
	mech_cell.classList.add("right");
	let table = table_target();
	if ((+mech_cell.getAttribute("column")) + 1 <= table.children[0].children.length - 1) {//check for out-of-bounds
		let target_cell = table.children[(+mech_cell.getAttribute("row"))].children[(+mech_cell.getAttribute("column")) + 1];
		move_mech(mech_cell, mech, target_cell, "right");
	}
}

/**
 * utility function to make the move functions shorter and remove redundancy
 * @param {Element} mech_cell 
 * @param {String} mech 
 * @param {Element} target_cell 
 * @param {String} direction 
 */
function move_mech(mech_cell, mech, target_cell, direction) {
	if (target_cell.classList.contains(0) || target_cell.classList.contains("f") || target_cell.classList.contains("h")) {
		if (target_cell.classList.contains("f")) {
			increase_flamethrower_ammo(mech);
			target_cell.classList.remove("f");
		}
		if (target_cell.classList.contains("h")) {
			increase_health(mech);
			target_cell.classList.remove("h");
		}

		tile_set_classes_to_zero(mech_cell);
		mech_cell.removeAttribute("id");

		target_cell.classList.remove(0);
		target_cell.setAttribute("id", mech);
		target_cell.classList.add(mech);
		target_cell.classList.add(direction);
	}
}

/**
 * reloads the gun of a mech
 * @param {String} mech 
 */
function reload_gun(mech) {
	document.getElementById(mech + "_gun_ammo").innerHTML = 0;
	setTimeout(() => {
		document.getElementById(mech + "_gun_ammo").innerHTML = 10;
	}, 1000)
}

/**
 * increases the flamethrower ammo of a mech
 * @param {String} mech 
 */
function increase_flamethrower_ammo(mech) {
	document.getElementById(mech + "_flame_ammo").innerHTML++;
	document.getElementById(mech + "_flame_ammo").innerHTML++;
	document.getElementById(mech + "_flame_ammo").innerHTML++;
}

/**
 * increases the health of a mech
 * @param {String} mech 
 */
function increase_health(mech) {
	document.getElementById(mech + "_health").innerHTML++;
}

/**
 * shoot the weapons of a mech
 * @param {String} mech 
 * 
 * //TODO: handle shooting flamethrower
 */
function shoot(mech) {
	if (document.getElementById(mech + "_gun_ammo").innerHTML == 0) {
		//no ammo, return
		return;
	} else {
		document.getElementById(mech + "_gun_ammo").innerHTML--;
	}

	let mech_tile = document.getElementById(mech);
	if (mech_tile.classList.contains("up")) {
		shot_flies(mech_tile.getAttribute("row"), mech_tile.getAttribute("column"), "up", mech);
	} else if (mech_tile.classList.contains("left")) {
		shot_flies(mech_tile.getAttribute("row"), mech_tile.getAttribute("column"), "left", mech);
	} else if (mech_tile.classList.contains("down")) {
		shot_flies(mech_tile.getAttribute("row"), mech_tile.getAttribute("column"), "down", mech);
	} else if (mech_tile.classList.contains("right")) {
		shot_flies(mech_tile.getAttribute("row"), mech_tile.getAttribute("column"), "right", mech);
	}
}

/**
 * recursive function to let a shot fly
 * @param {number} from_row 
 * @param {number} from_column 
 * @param {string} direction 
 */
function shot_flies(from_row, from_column, direction, mech) {
	let target_row = from_row;
	let target_column = from_column;
	switch (direction) {
		case "up":
			target_row = from_row - 1;
			break;
		case "left":
			target_column = from_column - 1;
			break;
		case "down":
			target_row = (+from_row) + 1;
			break;
		case "right":
			target_column = (+from_column) + 1;
			break;
	}
	shot_hit_scan(target_row, target_column, direction, mech);
}

/**
 * checks if a shot hit something, if not keep flying, if yes remove enemy if needed
 * @returns nothing
 */
function shot_hit_scan(target_row, target_column, direction, mech) {
	if (in_bounds(target_row, target_column)) {
		let the_table = table_target();
		let target = the_table.children[target_row].children[target_column];
		if (target.classList.contains("0")) {
			//nothing hit yet, continue flying
			shot_flies(target_row, target_column, direction, mech);
		} else if (target.classList.contains("m") || target.classList.contains("n") || target.classList.contains("s") || target.classList.contains("w")) {
			return; //hit an ally, spawner, or wall, stop flying
		} else if (target.classList.contains("e")) {
			tile_set_classes_to_zero(target);
			document.getElementById(mech + "_score").innerHTML++;

			if (Math.random() > 0.9) {//random chance for the enemy to drop health or flamethrower ammo
				target.classList = "";
				if (Math.random() < 0.75) {//did it drop health or flamethrower ammo, number indicates chance for flamethrower ammo, rest of chance is health
					target.classList.add("f");
				} else {
					target.classList.add("h");
				}
			}

			return; //hit an enemy, stop flying
		}
	} else {
		return; //hit the edge of the map, stop flying
	}
}

/**
 * shoot the flamethrower of a mech
 * @param {String} mech 
 */
function flamethrower_shoot(mech) {
	if (document.getElementById(mech + "_flame_ammo").innerHTML == 0) {
		//no ammo, return
		return;
	} else {
		document.getElementById(mech + "_flame_ammo").innerHTML--;
	}

	let mech_tile = document.getElementById(mech);
	let mech_row = +mech_tile.getAttribute("row");
	let mech_column = +mech_tile.getAttribute("column");
	let coordinates = [];
	if (mech_tile.classList.contains("up")) {
		coordinates.push([mech_row - 1, mech_column]);
		coordinates.push([mech_row - 1, mech_column - 1]);
		coordinates.push([mech_row - 1, mech_column + 1]);
		coordinates.push([mech_row - 2, mech_column]);
	} else if (mech_tile.classList.contains("left")) {
		coordinates.push([mech_row, mech_column - 1]);
		coordinates.push([mech_row - 1, mech_column - 1]);
		coordinates.push([mech_row + 1, mech_column - 1]);
		coordinates.push([mech_row, mech_column - 2]);
	} else if (mech_tile.classList.contains("down")) {
		coordinates.push([mech_row + 1, mech_column]);
		coordinates.push([mech_row + 1, mech_column - 1]);
		coordinates.push([mech_row + 1, mech_column + 1]);
		coordinates.push([mech_row + 2, mech_column]);
	} else if (mech_tile.classList.contains("right")) {
		coordinates.push([mech_row, mech_column + 1]);
		coordinates.push([mech_row - 1, mech_column + 1]);
		coordinates.push([mech_row + 1, mech_column + 1]);
		coordinates.push([mech_row, mech_column + 2]);
	}

	for (let location of coordinates) {
		if (in_bounds(location[0], location[1])) {
			flame_hit_scan(location[0], location[1], mech);
		}
	}
}

/**
 * check if a flamethower "projectile" hit anything, and handle accordingly
 * @param {number} target_row 
 * @param {number} target_column 
 * @param {string} mech 
 * @returns nothing
 */
function flame_hit_scan(target_row, target_column, mech) {
	let the_table = table_target();
	let target = the_table.children[target_row].children[target_column];
	if (target.classList.contains("0")) {
		return;//nothing hit, return
	} else if (target.classList.contains("m") || target.classList.contains("n") || target.classList.contains("w")) {
		return; //hit an ally or wall, ignore
	} else if (target.classList.contains("e") || target.classList.contains("s")) {
		//destroy enemies and spawners
		tile_set_classes_to_zero(target);
		document.getElementById(mech + "_score").innerHTML++;

		if (Math.random() > 0.9) {//random chance for the enemy to drop health or flamethrower ammo
			target.classList = "";
			if (Math.random() < 0.75) {//did it drop health or flamethrower ammo, number indicates chance for flamethrower ammo, rest of chance is health
				target.classList.add("f");
			} else {
				target.classList.add("h");
			}
		}
		return;
	}
}
