let modInfo = {
	name: "A Prestige Tree Mod about Merging",
	id: "prestreemerge",
	author: "nobody",
	pointsName: "points",
	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.0.1",
	name: "A slight QoL update",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.0.1</h3><br>
		- Mergeables now highlight when selected.<br>
	<h3>v0.0</h3><br>
		- Added things.<br>
		- Added stuff.`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

function getWorkEfficiency() {
  let effect = player.p.points.add(getResetGain("p")).max(1)
  effect = effect.cbrt()
  return effect
}

function getMergeableWorkBoosts() {
  let boost = layers.p.clickables[11].power()
  boost = boost.mul(layers.p.clickables[12].power())
  boost = boost.mul(layers.p.clickables[13].power())
  boost = boost.mul(layers.p.clickables[21].power())
  boost = boost.mul(layers.p.clickables[22].power())
  boost = boost.mul(layers.p.clickables[23].power())
  boost = boost.mul(layers.p.clickables[31].power())
  boost = boost.mul(layers.p.clickables[32].power())
  boost = boost.mul(layers.p.clickables[33].power())
  return boost
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
  gain = gain.div(getWorkEfficiency())
  gain = gain.mul(getMergeableWorkBoosts())
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
  function() {return "Your current and potential work is dividing your point gain by "+format(getWorkEfficiency())+"."},
  function() {if (getMergeableWorkBoosts().gt(1)) return "Your mergers are multiplying points by "+format(getMergeableWorkBoosts())+"."}
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("e280000000"))
}



// Less important things beyond this point!

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}
