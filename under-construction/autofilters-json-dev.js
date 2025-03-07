/** can't comment json files so this will have to do
 * anyway the savedFandoms thing is made up of objects for name n id number so that later can use entries() or keys() to help w/filtering for only specific crossovers or listing out the saved fandoms themselves, respectively
 * the reason that savedIdNames gets its own object rn is so that it'll be easier to do the find + replace thing on the filter drop-down
 */

class filter_ids {
	// just the name & id number
	constructor(input) {
		let v = input;
		try {
			v = JSON.parse(input); // this is if we give it the standard [name, id] array
			this.name = v[0];
			this.id = v[1];
		} catch (e) {
			//
		}
	}

	get this() {
		return [this.name, this.id]; // return in this format too
	}
}

class savedFilter {
	// has the name ("global" or fandom name), "include" & "exclude"; each of those is made up of two smaller objects, the first of which takes id numbers, and the other which does not
}

class filterObj {
	// is the object type for "include" and "exclude", w/its two sub
}

class filterKeys {
	// okay this one might not have to be its own class since it's pretty much just an array of the filter ids
}

