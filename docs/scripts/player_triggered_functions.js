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
 * TODO: shoot the weapons of a mech
 * @param {String} mech 
 */
function shoot(mech) { }
