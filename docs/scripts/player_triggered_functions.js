// ---------- Player-triggered functions ----------
/**
 * moves a mech up if the path is clear
 * @param {String} mech
 */
function move_up(mech) {
	let mech_cell = document.getElementById(mech);
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
	if (target_cell.classList.contains(0)) {
		tile_set_classes_to_zero(mech_cell);
		mech_cell.removeAttribute("id");

		target_cell.classList.remove(0);
		target_cell.setAttribute("id", mech);
		target_cell.classList.add(mech);
		target_cell.classList.add(direction);
	}
}

/**
 * shoot the weapons of a mech
 * @param {String} mech 
 */
function shoot(mech) {
	let mech_tile = document.getElementById(mech);
	if (mech_tile.classList.contains("up")) {
		shot_flies(mech_tile.getAttribute("row"), mech_tile.getAttribute("column"), "up");
	} else if (mech_tile.classList.contains("left")) {
		shot_flies(mech_tile.getAttribute("row"), mech_tile.getAttribute("column"), "left");
	} else if (mech_tile.classList.contains("down")) {
		shot_flies(mech_tile.getAttribute("row"), mech_tile.getAttribute("column"), "down");
	} else if (mech_tile.classList.contains("right")) {
		shot_flies(mech_tile.getAttribute("row"), mech_tile.getAttribute("column"), "right");
	}
}

/**
 * recursive function to let a shot fly
 * @param {number} from_row 
 * @param {number} from_column 
 * @param {string} direction 
 */
function shot_flies(from_row, from_column, direction) {
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
	shot_hit_scan(target_row, target_column, direction);
}

/**
 * checks if a shot hit something, if not keep flying, if yes remove enemy if needed
 * @returns nothing
 */
function shot_hit_scan(target_row, target_column, direction) {
	if (in_bounds(target_row, target_column)) {
		let the_table = table_target();
		let target = the_table.children[target_row].children[target_column];
		if (target.classList.contains("0")) {
			//nothing hit yet, continue flying
			shot_flies(target_row, target_column, direction);
		} else if (target.classList.contains("m") || target.classList.contains("n") || target.classList.contains("s") || target.classList.contains("w")) {
			return; //hit an ally, spawner, or wall, stop flying
		} else if (target.classList.contains("e")) {
			tile_set_classes_to_zero(target);
			return; //hit an enemy, stop flying
		}
	} else {
		return; //hit the edge of the map, stop flying
	}
}
