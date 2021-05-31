function getHighestShit(layer) {
  let tier = new Decimal(1)
  tier = tier.add(buyableEffect("p", 11))
  switch(layer) {
    case "p":
      return tier
    case "g":
    case "scr":
      return new Decimal(1)
  }
}

function getMergeableCost(layer) {
  let cost = new Decimal(5)
  switch(layer) {
    case "p":
      cost = cost.pow(getHighestShit(layer).sub(1))
      return cost
    case "g":
      cost = new Decimal(4)
      cost = cost.pow(player[layer].boughtMergeables).mul(2500)
      cost = cost.div(buyableEffect("mp", 31))
      cost = cost.div(buyableEffect("t", 23))
      return cost
    case "scr":
      cost = new Decimal(0)
      return cost
  }
}

function getGrimoireGainRate() {
  let rate = 20
  if (buyableEffect("t", 24)) rate += (buyableEffect("t", 24).toNumber())
  return rate
}

function getAcquireResourceRate() {
  let rate = 1
  if (buyableEffect("t", 12)) rate += (buyableEffect("t", 12).toNumber())
  return rate
}

function getTier(layer, id) {
  switch(layer) {
    case "p":
    case "g":
    case "scr":
     return new Decimal(getClickableState(layer, id))
  }
}

function getMergeIncrease(layer) {
  let tier = new Decimal(1)
  switch(layer) {
    case "p":
      break;
  }
  return tier
}

function merge(layer, id, merge, autoMerge=false) {
  let data = getTier(layer, id)
  if (new Decimal(data).lt(getHighestShit(layer))) return
  if (new Decimal(getTier(layer, (autoMerge?merge:player[layer].currentMerge))).eq(data)) {
    if (layer == "p" && irandom(100) < getAcquireResourceRate()) {
      let resource = choose(["bricks", "magnets", "tires", "meteorites", "bones", "stars", "beams", "crystals"])
      if (player.t.unlocked) player.t[resource] = player.t[resource].add(getMergeIncrease(layer).pow(2))
    }
    if (layer == "g" && irandom(100) < getGrimoireGainRate()) {
      if (player.t.unlocked) addPoints("t", 1)
    }
    player.mm.percentage = player.mm.percentage.add(getMergeIncrease(layer).pow(2))
    setClickableState(layer, (autoMerge?merge:player[layer].currentMerge), new Decimal(0))
    setClickableState(layer, id, new Decimal(data).add(getMergeIncrease(layer)))
    if (autoMerge != true) player.timeSinceLastMerge = 0

  }
  if (autoMerge != true) {
    player[layer].currentMerge = null
  }
}

function buyAMergable(layer, id) {
    if (layer == "scr") return;
    if (!tmp[layer].clickables[id].unlocked) return
    if (player[layer].points.gte(getMergeableCost(layer))) {
      setClickableState(layer, id, getHighestShit(layer))
      player[layer].points = player[layer].points.sub(getMergeableCost(layer))
      if (player[layer].boughtMergeables) player[layer].boughtMergeables = player[layer].boughtMergeables.add(1)
    }
}

function getRandomMergeableColor(layer, id) {
  let value = Math.min(random(player.seedColor*Math.sin(((getTier(layer, id).toNumber()*(player.seedColor**1.1))))), 16777216)
  let string = ("#"+value.toString(16).split('0.')[1])
  string = string.slice(0, -2);
  if (string.length < 7) {
     do {
      string = string + "0"
    }
     while (string.length < 7)
  }
  string = string + "ff"
  return string
}

function clickAFuckingMergeable(layer, id) {
  let data = getTier(layer, id)
  if (data == 0) {
    buyAMergable(layer, id)
  } else if (player[layer].currentMerge != id && player[layer].currentMerge != null) {
    merge(layer, id)
  } else if (player[layer].currentMerge == id) {
    player[layer].currentMerge = null
  } else if (player[layer].currentMerge == null) {
    player[layer].currentMerge = id
  }
}

function getImprovedAutoMergeSpeed(layer) {
  let speed = 10
  speed = speed / (buyableEffect("t", 34).toNumber())
  switch(layer) {
    case "p":
      speed = speed / (buyableEffect("g", 21).toNumber())
      speed = speed / (buyableEffect("scr", 21).toNumber())
      speed = speed / (buyableEffect("mp", 12).toNumber())
      if (buyableEffect("t", 13)) speed = speed / (buyableEffect("t", 13).toNumber())
      if (player.timeSinceLastMerge > 5) speed = speed / (buyableEffect("t", 21).toNumber())
      break;
    case "g":
      if (buyableEffect("t", 14)) speed = speed / (buyableEffect("t", 14).toNumber())
      speed = speed / (buyableEffect("scr", 21).toNumber())
      speed = speed * 6
  }
  return speed
}

addLayer("p", {
  name: "merge", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
      currentMerge: null,
      timeSinceLastAMerge: 0,
      clickables: { [11]: new Decimal(0), [12]: new Decimal(0), [13]: new Decimal(0), [14]: new Decimal(0), [15]: new Decimal(0),
      [21]: new Decimal(0), [22]: new Decimal(0), [23]: new Decimal(0), [24]: new Decimal(0), [25]: new Decimal(0),
      [31]: new Decimal(0), [32]: new Decimal(0), [33]: new Decimal(0), [34]: new Decimal(0), [35]: new Decimal(0),
      [41]: new Decimal(0), [42]: new Decimal(0), [43]: new Decimal(0), [44]: new Decimal(0), [45]: new Decimal(0) } // Optional default Clickable state
    }
  },
  image:"/aptmammerge.png",
  color: "#4BDC13",
  requires: new Decimal(10), // Can be a function that takes requirement increases into account
  resource: "work", // Name of prestige currency
  baseResource: "points", // Name of resource prestige is based on
  baseAmount() { return player.points }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.5, // Prestige currency exponent
  gainMult() { // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1)
    if (player.mm.unlocked) mult = mult.mul(layers.mm.workMultiplier())
    mult = mult.mul(buyableEffect("mp", 23))
    if (player.mp.best.gt(0)) mult = mult.mul(layers.g.workMultiplier())
    mult = mult.mul(buyableEffect("t", 22))
    return mult
  },
  gainExp() { // Calculate the exponent on main currency from bonuses
    exp = new Decimal(1)
    exp = exp.mul(buyableEffect("g", 12))
    exp = exp.mul(buyableEffect("scr", 12))
    return exp
  },
  row: 0, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    { key: "p", description: "P: Reset for prestige points", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
  ],
  passiveGeneration() {
    if (player.automation.p.autoWorkOn) {
      return 0.25
    } else {
      return 0
    }
  },
  doReset(resettingLayer){ // Triggers when this layer is being reset, along with the layer doing the resetting. Not triggered by lower layers resetting, but is by layers on the same row.
    if(layers[resettingLayer].row > this.row) {
      layerDataReset(this.layer, ["automation"]) // This is actually the default behavior
      player.seedColor = getRNGSeed()
    }
  },
  update(diff) {
    player.timeSinceLastMerge += diff
    if (player.automation.p.autoMergeOn && hasMilestone("sc", 2)) {
      player.p.timeSinceLastAMerge = player.p.timeSinceLastAMerge + (diff)
      if (player.p.timeSinceLastAMerge >= getImprovedAutoMergeSpeed("p")) {
        let viableClickables = []
        for (var i in player.p.clickables) {
          viableClickables.push(i)
        }
        let moreViableClickables = []
        for (var i in player.p.clickables) {
          if (!moreViableClickables[player.p.clickables[i].toNumber()]) {
            moreViableClickables[player.p.clickables[i].toNumber()] = []
            moreViableClickables[player.p.clickables[i].toNumber()].push(i)
          } else {
            moreViableClickables[player.p.clickables[i].toNumber()].push(i)
          }
          for (var i in moreViableClickables) {
            while (moreViableClickables[i].length > 1) {
              merge(this.layer, moreViableClickables[i][0], moreViableClickables[i][1], true)
              moreViableClickables[i].pop()
              moreViableClickables[i].pop()
            }
          }
          player.p.timeSinceLastAMerge = 0
            //merge
        }
      }
    }
  },
  automation() {
    if (player.automation.p.autoBuyerOn && hasMilestone("sc", 1)) {
      for (var i in player.p.clickables) {
        if (player.p.clickables[i].eq(0)) {
          if (!layers.p.clickables[i].unlocked || layers.p.clickables[i].unlocked()) buyAMergable("p", i)
        }
      }
    }
    if (player.automation.p.autoUpgradeOn && hasMilestone("sc", 5)) {
      for (var i in player.p.buyables) {
        buyBuyable(this.layer, i)
      }
    } // autoUpgradeOn
  },
  clickables: {
    rows: 4,
    cols: 5,
    11: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = new Decimal(1.03)
        effect = effect.pow(data.pow(2))
        return effect
      },
      unlocked() { return player[this.layer].unlocked },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
      },
    },
    12: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = new Decimal(1.03)
        effect = effect.pow(data.pow(2))
        return effect
      },
      unlocked() { return player[this.layer].unlocked },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
      },
    },
    13: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = new Decimal(1.03)
        effect = effect.pow(data.pow(2))
        return effect
      },
      unlocked() { return player[this.layer].unlocked },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
      },
    },
    14: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = new Decimal(1.03)
        effect = effect.pow(data.pow(2))
        return effect
      },
      unlocked() { return player[this.layer].buyables[12].gt(3) },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
      },
    },
    15: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = new Decimal(1.03)
        effect = effect.pow(data.pow(2))
        return effect
      },
      unlocked() { return player[this.layer].buyables[12].gt(7) },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
      },
    },
    21: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = new Decimal(1.03)
        effect = effect.pow(data.pow(2))
        return effect
      },
      unlocked() { return player[this.layer].unlocked },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
      },
    },
    22: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = new Decimal(1.03)
        effect = effect.pow(data.pow(2))
        return effect
      },
      unlocked() { return player[this.layer].unlocked },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
      },
    },
    23: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = new Decimal(1.03)
        effect = effect.pow(data.pow(2))
        return effect
      },
      unlocked() { return player[this.layer].unlocked },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
      },
    },
    24: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = new Decimal(1.03)
        effect = effect.pow(data.pow(2))
        return effect
      },
      unlocked() { return player[this.layer].buyables[12].gt(4) },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
      },
    },
    25: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = new Decimal(1.03)
        effect = effect.pow(data.pow(2))
        return effect
      },
      unlocked() { return player[this.layer].buyables[12].gt(8) },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
      },
    },
    31: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = new Decimal(1.03)
        effect = effect.pow(data.pow(2))
        return effect
      },
      unlocked() { return player[this.layer].unlocked },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
      },
    },
    32: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = new Decimal(1.03)
        effect = effect.pow(data.pow(2))
        return effect
      },
      unlocked() { return player[this.layer].unlocked },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
      },
    },
    33: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = new Decimal(1.03)
        effect = effect.pow(data.pow(2))
        return effect
      },
      unlocked() { return player[this.layer].unlocked },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
      },
    },
    34: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = new Decimal(1.03)
        effect = effect.pow(data.pow(2))
        return effect
      },
      unlocked() { return player[this.layer].buyables[12].gt(5) },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
      },
    },
    35: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = new Decimal(1.03)
        effect = effect.pow(data.pow(2))
        return effect
      },
      unlocked() { return player[this.layer].buyables[12].gt(9) },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
      },
    },
    41: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = new Decimal(1.03)
        effect = effect.pow(data.pow(2))
        return effect
      },
      unlocked() { return player[this.layer].buyables[12].gt(0) },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
      },
    },
    42: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = new Decimal(1.03)
        effect = effect.pow(data.pow(2))
        return effect
      },
      unlocked() { return player[this.layer].buyables[12].gt(1) },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
      },
    },
    43: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = new Decimal(1.03)
        effect = effect.pow(data.pow(2))
        return effect
      },
      unlocked() { return player[this.layer].buyables[12].gt(2) },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
      },
    },
    44: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = new Decimal(1.03)
        effect = effect.pow(data.pow(2))
        return effect
      },
      unlocked() { return player[this.layer].buyables[12].gt(6) },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
      },
    },
    45: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = new Decimal(1.03)
        effect = effect.pow(data.pow(2))
        return effect
      },
      unlocked() { return player[this.layer].buyables[12].gt(9) },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
      },
    },
  },
        buyables: {
            rows: 1,
            cols: 2,
            11: {
                title: "Better Mergeables", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    if (player[this.layer].buyables[this.id].gte(10)) x = x.pow(5).div(10000)
                    let cost = new Decimal(25)
                    cost = cost.mul(Decimal.pow(5, x))
                    return cost.floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = x
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " work\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id]) + "/"+ formatWhole(tmp[this.layer].buyables[this.id].cap) + "\n\
                    Increases the beginning tier of Mergeables by "+ formatWhole(data.effect)+", but multiplies Mergeable cost by "+formatWhole(getMergeableCost(this.layer))
                },
                unlocked() { return hasMilestone("sc", 0) }, 
                cap() {
                    let cap = new Decimal(10)

                    cap = cap.add(getGMergeableCapBoosts())
                    return cap
                },
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) && player[this.layer].buyables[this.id].lte(tmp[this.layer].buyables[this.id].cap.sub(1))
                },
                buy() { 
                    if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return;
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    console.log(getHighestShit(layer))
                    for (let i in player[this.layer].clickables) {
                      if (getTier(this.layer, i).lte(getHighestShit(this.layer).add(1)) && getTier(this.layer, i).gt(0)) {
                        setClickableState(this.layer, i, getHighestShit(this.layer).add(1))
                        console.log(format(getTier(this.layer, i)))
                      }
                    }
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return { 'background-color': "#77bf5f" }
                },
                canSellOne() {
                    return player[this.layer].buyables[this.id].gte(1)},
                sellOne() {
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].sub(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            12: {
                title: "More Mergeables", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(30)
                    cost = cost.mul(Decimal.pow(6, x))
                    return cost.floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = x
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " work\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id]) + "/"+ formatWhole(tmp[this.layer].buyables[this.id].cap) + "\n\
                    Adds "+ formatWhole(data.effect)+" mergeables."
                },
                unlocked() { return hasMilestone("sc", 0) }, 
                cap() {
                    let cap = new Decimal(3)

                    cap = cap.add(buyableEffect("g", 22))
                    cap = cap.add(buyableEffect("mp", 22))
                    return cap
                },
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) && player[this.layer].buyables[this.id].lte(tmp[this.layer].buyables[this.id].cap.sub(1))
                },
                buy() { 
                    if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap.add(0.1))) return;
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return { 'background-color': "#77bf5f" }
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
        },
  layerShown() { return true }
})



addLayer("g", {
  name: "gild", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      currentMerge: null,
      timeSinceLastAMerge: 0,
      boughtMergeables: new Decimal(0),
      clickables: { [11]: new Decimal(0), [12]: new Decimal(0), [13]: new Decimal(0),
      [21]: new Decimal(0), [22]: new Decimal(0), [23]: new Decimal(0),
      [31]: new Decimal(0), [32]: new Decimal(0), [33]: new Decimal(0) } // Optional default Clickable state
    }
  },
  image:"aptmamgilded.png",
  color: "#e6e864",
  requires: new Decimal(100000), // Can be a function that takes requirement increases into account
  resource: "gilded points", // Name of prestige currency
  baseResource: "Mergeable Score", // Name of resource prestige is based on
  baseAmount() { return player.sc.points }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.95, // Prestige currency exponent
  gainMult() { // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1)
    if (player.mm.unlocked) mult = mult.mul(layers.mm.gildMultiplier())
    mult = mult.mul(buyableEffect("mp", 11))
    return mult
  },
  gainExp() { // Calculate the exponent on main currency from bonuses
    return new Decimal(1)
  },
  passiveGeneration() {
    if (player.automation.g.autoGildOn) {
      return 0.25
    } else {
      return 0
    }
  },
  row: 1, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    { key: "g", description: "G: Gild points", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
  ],
  workMultiplier() {
    let boost = new Decimal(1)
    for (var i in player[this.layer].clickables) {
      if (getTier(this.layer, i).gt(0)) boost = boost.mul(Decimal.pow(2, getTier(this.layer, i).sqrt()))
    }
    return boost
  },
  update(diff) {
    if (player.automation.g.autoMergeOn && hasMilestone("sc", 11)) {
      player.g.timeSinceLastAMerge = player.g.timeSinceLastAMerge + (diff)
      if (player.g.timeSinceLastAMerge >= getImprovedAutoMergeSpeed("g")) {
        let viableClickables = []
        for (var i in player.g.clickables) {
          viableClickables.push(i)
        }
        let moreViableClickables = []
        for (var i in player.g.clickables) {
          if (!moreViableClickables[new Decimal(player.g.clickables[i]).toNumber()]) {
            moreViableClickables[new Decimal(player.g.clickables[i]).toNumber()] = []
            moreViableClickables[new Decimal(player.g.clickables[i]).toNumber()].push(i)
          } else {
            moreViableClickables[new Decimal(player.g.clickables[i]).toNumber()].push(i)
          }
          for (var i in moreViableClickables) {
            while (moreViableClickables[i].length > 1) {
              merge(this.layer, moreViableClickables[i][0], moreViableClickables[i][1], true)
              moreViableClickables[i].pop()
              moreViableClickables[i].pop()
            }
          }
          player.g.timeSinceLastAMerge = 0
            //merge
        }
      }
    }
  },
  automation() {
    if (player.automation.g.autoBuyerOn && hasMilestone("sc", 12)) {
      for (var i in player.g.clickables) {
        if (player.g.clickables[i].eq(0)) {
          if (!layers.g.clickables[i].unlocked || layers.g.clickables[i].unlocked()) buyAMergable("g", i)
        }
      }
    }
    if (player.automation.g.autoUpgradeOn && hasMilestone("sc", 9)) {
      for (var i in player.g.buyables) {
        buyBuyable(this.layer, i)
      }
    } // autoUpgradeOn
  },
  clickables: {
    rows: 3,
    cols: 3,
    11: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Gilded Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Gilded Points"
        }
        return "Adding +" + formatWhole(this.power()) + " to the Better Mergeables cap."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = Decimal.pow(3, data.sub(1))
        return effect
      },
      unlocked() { return true },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#a89451" }
      },
    },
    12: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Gilded Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Gilded Points"
        }
        return "Adding +" + formatWhole(this.power()) + " to the Better Mergeables cap."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = Decimal.pow(3, data.sub(1))
        return effect
      },
      unlocked() { return true },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#a89451" }
      },
    },
    13: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Gilded Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Gilded Points"
        }
        return "Adding +" + formatWhole(this.power()) + " to the Better Mergeables cap."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = Decimal.pow(3, data.sub(1))
        return effect
      },
      unlocked() { return true },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#a89451" }
      },
    },
    21: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Gilded Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Gilded Points"
        }
        return "Adding +" + formatWhole(this.power()) + " to the Better Mergeables cap."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = Decimal.pow(3, data.sub(1))
        return effect
      },
      unlocked() { return true },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#a89451" }
      },
    },
    22: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Gilded Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Gilded Points"
        }
        return "Adding +" + formatWhole(this.power()) + " to the Better Mergeables cap."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = Decimal.pow(3, data.sub(1))
        return effect
      },
      unlocked() { return true },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#a89451" }
      },
    },
    23: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Gilded Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Gilded Points"
        }
        return "Adding +" + formatWhole(this.power()) + " to the Better Mergeables cap."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = Decimal.pow(3, data.sub(1))
        return effect
      },
      unlocked() { return true },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#a89451" }
      },
    },
    31: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Gilded Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Gilded Points"
        }
        return "Adding +" + formatWhole(this.power()) + " to the Better Mergeables cap."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = Decimal.pow(3, data.sub(1))
        return effect
      },
      unlocked() { return true },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#a89451" }
      },
    },
    32: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Gilded Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Gilded Points"
        }
        return "Adding +" + formatWhole(this.power()) + " to the Better Mergeables cap."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = Decimal.pow(3, data.sub(1))
        return effect
      },
      unlocked() { return true },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#a89451" }
      },
    },
    33: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Buy Gilded Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Gilded Points"
        }
        return "Adding +" + formatWhole(this.power()) + " to the Better Mergeables cap."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = Decimal.pow(3, data.sub(1))
        return effect
      },
      unlocked() { return true },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#a89451" }
      },
    },
  },
        buyables: {
            rows: 2,
            cols: 2,
            11: {
                title: "More Points", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(1)
                    cost = cost.mul(Decimal.pow(5, x))
                    return cost.floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.pow(3, x)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " gilded points\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id]) + "/"+ formatWhole(10) + "\n\
                    Multiplies Point gain by "+ formatWhole(data.effect)+"x."
                },
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) && player[this.layer].buyables[this.id].lte(9)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(10)) return { 'background-color': "#77bf5f" }
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            12: {
                title: "More Work", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(5)
                    cost = cost.mul(Decimal.pow(12, x))
                    return cost.floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.add(1, Decimal.div(x, 10))
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " gilded points\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id]) + "/"+ formatWhole(5) + "\n\
                    Raises the gain of Work to ^"+ format(data.effect)+"."
                },
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) && player[this.layer].buyables[this.id].lte(4)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(5)) return { 'background-color': "#77bf5f" }
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            21: {
                title: "Faster Auto-Merge", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(25)
                    cost = cost.mul(Decimal.pow(5, x))
                    return cost.floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.mul(1, Decimal.pow(1.1, x))
                    return eff;
                },
                unlocked() {
                  return hasMilestone("sc", 6)
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " gilded points\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id]) + "/"+ formatWhole(10) + "\n\
                    Auto-merge is "+ format(data.effect)+"x faster."
                },
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) && player[this.layer].buyables[this.id].lte(9)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(10)) return { 'background-color': "#77bf5f" }
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            22: {
                title: "Even More Mergeables", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(66)
                    cost = cost.mul(Decimal.pow(6, x))
                    return cost.floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = x
                    return eff;
                },
                unlocked() {
                  return hasMilestone("sc", 6)
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " gilded points\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id]) + "/"+ formatWhole(4) + "\n\
                    Increase the cap of More Mergeables by +"+ format(data.effect)+"."
                },
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) && player[this.layer].buyables[this.id].lte(3)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(4)) return { 'background-color': "#77bf5f" }
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
        },
        branches: ["p"],
        tabFormat: {
            Upgrades: {
                buttonStyle() {return  {'color': 'orange'}},
                content:
                    ["main-display",
                    "prestige-button", "resource-display",
                    ["blank", "5px"], // Height
                    "h-line",
                    ["blank", "5px"],
                     "buyables"],
            },
            Mergeables: {
                buttonStyle() {return {'border-color': 'orange'}},
                unlocked() {return hasMilestone("sc", 7)},
                content:
                    ["main-display",
                    "prestige-button", "resource-display",
                    ["blank", "5px"], // Height
                    "h-line",
                    ["blank", "5px"],
                     "clickables",
                    ["display-text", function() { if (player.mp.best.gt(0)) return "Your Gilded Mergeables are providing a "+format(layers.g.workMultiplier())+"x multiplier to work. (based on 2^(tier^0.5) for each Gilded Mergeable.) "}],
                    ["blank", "15px"],
                    ["display-text", function() { return "The next Gilded Mergeable costs "+format(getMergeableCost("g"))+" gilded points."}]],
            },

        },
  layerShown() { return hasMilestone("sc", 2) }
})



addLayer("mm", {
  name: "merge mastery", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "m", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      percentage: new Decimal(0),
      /*currentMerge: null,
      boughtMergeables: new Decimal(0),
      clickables: { [11]: new Decimal(0), [12]: new Decimal(0), [13]: new Decimal(0),
      [21]: new Decimal(0), [22]: new Decimal(0), [23]: new Decimal(0),
      [31]: new Decimal(0), [32]: new Decimal(0), [33]: new Decimal(0) } // Optional default Clickable state*/
    }
  },
  image:"aptmammastery1.png",
  color: "#62de87",
  requires: new Decimal(2.5e12), // Can be a function that takes requirement increases into account
  resource: "merge levels", // Name of prestige currency
  baseResource: "Mergeable Score", // Name of resource prestige is based on
  baseAmount() { return player.sc.points }, // Get the current amount of baseResource
  type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.95, // Prestige currency exponent
  gainMult() { // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1)
    return mult
  },
  gainExp() { // Calculate the exponent on main currency from bonuses
    return new Decimal(1)
  },
  goal() {
    let goal = new Decimal(10)
    goal = goal.mul(player[this.layer].points.add(1))
    return goal
  },
  doReset(resettingLayer){ // Triggers when this layer is being reset, along with the layer doing the resetting. Not triggered by lower layers resetting, but is by layers on the same row.
    if(layers[resettingLayer].row > this.row || resettingLayer == "mp") layerDataReset(this.layer, ["automation"]) // This is actually the default behavior
  },
  update(diff) {
      if (player.mm.percentage.gte(layers.mm.goal())) {
        player.mm.percentage = new Decimal(0)
        player.mm.points = player.mm.points.add(1)
      }
      if (player.sc.points.gte(2.5e12)) {
        player[this.layer].unlocked = true
      }
  },
        bars: {
            longBoi: {
                fillStyle: {'background-color' : "#59bd77"},
                baseStyle: {'background-color' : "#3a704b"},
                textStyle: {'color': '#1a3d25'},

                borderStyle() {return {}},
                direction: RIGHT,
                width: 300,
                height: 30,
                progress() {
                    return (player[this.layer].percentage.div(layers.mm.goal())).toNumber()
                },
                display() {
                    return formatWhole(player[this.layer].percentage) + " / " + formatWhole(layers.mm.goal()) + " merges"
                },
                unlocked: true,

            },
        },
        workMultiplier() {
          return player.mm.points.add(1).pow(1.5)
        },
        gildMultiplier() {
          return player.mm.points.add(1)
        },
        row: 1, // Row the layer is in on the tree (0 is the first row)
        branches: ["p"],
        microtabs: {
          stuff: {
            first: {
                buttonStyle() {return  {'opacity': 0, 'width': '0px', 'height': '0px'}},
                embedLayer: "mp"
            },
          },
        },
        tabFormat: {
            Levels: {
                buttonStyle() {return  {'color': 'orange'}},
                content:
                    ["main-display",
                    "prestige-button", "resource-display",
                    ["blank", "5px"],
                     ["bar", "longBoi"],
                    ["blank", "10px"], // Height
                    "h-line",
                    ["blank", "5px"],
                     ["display-text", function() { return "Your merge levels are providing a "+format(layers.mm.gildMultiplier())+"x multiplier to gilded points, and a "+format(layers.mm.workMultiplier())+"x multiplier to work."}]
                     ],
            },
            Tokens: {
                buttonStyle() {return  {'color': 'orange'}},
                content:
                    ["main-display",
                    "prestige-button", "resource-display",
                    ["blank", "5px"],
                     ["bar", "longBoi"],
                    ["blank", "10px"], // Height
                    "h-line",
                    ["blank", "5px"],
                    ['microtabs', 'stuff']
                    ],
            },

        },
  layerShown() { return hasMilestone("sc", 6) }
})

addLayer("mp", {
  name: "merge prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "Mp", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      best: new Decimal(0),
    }
  },
  image:"aptmammerge.png",
  color: "#3262a8",
  requires: new Decimal(10), // Can be a function that takes requirement increases into account
  resource: "merge tokens", // Name of prestige currency
  baseResource: "merge levels", // Name of resource prestige is based on
  baseAmount() { return player.mm.points }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 2.75, // Prestige currency exponent
  roundUpCost: true,
  gainMult() { // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1)
    mult = mult.mul(buyableEffect("mp", 32))
    mult = mult.mul(buyableEffect("t", 31))
    return mult
  },
  gainExp() { // Calculate the exponent on main currency from bonuses
    exp = new Decimal(1)
    return exp
  },
  row: 2, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    { key: "m", description: "M: Reset for merge tokens", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
  ],
  update() {
    if (hasMilestone("sc", 8)) {
      player[this.layer].unlocked = true
    }
  },
        buyables: {
            rows: 3,
            cols: 3,
            11: {
                title: "More Gilded Points", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(1.1, x)
                    return cost.floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.pow(1.5, x)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " merge tokens\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id]) + "/"+ formatWhole(tmp[this.layer].buyables[this.id].cap) + "\n\
                    Multiplies Gilded Point gain by "+ format(data.effect)+"x. (Basic effect 1.5x.)"
                },
                unlocked() { return hasMilestone("sc", 0) }, 
                cap() {
                    let cap = new Decimal(25)
                    cap = cap.add(buyableEffect("t", 32))
                    return cap
                },
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) && player[this.layer].buyables[this.id].lte(tmp[this.layer].buyables[this.id].cap.sub(1))
                },
                buy() { 
                    if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return;
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return { 'background-color': "#77bf5f", 'height':'150px', 'width':'150px' }
                   return { 'height':'150px', 'width':'150px'}
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            12: {
                title: "Faster Auto-Merge", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(2).mul(Decimal.pow(1.05, x))
                    return cost.floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.mul(0.1, x).add(1)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " merge tokens\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id]) + "/"+ formatWhole(tmp[this.layer].buyables[this.id].cap) + "\n\
                    Multiplies Auto-Merge speed by "+ format(data.effect)+"x. (+0.1x speed additively)"
                },
                unlocked() { return hasMilestone("sc", 0) }, 
                cap() {
                    let cap = new Decimal(25)
                    cap = cap.add(buyableEffect("t", 32))
                    return cap
                },
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) && player[this.layer].buyables[this.id].lte(tmp[this.layer].buyables[this.id].cap.sub(1))
                },
                buy() { 
                    if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return;
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return { 'background-color': "#77bf5f", 'height':'150px', 'width':'150px' }
                   return { 'height':'150px', 'width':'150px'}
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            21: {
                title: "More Points", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(1.1, x)
                    return cost.floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.pow(10, x)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " merge tokens\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id]) + "/"+ formatWhole(tmp[this.layer].buyables[this.id].cap) + "\n\
                    Multiplies Point gain by "+ format(data.effect)+"x. (Basic effect 10x.)"
                },
                unlocked() { return hasMilestone("sc", 0) }, 
                cap() {
                    let cap = new Decimal(25)
                    cap = cap.add(buyableEffect("t", 32))
                    return cap
                },
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) && player[this.layer].buyables[this.id].lte(tmp[this.layer].buyables[this.id].cap.sub(1))
                },
                buy() { 
                    if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return;
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return { 'background-color': "#77bf5f", 'height':'150px', 'width':'150px' }
                   return { 'height':'150px', 'width':'150px'}
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            22: {
                title: "Even More Mergeables II", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(1.3, x).mul(3)
                    return cost.floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = x
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " merge tokens\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id]) + "/"+ formatWhole(tmp[this.layer].buyables[this.id].cap) + "\n\
                    Adds "+ formatWhole(data.effect)+" to the More Mergeables cap.."
                },
                unlocked() { return hasMilestone("sc", 0) }, 
                cap() {
                    let cap = new Decimal(4)
                    return cap
                },
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) && player[this.layer].buyables[this.id].lte(tmp[this.layer].buyables[this.id].cap.sub(1))
                },
                buy() { 
                    if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return;
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return { 'background-color': "#77bf5f", 'height':'180px', 'width':'180px' }
                   return { 'height':'180px', 'width':'180px'}
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            23: {
                title: "Even More Work", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(1.1, x)
                    return cost.floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.pow(2, x)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " merge tokens\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id]) + "/"+ formatWhole(tmp[this.layer].buyables[this.id].cap) + "\n\
                    Multiplies Work gain by "+ format(data.effect)+"x. (Basic effect 2x.)"
                },
                unlocked() { return hasMilestone("sc", 0) }, 
                cap() {
                    let cap = new Decimal(25)
                    cap = cap.add(buyableEffect("t", 32))
                    return cap
                },
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) && player[this.layer].buyables[this.id].lte(tmp[this.layer].buyables[this.id].cap.sub(1))
                },
                buy() { 
                    if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return;
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return { 'background-color': "#77bf5f", 'height':'150px', 'width':'150px' }
                   return { 'height':'150px', 'width':'150px'}
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            31: {
                title: "Cheaper Gilded Mergeables", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(1.1, x)
                    return cost.floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.pow(3, x)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " merge tokens\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id]) + "/"+ formatWhole(tmp[this.layer].buyables[this.id].cap) + "\n\
                    Gilded Mergeables are "+ format(data.effect)+"x cheaper. (Base effect 3x.)"
                },
                unlocked() { return hasMilestone("sc", 0) }, 
                cap() {
                    let cap = new Decimal(25)
                    cap = cap.add(buyableEffect("t", 32))
                    return cap
                },
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) && player[this.layer].buyables[this.id].lte(tmp[this.layer].buyables[this.id].cap.sub(1))
                },
                buy() { 
                    if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return;
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return { 'background-color': "#77bf5f", 'height':'150px', 'width':'150px' }
                   return { 'height':'150px', 'width':'150px'}
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            32: {
                title: "More Merge Tokens", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(2).mul(Decimal.pow(2.5, x))
                    return cost.floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.pow(1.5, x)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " merge tokens\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id]) + "/"+ formatWhole(tmp[this.layer].buyables[this.id].cap) + "\n\
                    Multiplies Merge Token gain by "+ format(data.effect)+"x. (Base effect 1.5x)"
                },
                unlocked() { return hasMilestone("sc", 0) }, 
                cap() {
                    let cap = new Decimal(25)
                    cap = cap.add(buyableEffect("t", 32))
                    return cap
                },
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) && player[this.layer].buyables[this.id].lte(tmp[this.layer].buyables[this.id].cap.sub(1))
                },
                buy() { 
                    if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return;
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return { 'background-color': "#77bf5f", 'height':'150px', 'width':'150px' }
                   return { 'height':'150px', 'width':'150px'}
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
        },
  layerShown() { return false }
})

addLayer("tu", {
  name: "scrap", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
      best: new Decimal(0),
      currentMerge: null,
      timeSinceLastAMerge: 0,
      timeSinceLastMergeable: 0,
      clickables: { [11]: new Decimal(0), [12]: new Decimal(0), [13]: new Decimal(0),
      [21]: new Decimal(0), [22]: new Decimal(0), [23]: new Decimal(0),
      [31]: new Decimal(0), [32]: new Decimal(0), [33]: new Decimal(0) } // Optional default Clickable state
    }
  },
  image:"aptmamscrap.png",
  color: "#cccccc",
  requires: new Decimal(100000), // Can be a function that takes requirement increases into account
  resource: "scrap", // Name of prestige currency
  baseResource: "Mergeable Score", // Name of resource prestige is based on
  baseAmount() { return player.sc.points }, // Get the current amount of baseResource
  type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.95, // Prestige currency exponent
  gainMult() { // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1)
    return mult
  },
  gainExp() { // Calculate the exponent on main currency from bonuses
    return new Decimal(1)
  },
  row: 2, // Row the layer is in on the tree (0 is the first row)
        buyables: {
            rows: 1,
            cols: 3,
            11: {
                title: "Slower Gilded Mergeable", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(1)
                    cost = cost.mul(Decimal.pow(2, x))
                    return cost.floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = x
                    eff = Decimal.pow(0.9, eff).recip()
                    return eff.sub(1);
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " grimoires\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id]) + "\n\
                    Gilded Mergeables cost scaling is "+ formatTime(data.effect.mul(100))+"% slower."
                },
                canAfford() {
                    return player.t.points.gte(tmp[this.layer].buyables[this.id].cost)},
                unlocked() {
                  return true
                },
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.t.points = player.t.points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
        },
        layerShown: false
})

addLayer("t", {
  name: "treasures", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "T", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      total: new Decimal(0),
      bricks: new Decimal(0),
      bones: new Decimal(0),
      magnets: new Decimal(0),
      stars: new Decimal(0),
      tires: new Decimal(0),
      meteorites: new Decimal(0),
      crystals: new Decimal(0),
      beams: new Decimal(0),
      bonusLevels: {
        11: new Decimal(0), 12: new Decimal(0), 13: new Decimal(0), 14: new Decimal(0),
        21: new Decimal(0), 22: new Decimal(0), 23: new Decimal(0), 24: new Decimal(0),
        31: new Decimal(0), 32: new Decimal(0), 33: new Decimal(0), 34: new Decimal(0)
      },
      lastTreasureRolled: 0,
    }
  },
  image:"aptmamtreasures.png",
  color: "#3262a8",
  requires: new Decimal(5e13), // Can be a function that takes requirement increases into account
  baseResource: "mergeable score", // Name of resource prestige is based on
  baseAmount() { return player.sc.points }, // Get the current amount of baseResource
  resource: "grimoires", // Name of prestige currency
  type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 2.75, // Prestige currency exponent
  roundUpCost: true,
  row: 2, // Row the layer is in on the tree (0 is the first row)
    clickables: {
        rows: 1,
        cols: 1,
        11: {
            title: "Summon a Treasure", // Optional, displayed at the top in a larger font
            display() { // Everything else displayed in the buyable button after the title
                let data = getTier(this.layer, this.id)
                return "Requires 5 grimoires"
            },
            unlocked() { return player[this.layer].unlocked }, 
            canClick() {
                return player[this.layer].points.gte(5)
                },
            onClick() { 
                if (!player[this.layer].points.gte(5)) return
                player[this.layer].points = player[this.layer].points.sub(5)
                let luck = irandom(100)
                let cat = []
                let normal = [11, 12, 13, 21, 22, 24, 32]
                let rare = [23, 31, 33]
                if (hasMilestone("sc", 11)) rare = [23, 14, 31, 33]
                let mythic = [34]
                let typing = ""
                if (luck < 80) {
                  type = "normal"
                  for (i in normal) {
                    cat.push(normal[i])
                  }
                } else if (luck < 99.1) {
                  type = "rare"
                  for (i in rare) {
                    cat.push(rare[i])
                  }
                } else {
                  type = "mythic"
                  for (i in mythic) {
                    cat.push(mythic[i])
                  }
                }
                let chosen = choose(cat)
                if (!player[this.layer].bonusLevels[chosen].gte(layers.t.buyables[chosen].bonusCap())) {
                  player[this.layer].bonusLevels[chosen] = player[this.layer].bonusLevels[chosen].add(1)
                } else {
                  if (type == "normal") {
                    addPoints("scr", 5)
                  } else if (type == "rare") {
                    addPoints("scr", 25)
                  } else {
                    addPoints("scr", 500)
                  }
                }
                player.t.lastTreasureRolled = chosen
            },
        },
    },
        buyables: {
            rows: 4,
            cols: 4,
            11: {
                title: "Antimatter Cube", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(1.5, x)
                    return {
                      bricks: cost.floor()
                    }
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    x = x.add(player[this.layer].bonusLevels[this.id])
                    if (!new Decimal(player[this.layer].bonusLevels[this.id]).gte(1)) return new Decimal(1)
                    let eff = Decimal.pow(7.5, x)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + formatWhole(data.cost.bricks) + " <img src='bricks.png'></img>\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id].add(1)) + "/"+ formatWhole(tmp[this.layer].buyables[this.id].cap.add(1)) + 
                    (player[this.layer].bonusLevels[this.id].gt(1) ? "+" + formatWhole(player[this.layer].bonusLevels[this.id].sub(1))+ "/"+ formatWhole(tmp[this.layer].buyables[this.id].bonusCap.sub(1)) : "")
                    + "\n\
                    Multiplies point gain by "+ format(data.effect)+`x. (Basic effect 7.5x.)\n\
                    <br><i>"It's contained within a pandimensional crystal."</i>`
                },
                unlocked() { return player[this.layer].bonusLevels[this.id].gte(1) }, 
                cap() {
                    let cap = new Decimal(29)
                    return cap
                },
                bonusCap() {
                    let cap = new Decimal(61)
                    return cap
                },
                canAfford() {
                    return player[this.layer].bricks.gte(tmp[this.layer].buyables[this.id].cost.bricks) && player[this.layer].buyables[this.id].lte(tmp[this.layer].buyables[this.id].cap.sub(1))
                },
                buy() { 
                    if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return;
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].bricks = player[this.layer].bricks.sub(cost.bricks)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return { 'background-color': "#77bf5f", 'height':'190px', 'width':'190px' }
                   return { 'height':'190px', 'width':'190px'}
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            12: {
                title: "Acquirement Magnet", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(1.5, x)
                    return {
                      magnets: cost.floor()
                    }
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    x = x.add(player[this.layer].bonusLevels[this.id])
                    if (!new Decimal(player[this.layer].bonusLevels[this.id]).gte(1)) return new Decimal(0)
                    let eff = Decimal.div(x, 5)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + formatWhole(data.cost.magnets) + " <img src='magnets.png'></img>\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id].add(1)) + "/"+ formatWhole(tmp[this.layer].buyables[this.id].cap.add(1)) + 
                    (player[this.layer].bonusLevels[this.id].gt(1) ? "+" + formatWhole(player[this.layer].bonusLevels[this.id].sub(1))+ "/"+ formatWhole(tmp[this.layer].buyables[this.id].bonusCap.sub(1)) : "")
                    + "\n\
                    Increases the chance of gaining a normal resource by "+ format(data.effect)+`%. (+0.2% chance additively.)\n\
                    <br><i>"Brotip: use magnets for faster acquiring."</i>`
                },
                unlocked() { return player[this.layer].bonusLevels[this.id].gte(1) }, 
                cap() {
                    let cap = new Decimal(19)
                    return cap
                },
                bonusCap() {
                    let cap = new Decimal(31)
                    return cap
                },
                canAfford() {
                    return player[this.layer].magnets.gte(tmp[this.layer].buyables[this.id].cost.magnets) && player[this.layer].buyables[this.id].lte(tmp[this.layer].buyables[this.id].cap.sub(1))
                },
                buy() { 
                    if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return;
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].magnets = player[this.layer].magnets.sub(cost.magnets)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return { 'background-color': "#77bf5f", 'height':'190px', 'width':'190px' }
                   return { 'height':'190px', 'width':'190px'}
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            13: {
                title: "Cursor", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(1.5, x)
                    return {
                      tires: cost.floor()
                    }
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    x = x.add(player[this.layer].bonusLevels[this.id])
                    if (!new Decimal(player[this.layer].bonusLevels[this.id]).gte(1)) return new Decimal(1)
                    let eff = Decimal.div(x, 100).add(1.09)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + formatWhole(data.cost.tires) + " <img src='tires.png'></img>\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id].add(1)) + "/"+ formatWhole(tmp[this.layer].buyables[this.id].cap.add(1)) + 
                    (player[this.layer].bonusLevels[this.id].gt(1) ? "+" + formatWhole(player[this.layer].bonusLevels[this.id].sub(1))+ "/"+ formatWhole(tmp[this.layer].buyables[this.id].bonusCap.sub(1)) : "")
                    + "\n\
                    Multiplies auto-merge speed by "+ format(data.effect)+`x. (+0.01x speed additively, 1.1x base.)\n\
                    <br><i>"It smells of cookies."</i>`
                },
                unlocked() { return player[this.layer].bonusLevels[this.id].gte(1) }, 
                cap() {
                    let cap = new Decimal(29)
                    return cap
                },
                bonusCap() {
                    let cap = new Decimal(51)
                    return cap
                },
                canAfford() {
                    return player[this.layer].tires.gte(tmp[this.layer].buyables[this.id].cost.tires) && player[this.layer].buyables[this.id].lte(tmp[this.layer].buyables[this.id].cap.sub(1))
                },
                buy() { 
                    if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return;
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].tires = player[this.layer].tires.sub(cost.tires)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return { 'background-color': "#77bf5f", 'height':'190px', 'width':'190px' }
                   return { 'height':'190px', 'width':'190px'}
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            14: {
                title: "Replication Galaxy", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(1.2, x).mul(3)
                    let cost2 = Decimal.pow(1.5, x)
                    return {
                      stars: cost.floor(),
                      meteorites: cost2.floor()
                    }
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    x = x.add(player[this.layer].bonusLevels[this.id])
                    if (!new Decimal(player[this.layer].bonusLevels[this.id]).gte(1)) return new Decimal(1)
                    let eff = Decimal.pow(1.1, x)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + formatWhole(data.cost.stars) + " <img src='stars.png'></img> " + formatWhole(data.cost.meteorites) + " <img src='meteorite.png'></img>\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id].add(1)) + "/"+ formatWhole(tmp[this.layer].buyables[this.id].cap.add(1)) + 
                    (player[this.layer].bonusLevels[this.id].gt(1) ? "+" + formatWhole(player[this.layer].bonusLevels[this.id].sub(1))+ "/"+ formatWhole(tmp[this.layer].buyables[this.id].bonusCap.sub(1)) : "")
                    + "\n\
                    Multiplies gilded auto-merge speed by "+ format(data.effect)+`x. (1.1x speed.)\n\
                    <br><i>"The longer you stare at it, the brighter it glows."</i>`
                },
                unlocked() { return player[this.layer].bonusLevels[this.id].gte(1) }, 
                cap() {
                    let cap = new Decimal(29)
                    return cap
                },
                bonusCap() {
                    let cap = new Decimal(51)
                    return cap
                },
                canAfford() {
                    return player[this.layer].stars.gte(tmp[this.layer].buyables[this.id].cost.stars) && player[this.layer].meteorites.gte(tmp[this.layer].buyables[this.id].cost.meteorites) && player[this.layer].buyables[this.id].lte(tmp[this.layer].buyables[this.id].cap.sub(1))
                },
                buy() { 
                    if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return;
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].stars = player[this.layer].stars.sub(cost.stars)	
                    player[this.layer].meteorites = player[this.layer].meteorites.sub(cost.meteorites)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return { 'background-color': "#77bf5f", 'height':'190px', 'width':'190px' }
                   if (!tmp[this.layer].buyables[this.id].canAfford) return { 'background-color': "#946e53", 'height':'190px', 'width':'190px' }
                   return { 'background-color': "#fac04d", 'height':'190px', 'width':'190px'}
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            21: {
                title: "Time Shard", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(1.5, x)
                    return {
                      crystals: cost.floor()
                    }
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    x = x.add(player[this.layer].bonusLevels[this.id])
                    if (!new Decimal(player[this.layer].bonusLevels[this.id]).gte(1)) return new Decimal(1)
                    let eff = Decimal.add(1, x.div(50))
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + formatWhole(data.cost.crystals) + " <img src='crystals.png'></img>\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id].add(1)) + "/"+ formatWhole(tmp[this.layer].buyables[this.id].cap.add(1)) + 
                    (player[this.layer].bonusLevels[this.id].gt(1) ? "+" + formatWhole(player[this.layer].bonusLevels[this.id].sub(1))+ "/"+ formatWhole(tmp[this.layer].buyables[this.id].bonusCap.sub(1)) : "")
                    + "\n\
                    Multiplies auto-merge speed by "+ format(data.effect)+`x after 5 seconds of not merging. (x0.02 additively, x1.02 base.)\n\
                    <br><i>"Time bends around it."</i>`
                },
                unlocked() { return player[this.layer].bonusLevels[this.id].gte(1) }, 
                cap() {
                    let cap = new Decimal(29)
                    return cap
                },
                bonusCap() {
                    let cap = new Decimal(61)
                    return cap
                },
                canAfford() {
                    return player[this.layer].crystals.gte(tmp[this.layer].buyables[this.id].cost.crystals) && player[this.layer].buyables[this.id].lte(tmp[this.layer].buyables[this.id].cap.sub(1))
                },
                buy() { 
                    if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return;
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].crystals = player[this.layer].crystals.sub(cost.crystals)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return { 'background-color': "#77bf5f", 'height':'190px', 'width':'190px' }
                   return { 'height':'190px', 'width':'190px'}
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            22: {
                title: "Beehive", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(1.8, x)
                    return {
                      bones: cost.floor()
                    }
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    x = x.add(player[this.layer].bonusLevels[this.id])
                    if (!new Decimal(player[this.layer].bonusLevels[this.id]).gte(1)) return new Decimal(1)
                    let eff = Decimal.pow(1.25, x)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + formatWhole(data.cost.bones) + " <img src='bones.png'></img>\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id].add(1)) + "/"+ formatWhole(tmp[this.layer].buyables[this.id].cap.add(1)) + 
                    (player[this.layer].bonusLevels[this.id].gt(1) ? "+" + formatWhole(player[this.layer].bonusLevels[this.id].sub(1))+ "/"+ formatWhole(tmp[this.layer].buyables[this.id].bonusCap.sub(1)) : "")
                    + "\n\
                    Multiplies work gain by "+ format(data.effect)+`x. (x1.25 boost.)\n\
                    <br><i>"There is a psychic energy coming from the beehive."</i>`
                },
                unlocked() { return player[this.layer].bonusLevels[this.id].gte(1) }, 
                cap() {
                    let cap = new Decimal(49)
                    return cap
                },
                bonusCap() {
                    let cap = new Decimal(61)
                    return cap
                },
                canAfford() {
                    return player[this.layer].bones.gte(tmp[this.layer].buyables[this.id].cost.bones) && player[this.layer].buyables[this.id].lte(tmp[this.layer].buyables[this.id].cap.sub(1))
                },
                buy() { 
                    if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return;
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].bones = player[this.layer].bones.sub(cost.bones)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return { 'background-color': "#77bf5f", 'height':'190px', 'width':'190px' }
                   return { 'height':'190px', 'width':'190px'}
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            23: {
                title: "Infinite Layer Cake", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(1.8, x)
                    let cost2 = Decimal.pow(1.2, x)
                    return {
                      crystals: cost.floor(),
                      meteorites: cost2.floor()
                    }
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    x = x.add(player[this.layer].bonusLevels[this.id])
                    if (!new Decimal(player[this.layer].bonusLevels[this.id]).gte(1)) return new Decimal(1)
                    let eff = Decimal.pow(2, x)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + formatWhole(data.cost.crystals) + " <img src='crystals.png'></img>" + formatWhole(data.cost.meteorites) + " <img src='meteorite.png'></img>\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id].add(1)) + "/"+ formatWhole(tmp[this.layer].buyables[this.id].cap.add(1)) + 
                    (player[this.layer].bonusLevels[this.id].gt(1) ? "+" + formatWhole(player[this.layer].bonusLevels[this.id].sub(1))+ "/"+ formatWhole(tmp[this.layer].buyables[this.id].bonusCap.sub(1)) : "")
                    + "\n\
                    Cheapens Gilded Mergeables by "+ format(data.effect)+`x. (x2 boost.)\n\
                    <br><i>"Every time you cut into it, it regenerates."</i>`
                },
                unlocked() { return player[this.layer].bonusLevels[this.id].gte(1) }, 
                cap() {
                    let cap = new Decimal(39)
                    return cap
                },
                bonusCap() {
                    let cap = new Decimal(61)
                    return cap
                },
                canAfford() {
                    return player[this.layer].crystals.gte(tmp[this.layer].buyables[this.id].cost.crystals) && player[this.layer].meteorites.gte(tmp[this.layer].buyables[this.id].cost.meteorites) && player[this.layer].buyables[this.id].lte(tmp[this.layer].buyables[this.id].cap.sub(1))
                },
                buy() { 
                    if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return;
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].crystals = player[this.layer].crystals.sub(cost.crystals)	
                    player[this.layer].meteorites = player[this.layer].meteorites.sub(cost.meteorites)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return { 'background-color': "#77bf5f", 'height':'190px', 'width':'190px' }
                   if (!tmp[this.layer].buyables[this.id].canAfford) return { 'background-color': "#946e53", 'height':'190px', 'width':'190px' }
                   return { 'background-color': "#fac04d", 'height':'190px', 'width':'190px'}
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            24: {
                title: "The Button", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(3, x).div(3)
                    return {
                      beams: cost.floor()
                    }
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    x = x.add(player[this.layer].bonusLevels[this.id])
                    if (!new Decimal(player[this.layer].bonusLevels[this.id]).gte(1)) return new Decimal(0)
                    let eff = x
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + formatWhole(data.cost.beams) + " <img src='steelbeams.png'></img>\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id].add(1)) + "/"+ formatWhole(tmp[this.layer].buyables[this.id].cap.add(1)) + 
                    (player[this.layer].bonusLevels[this.id].gt(1) ? "+" + formatWhole(player[this.layer].bonusLevels[this.id].sub(1))+ "/"+ formatWhole(tmp[this.layer].buyables[this.id].bonusCap.sub(1)) : "")
                    + "\n\
                    Increases the chance of gaining a Grimoire "+ format(data.effect)+`%. (+1% chance additively.)\n\
                    <br><i>"Don't press it.."</i>`
                },
                unlocked() { return player[this.layer].bonusLevels[this.id].gte(1) }, 
                cap() {
                    let cap = new Decimal(9)
                    return cap
                },
                bonusCap() {
                    let cap = new Decimal(21)
                    return cap
                },
                canAfford() {
                    return player[this.layer].beams.gte(tmp[this.layer].buyables[this.id].cost.beams) && player[this.layer].buyables[this.id].lte(tmp[this.layer].buyables[this.id].cap.sub(1))
                },
                buy() { 
                    if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return;
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].beams = player[this.layer].beams.sub(cost.beams)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return { 'background-color': "#77bf5f", 'height':'190px', 'width':'190px' }
                   return { 'height':'190px', 'width':'190px'}
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            31: {
                title: "Acceleron", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(1.6, x)
                    let cost2 = Decimal.pow(1.4, x)
                    return {
                      stars: cost.floor(),
                      tires: cost2.floor()
                    }
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    x = x.add(player[this.layer].bonusLevels[this.id])
                    if (!new Decimal(player[this.layer].bonusLevels[this.id]).gte(1)) return new Decimal(1)
                    let eff = Decimal.pow(1.1, x)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + formatWhole(data.cost.stars) + " <img src='stars.png'></img>" + formatWhole(data.cost.tires) + " <img src='tires.png'></img>\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id].add(1)) + "/"+ formatWhole(tmp[this.layer].buyables[this.id].cap.add(1)) + 
                    (player[this.layer].bonusLevels[this.id].gt(1) ? "+" + formatWhole(player[this.layer].bonusLevels[this.id].sub(1))+ "/"+ formatWhole(tmp[this.layer].buyables[this.id].bonusCap.sub(1)) : "")
                    + "\n\
                    Multiplies Merge Token gain by "+ format(data.effect)+`x. (x1.1 boost.)\n\
                    <br><i>"It seems to build up speed as it moves."</i>`
                },
                unlocked() { return player[this.layer].bonusLevels[this.id].gte(1) }, 
                cap() {
                    let cap = new Decimal(39)
                    return cap
                },
                bonusCap() {
                    let cap = new Decimal(61)
                    return cap
                },
                canAfford() {
                    return player[this.layer].stars.gte(tmp[this.layer].buyables[this.id].cost.stars) && player[this.layer].tires.gte(tmp[this.layer].buyables[this.id].cost.tires) && player[this.layer].buyables[this.id].lte(tmp[this.layer].buyables[this.id].cap.sub(1))
                },
                buy() { 
                    if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return;
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].stars = player[this.layer].stars.sub(cost.stars)	
                    player[this.layer].tires = player[this.layer].tires.sub(cost.tires)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return { 'background-color': "#77bf5f", 'height':'190px', 'width':'190px' }
                   if (!tmp[this.layer].buyables[this.id].canAfford) return { 'background-color': "#946e53", 'height':'190px', 'width':'190px' }
                   return { 'background-color': "#fac04d", 'height':'190px', 'width':'190px'}
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            32: {
                title: "Calculator", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(1.6, x)
                    return {
                      stars: cost.floor(),
                    }
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    x = x.add(player[this.layer].bonusLevels[this.id])
                    if (!new Decimal(player[this.layer].bonusLevels[this.id]).gte(1)) return new Decimal(1)
                    let eff = x
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + formatWhole(data.cost.stars) + " <img src='stars.png'></img>\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id].add(1)) + "/"+ formatWhole(tmp[this.layer].buyables[this.id].cap.add(1)) + 
                    (player[this.layer].bonusLevels[this.id].gt(1) ? "+" + formatWhole(player[this.layer].bonusLevels[this.id].sub(1))+ "/"+ formatWhole(tmp[this.layer].buyables[this.id].bonusCap.sub(1)) : "")
                    + "\n\
                    Adds "+ formatWhole(data.effect)+` upgrades to all outer Merge Token upgrades.. (+1 additively.)\n\
                    <br><i>"It's making a loud whirring noise."</i>`
                },
                unlocked() { return player[this.layer].bonusLevels[this.id].gte(1) }, 
                cap() {
                    let cap = new Decimal(29)
                    return cap
                },
                bonusCap() {
                    let cap = new Decimal(51)
                    return cap
                },
                canAfford() {
                    return player[this.layer].stars.gte(tmp[this.layer].buyables[this.id].cost.stars) && player[this.layer].buyables[this.id].lte(tmp[this.layer].buyables[this.id].cap.sub(1))
                },
                buy() { 
                    if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return;
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].stars = player[this.layer].stars.sub(cost.stars)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return { 'background-color': "#77bf5f", 'height':'190px', 'width':'190px' }
                   if (!tmp[this.layer].buyables[this.id].canAfford) return { 'height':'190px', 'width':'190px' }
                   return { 'height':'190px', 'width':'190px'}
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            33: {
                title: "(softcapped)", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(1.2, x).mul(3)
                    let cost2 = Decimal.pow(1.5, x)
                    return {
                      magnets: cost.floor(),
                      bones: cost2.floor()
                    }
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    x = x.add(player[this.layer].bonusLevels[this.id])
                    if (!new Decimal(player[this.layer].bonusLevels[this.id]).gte(1)) return new Decimal(1)
                    let eff = Decimal.sub(1, x.div(100))
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + formatWhole(data.cost.magnets) + " <img src='magnets.png'></img> " + formatWhole(data.cost.bones) + " <img src='bones.png'></img>\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id].add(1)) + "/"+ formatWhole(tmp[this.layer].buyables[this.id].cap.add(1)) + 
                    (player[this.layer].bonusLevels[this.id].gt(1) ? "+" + formatWhole(player[this.layer].bonusLevels[this.id].sub(1))+ "/"+ formatWhole(tmp[this.layer].buyables[this.id].bonusCap.sub(1)) : "")
                    + "\n\
                    Reduces the work nerf to points by ^"+ format(data.effect)+`. (^0.01 reduction per level.)\n\
                    <br><i>"You can feel the softcap working with you."</i>`
                },
                unlocked() { return player[this.layer].bonusLevels[this.id].gte(1) }, 
                cap() {
                    let cap = new Decimal(19)
                    return cap
                },
                bonusCap() {
                    let cap = new Decimal(31)
                    return cap
                },
                canAfford() {
                    return player[this.layer].magnets.gte(tmp[this.layer].buyables[this.id].cost.magnets) && player[this.layer].bones.gte(tmp[this.layer].buyables[this.id].cost.bones) && player[this.layer].buyables[this.id].lte(tmp[this.layer].buyables[this.id].cap.sub(1))
                },
                buy() { 
                    if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return;
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].magnets = player[this.layer].magnets.sub(cost.magnets)	
                    player[this.layer].bones = player[this.layer].bones.sub(cost.bones)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return { 'background-color': "#77bf5f", 'height':'190px', 'width':'190px' }
                   if (!tmp[this.layer].buyables[this.id].canAfford) return { 'background-color': "#946e53", 'height':'190px', 'width':'190px' }
                   return { 'background-color': "#fac04d", 'height':'190px', 'width':'190px'}
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            34: {
                title: "Hibiscus", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(1.6, x).mul(3)
                    let cost2 = Decimal.pow(1.9, x)
                    let cost3 = Decimal.pow(1.6, x).mul(1.5)
                    return {
                      meteorites: cost.floor(),
                      bones: cost2.floor(),
                      stars: cost3.floor()
                    }
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    x = x.add(player[this.layer].bonusLevels[this.id])
                    if (!new Decimal(player[this.layer].bonusLevels[this.id]).gte(1)) return new Decimal(1)
                    let eff = Decimal.add(1, x.div(10))
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + formatWhole(data.cost.meteorites) + " <img src='meteorite.png'></img> " + formatWhole(data.cost.bones) + " <img src='bones.png'></img> " + formatWhole(data.cost.stars) + " <img src='stars.png'></img>\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id].add(1)) + "/"+ formatWhole(tmp[this.layer].buyables[this.id].cap.add(1)) + 
                    (player[this.layer].bonusLevels[this.id].gt(1) ? "+" + formatWhole(player[this.layer].bonusLevels[this.id].sub(1))+ "/"+ formatWhole(tmp[this.layer].buyables[this.id].bonusCap.sub(1)) : "")
                    + "\n\
                    Auto-merges are "+ format(data.effect)+`x faster.\n\
                    <br><i>"It releases a time-consuming aura."</i>`
                },
                unlocked() { return player[this.layer].bonusLevels[this.id].gte(1) }, 
                cap() {
                    let cap = new Decimal(19)
                    return cap
                },
                bonusCap() {
                    let cap = new Decimal(19)
                    return cap
                },
                canAfford() {
                    return player[this.layer].meteorites.gte(tmp[this.layer].buyables[this.id].cost.meteorites) && player[this.layer].bones.gte(tmp[this.layer].buyables[this.id].cost.bones) && player[this.layer].stars.gte(tmp[this.layer].buyables[this.id].cost.stars) && player[this.layer].buyables[this.id].lte(tmp[this.layer].buyables[this.id].cap.sub(1))
                },
                buy() { 
                    if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return;
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].meteorites = player[this.layer].meteorites.sub(cost.meteorites)	
                    player[this.layer].bones = player[this.layer].bones.sub(cost.bones)	
                    player[this.layer].stars = player[this.layer].stars.sub(cost.stars)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return { 'background-color': "#77bf5f", 'height':'190px', 'width':'190px', 'border-color': '#ddff00', 'border-width':'10px' }
                   if (!tmp[this.layer].buyables[this.id].canAfford) return { 'background-color': "#946e53", 'height':'190px', 'width':'190px', 'border-color': '#ddff00', 'border-width':'10px' }
                   return { 'background-color': "#fac04d", 'height':'190px', 'width':'190px', 'border-color': '#ddff00', 'border-width':'10px'}
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
        },
        branches: ["p", "g"],
  update(diff) {
    if (hasMilestone("sc", 10)) {
      player[this.layer].unlocked = true
    }
  },
        tabFormat: {
            Treasures: {
                buttonStyle() {return  {'color': 'orange'}},
                content:
                    ["main-display",
                    "prestige-button", "resource-display",
                    ["blank", "5px"],
                     ["bar", "longBoi"],
                    ["blank", "10px"], // Height
                     ["display-text", function() { return "You have a "+format(getGrimoireGainRate())+"% chance to get a Grimoire each time you perform a gilded merge."}],
                     ["blank", "10px"],
                    "h-line",
                    ["blank", "5px"],
                     ["row", [["display-image", "bricks.png"], ["display-text", function() { return formatWhole(player.t.bricks) + "  " }], 
                     ["blank", "10px"],
                     ["display-image", "tires.png"], ["display-text", function() { return formatWhole(player.t.tires) + "  " }],  
                     ["blank", "10px"],
                     ["display-image", "steelbeams.png"], ["display-text", function() { return formatWhole(player.t.beams) + "  " }],  
                     ["blank", "10px"],
                     ["display-image", "meteorite.png"], ["display-text", function() { return formatWhole(player.t.meteorites) + "  " }]
                     ]],
                     ["row", [["display-image", "bones.png"], ["display-text", function() { return formatWhole(player.t.bones) + "  " }],  
                     ["blank", "10px"],
                     ["display-image", "crystals.png"], ["display-text", function() { return formatWhole(player.t.crystals) + "  " }],  
                     ["blank", "10px"],
                     ["display-image", "stars.png"], ["display-text", function() { return formatWhole(player.t.stars) + "  " }],  
                     ["blank", "10px"],
                     ["display-image", "magnets.png"], ["display-text", function() { return formatWhole(player.t.magnets) + "  " }]
                     ]],
                     ["display-text", function() { return "You have a "+format(getAcquireResourceRate())+"% chance to get a Normal Resource each time you perform a normal merge."}],
                     ["display-text", function() { if (player.t.lastTreasureRolled) return "The last treasure rolled is "+layers.t.buyables[player.t.lastTreasureRolled].title+"."}],
                     "clickables",
                     "buyables"
                     ],
            },
            Powers: {
                buttonStyle() {return  {'color': 'orange'}},
                unlocked() {return hasMilestone("sc", 14)},
                content:
                    ["main-display",
                    "prestige-button", "resource-display",
                    ["blank", "5px"],
                     ["bar", "longBoi"],
                    ["blank", "10px"], // Height
                     ["display-text", function() { return "You have a "+format(getGrimoireGainRate())+"% chance to get a Grimoire each time you perform a gilded merge."}],
                     ["blank", "10px"],
                    "h-line",
                    ["blank", "5px"],
                     ["row", [["display-image", "bricks.png"], ["display-text", function() { return formatWhole(player.t.bricks) + "  " }], 
                     ["blank", "10px"],
                     ["display-image", "tires.png"], ["display-text", function() { return formatWhole(player.t.tires) + "  " }],  
                     ["blank", "10px"],
                     ["display-image", "steelbeams.png"], ["display-text", function() { return formatWhole(player.t.beams) + "  " }],  
                     ["blank", "10px"],
                     ["display-image", "meteorite.png"], ["display-text", function() { return formatWhole(player.t.meteorites) + "  " }]
                     ]],
                     ["row", [["display-image", "bones.png"], ["display-text", function() { return formatWhole(player.t.bones) + "  " }],  
                     ["blank", "10px"],
                     ["display-image", "crystals.png"], ["display-text", function() { return formatWhole(player.t.crystals) + "  " }],  
                     ["blank", "10px"],
                     ["display-image", "stars.png"], ["display-text", function() { return formatWhole(player.t.stars) + "  " }],  
                     ["blank", "10px"],
                     ["display-image", "magnets.png"], ["display-text", function() { return formatWhole(player.t.magnets) + "  " }]
                     ]],
                     ["display-text", function() { return "You have a "+format(getAcquireResourceRate())+"% chance to get a Normal Resource each time you perform a normal merge."}],
                     ["layer-proxy", ["tu", "buyables"]]
                     ],
            },
        },
  layerShown() { return hasMilestone("sc", 9) }
})


addLayer("scr", {
  name: "scrap", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
      best: new Decimal(0),
      currentMerge: null,
      timeSinceLastAMerge: 0,
      timeSinceLastMergeable: 0,
      clickables: { [11]: new Decimal(0), [12]: new Decimal(0), [13]: new Decimal(0),
      [21]: new Decimal(0), [22]: new Decimal(0), [23]: new Decimal(0),
      [31]: new Decimal(0), [32]: new Decimal(0), [33]: new Decimal(0) } // Optional default Clickable state
    }
  },
  image:"aptmamscrap.png",
  color: "#cccccc",
  requires: new Decimal(100000), // Can be a function that takes requirement increases into account
  resource: "scrap", // Name of prestige currency
  baseResource: "Mergeable Score", // Name of resource prestige is based on
  baseAmount() { return player.sc.points }, // Get the current amount of baseResource
  type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.95, // Prestige currency exponent
  gainMult() { // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1)
    return mult
  },
  gainExp() { // Calculate the exponent on main currency from bonuses
    return new Decimal(1)
  },
  row: 2, // Row the layer is in on the tree (0 is the first row)
  mergeableRate() {
    let c = 60
    c -= (buyableEffect("scr", 22).toNumber())
    return c
  },
  update(diff) {
    player.scr.timeSinceLastMergeable += diff
    if (player.scr.timeSinceLastMergeable >= layers.scr.mergeableRate() && player.scr.best.gte(1)) {
      for (i in player.scr.clickables) {
        if (player.scr.clickables[i].eq(0)) {
          setClickableState("scr", i, getHighestShit("scr"))
          player.scr.timeSinceLastMergeable = 0
          return
        }
      }
      player.scr.timeSinceLastMergeable = 0
    }
    addPoints(this.layer, getScrapGain().div(60).mul(diff))
  },
  clickables: {
    rows: 3,
    cols: 3,
    11: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return ""
        }
        return "Producing +" + formatWhole(this.power()) + " scrap each minute."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = Decimal.pow(3, data.sub(1))
        return effect
      },
      unlocked() { return true },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#b8c8e3" }
      },
    },
    12: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return ""
        }
        return "Producing +" + formatWhole(this.power()) + " scrap each minute."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = Decimal.pow(3, data.sub(1))
        return effect
      },
      unlocked() { return true },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#b8c8e3" }
      },
    },
    13: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return ""
        }
        return "Producing +" + formatWhole(this.power()) + " scrap each minute."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = Decimal.pow(3, data.sub(1))
        return effect
      },
      unlocked() { return true },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#b8c8e3" }
      },
    },
    21: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return ""
        }
        return "Producing +" + formatWhole(this.power()) + " scrap each minute."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = Decimal.pow(3, data.sub(1))
        return effect
      },
      unlocked() { return true },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#b8c8e3" }
      },
    },
    22: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return ""
        }
        return "Producing +" + formatWhole(this.power()) + " scrap each minute."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = Decimal.pow(3, data.sub(1))
        return effect
      },
      unlocked() { return true },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#b8c8e3" }
      },
    },
    23: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return ""
        }
        return "Producing +" + formatWhole(this.power()) + " scrap each minute."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = Decimal.pow(3, data.sub(1))
        return effect
      },
      unlocked() { return true },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#b8c8e3" }
      },
    },
    31: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return ""
        }
        return "Producing +" + formatWhole(this.power()) + " scrap each minute."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = Decimal.pow(3, data.sub(1))
        return effect
      },
      unlocked() { return true },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#b8c8e3" }
      },
    },
    32: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return ""
        }
        return "Producing +" + formatWhole(this.power()) + " scrap each minute."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = Decimal.pow(3, data.sub(1))
        return effect
      },
      unlocked() { return true },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#b8c8e3" }
      },
    },
    33: {
      title() {
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getTier(this.layer, this.id)
        if (data == 0) {
          return ""
        }
        return "Producing +" + formatWhole(this.power()) + " scrap each minute."
      },
      power() {
        let data = getTier(this.layer, this.id)
        let effect = Decimal.pow(3, data.sub(1))
        return effect
      },
      unlocked() { return true },
      canClick() {
        return true
      },
      onClick() {
       clickAFuckingMergeable(this.layer, this.id)
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#b8c8e3" }
      },
    },
  },
        buyables: {
            rows: 2,
            cols: 2,
            11: {
                title: "More Points", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(1)
                    cost = cost.mul(Decimal.pow(4, x))
                    return cost.floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.pow(12, x)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " scrap\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id]) + "/"+ formatWhole(50) + "\n\
                    Multiplies Point gain by "+ formatWhole(data.effect)+"x."
                },
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) && player[this.layer].buyables[this.id].lte(49)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(50)) return { 'background-color': "#77bf5f" }
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            12: {
                title: "More Work", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(1)
                    cost = cost.mul(Decimal.pow(6, x))
                    return cost.floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.add(1, Decimal.div(x, 10))
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " scrap\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id]) + "/"+ formatWhole(15) + "\n\
                    Raises the gain of Work to ^"+ format(data.effect)+"."
                },
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) && player[this.layer].buyables[this.id].lte(14)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(15)) return { 'background-color': "#77bf5f" }
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            21: {
                title: "Faster Auto-Merge", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(1)
                    cost = cost.mul(Decimal.pow(4, x))
                    return cost.floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.mul(1, Decimal.pow(1.1, x))
                    return eff;
                },
                unlocked() {
                  return hasMilestone("sc", 6)
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " scrap\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id]) + "/"+ formatWhole(25) + "\n\
                    Auto-merge and gilded auto-merge is "+ format(data.effect)+"x faster."
                },
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) && player[this.layer].buyables[this.id].lte(9)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(25)) return { 'background-color': "#77bf5f" }
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
            22: {
                title: "Faster Scrap Mergeables", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(1)
                    cost = cost.mul(Decimal.pow(2, x))
                    return cost.floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = x.mul(2)
                    return eff;
                },
                unlocked() {
                  return hasMilestone("sc", 6)
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " scrap\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id]) + "/"+ formatWhole(29) + "\n\
                    Scrap Mergeables spawn "+ formatTime(data.effect)+" faster."
                },
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) && player[this.layer].buyables[this.id].lte(28)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(29)) return { 'background-color': "#77bf5f" }
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
        },
        bars: {
            longBoi: {
                fillStyle: {'background-color' : "#8a989c"},
                baseStyle: {'background-color' : "#2e4045"},
                textStyle: {'color': '#5c6466'},

                borderStyle() {return {}},
                direction: RIGHT,
                width: 500,
                height: 50,
                progress() {
                    return (player[this.layer].timeSinceLastMergeable / (layers.scr.mergeableRate()))
                },
                display() {
                    return formatTime(player[this.layer].timeSinceLastMergeable) + " / " + formatTime(layers.scr.mergeableRate()) + " to next Scrap Mergeable"
                },
                unlocked: true,

            },
        },
        branches: ["t"],
        tabFormat: {
            Upgrades: {
                buttonStyle() {return  {'color': 'orange'}},
                content:
                    ["main-display",
                    "resource-display",
                    ["blank", "5px"], // Height
                    "h-line",
                    ["blank", "5px"],
                     "buyables"],
            },
            Mergeables: {
                buttonStyle() {return {'border-color': 'orange'}},
                unlocked() {return hasMilestone("sc", 7)},
                content:
                    ["main-display",
                    "resource-display",
                    ["blank", "5px"], // Height
                    "h-line",
                    ["blank", "5px"],
                     "clickables",
                    ["blank", "15px"],
                    ["bar", "longBoi"]
                    ]
            },

        },
  layerShown() { return player.scr.best.gt(0) }
})

addLayer("sc", {
        startData() { return {
            unlocked: true,
			      points: new Decimal(0),
		      	best: new Decimal(0),
        }},
        color: "yellow",
        resource: "Mergeable Score", 
        row: "side",
        type: "none",
        tooltip() { // Optional, tooltip displays when the layer is locked
            return ("Mergeable Score")
        },
        update(diff) {
          player[this.layer].points = new Decimal(0)
          for (var i in player.p.clickables) {
            if (!new Decimal(getTier("p", i)).eq(0)) {
              player[this.layer].points = player[this.layer].points.add(Decimal.pow(3, getTier("p", i)))
            }
          }
        	player[this.layer].best = player[this.layer].best.max(player[this.layer].points)
        },
        milestones: {
            0: {requirementDescription: "250 Mergeable Score",
                done() {return player[this.layer].best.gte(250)}, // Used to determine when to give the milestone
                effectDescription: "Unlock two upgrades.",
            },
            1: {requirementDescription: "1,500 Mergeable Score",
                unlocked() {return hasMilestone(this.layer, 0)},
                done() {return player[this.layer].best.gte(1500)},
                effectDescription: "Unlock Auto-Buyer. Auto-Buyer will automatically buy any empty Mergeable slots.",
                toggles: [
                    ["automation", "p", "autoBuyerOn"]],
            },
            2: {requirementDescription: "8,000 Mergeable Score",
                unlocked() {return hasMilestone(this.layer, 1)},
                done() {return player[this.layer].best.gte(8000)},
                effectDescription: function() { return "Unlock Auto-Merge. Auto-Merge will automatically merge all viable Mergeables once every "+formatTime(getImprovedAutoMergeSpeed("p"))+"." },
                toggles: [
                    ["automation", "p", "autoMergeOn"]],
            },
            3: {requirementDescription: "33,333 Mergeable Score",
                unlocked() {return hasMilestone(this.layer, 2)},
                done() {return player[this.layer].best.gte(33333)},
                effectDescription: "You passively gain 25% of potential work each second.",
                toggles: [
                    ["automation", "p", "autoWorkOn"]],
            },
            4: {requirementDescription: "100,000 Mergeable Score",
                unlocked() {return hasMilestone(this.layer, 3)},
                done() {return player[this.layer].best.gte(100000)}, // Used to determine when to give the milestone
                effectDescription: "Unlock Gilded Points.",
            },
            5: {requirementDescription: "250,000 Mergeable Score",
                unlocked() {return hasMilestone(this.layer, 4)},
                done() {return player[this.layer].best.gte(250000)},
                effectDescription: "Unlock automatic Merge Upgrades buyer.",
                toggles: [
                    ["automation", "p", "autoUpgradeOn"]],
            },
            6: {requirementDescription: "6,300,000 Mergeable Score",
                unlocked() {return hasMilestone(this.layer, 5)},
                done() {return player[this.layer].best.gte(6300000)}, // Used to determine when to give the milestone
                effectDescription: "Unlock two Gilded Upgrades.",
            },
            7: {requirementDescription: "100,000,000 Mergeable Score",
                unlocked() {return hasMilestone(this.layer, 6)},
                done() {return player[this.layer].best.gte(100000000)}, // Used to determine when to give the milestone
                effectDescription: "Unlock Gilded Mergeables.",
            },
            8: {requirementDescription: "2.5e12 Mergeable Score",
                unlocked() {return hasMilestone(this.layer, 7)},
                done() {return player[this.layer].best.gte(2.5e12)}, // Used to determine when to give the milestone
                effectDescription: "Unlock Merge Mastery.",
            },
            9: {requirementDescription: "1e13 Mergeable Score",
                unlocked() {return hasMilestone(this.layer, 8)},
                done() {return player[this.layer].best.gte(1e13)},
                effectDescription: "Unlock automatic Gilded Upgrades buyer.",
                toggles: [
                    ["automation", "g", "autoUpgradeOn"]],
            },
            10: {requirementDescription: "5e13 Mergeable Score",
                unlocked() {return hasMilestone(this.layer, 9)},
                done() {return player[this.layer].best.gte(5e13)}, // Used to determine when to give the milestone
                effectDescription: "Unlock Treasures.",
            },
            11: {requirementDescription: "7.5e13 Mergeable Score",
                unlocked() {return hasMilestone(this.layer, 10)},
                done() {return player[this.layer].best.gte(7.5e13)},
                effectDescription() {
                  return "Unlock automatic Gilded Auto-Merger. It runs every "+formatTime(getImprovedAutoMergeSpeed("g"))+"."
                },
                toggles: [
                    ["automation", "g", "autoMergeOn"]],
            },
            12: {requirementDescription: "9e13 Mergeable Score",
                unlocked() {return hasMilestone(this.layer, 10)},
                done() {return player[this.layer].best.gte(9e13)},
                effectDescription() {
                  return "Unlock automatic Gilded Mergeables Auto-Buyer."
                },
                toggles: [
                    ["automation", "g", "autoBuyerOn"]],
            },
            13: {requirementDescription: "2e14 Mergeable Score",
                unlocked() {return hasMilestone(this.layer, 10)},
                done() {return player[this.layer].best.gte(2e14)},
                effectDescription() {
                  return "You passively gain 25% of potential gilded points each second."
                },
                toggles: [
                    ["automation", "g", "autoGildOn"]],
            },
            14: {requirementDescription: "5e15 Mergeable Score",
                unlocked() {return hasMilestone(this.layer, 9)},
                done() {return player[this.layer].best.gte(5e15)}, // Used to determine when to give the milestone
                effectDescription: "Unlock Powers.",
            },
        },
        layerShown() { return player[this.layer].best.gt(0) }
    }, 
)
