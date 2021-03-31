function getHighestShit(layer) {
  let tier = new Decimal(1)
  tier = tier.add(buyableEffect("p", 11))
  switch(layer) {
    case "p":
      return tier
    case "g":
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
      return cost
  }
}

function merge(layer, id, merge, autoMerge=false) {
  let data = getClickableState(layer, id)
  if (data.lt(getHighestShit(layer))) return
  if (getClickableState(layer, (autoMerge?merge:player[layer].currentMerge)).eq(data)) {
    setClickableState(layer, (autoMerge?merge:player[layer].currentMerge), new Decimal(0))
    setClickableState(layer, id, data.add(1))
  }
  if (autoMerge != true) player[layer].currentMerge = null
}

function buyAMergable(layer, id) {
    if (!tmp[layer].clickables[id].unlocked) return
    if (player[layer].points.gte(getMergeableCost(layer))) {
      setClickableState(layer, id, getHighestShit(layer))
      player[layer].points = player[layer].points.sub(getMergeableCost(layer))
      if (player[layer].boughtMergeables) player[layer].boughtMergeables = player[layer].boughtMergeables.add(1)
    }
}

function clickAFuckingMergeable(layer, id) {
  let data = getClickableState(layer, id)
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

function getImprovedAutoMergeSpeed() {
  let speed = 10
  speed = speed / (buyableEffect("g", 21).toNumber())
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
      clickables: { [11]: new Decimal(0), [12]: new Decimal(0), [13]: new Decimal(0), [14]: new Decimal(0),
      [21]: new Decimal(0), [22]: new Decimal(0), [23]: new Decimal(0), [24]: new Decimal(0),
      [31]: new Decimal(0), [32]: new Decimal(0), [33]: new Decimal(0), [34]: new Decimal(0),
      [41]: new Decimal(0), [42]: new Decimal(0), [43]: new Decimal(0), [44]: new Decimal(0) } // Optional default Clickable state
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
    return mult
  },
  gainExp() { // Calculate the exponent on main currency from bonuses
    exp = new Decimal(1)
    exp = exp.mul(buyableEffect("g", 12))
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
    if(layers[resettingLayer].row > this.row) layerDataReset(this.layer, ["automation"]) // This is actually the default behavior
  },
  update(diff) {
    if (player.automation.p.autoMergeOn && hasMilestone("sc", 2)) {
      player.p.timeSinceLastAMerge = player.p.timeSinceLastAMerge + (diff)
      if (player.p.timeSinceLastAMerge >= getImprovedAutoMergeSpeed()) {
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
    cols: 4,
    11: {
      title() {
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getClickableState(this.layer, this.id)
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
        if (getClickableState(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#e05e5e" }
      },
    },
    12: {
      title() {
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getClickableState(this.layer, this.id)
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
        if (getClickableState(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#e3ad66" }
      },
    },
    13: {
      title() {
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getClickableState(this.layer, this.id)
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
        if (getClickableState(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#d6e063" }
      },
    },
    14: {
      title() {
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getClickableState(this.layer, this.id)
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
        if (getClickableState(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#ccd173" }
      },
    },
    21: {
      title() {
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getClickableState(this.layer, this.id)
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
        if (getClickableState(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#91e660" }
      },
    },
    22: {
      title() {
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getClickableState(this.layer, this.id)
        let effect = new Decimal(1.03)
        effect = effect.pow(data.pow(2))
        return effect
      },
      unlocked() { return player[this.layer].unlocked },
      canClick() {
        return true
      },
      onClick() {
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          buyAMergable(this.layer, this.id)
        } else if (player[this.layer].currentMerge != this.id && player[this.layer].currentMerge != null) {
          merge(this.layer, this.id)
        } else if (player[this.layer].currentMerge == this.id) {
          player[this.layer].currentMerge = null
        } else if (player[this.layer].currentMerge == null) {
          player[this.layer].currentMerge = this.id
        }
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getClickableState(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#33e857" }
      },
    },
    23: {
      title() {
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getClickableState(this.layer, this.id)
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
        if (getClickableState(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#33e8ac" }
      },
    },
    24: {
      title() {
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getClickableState(this.layer, this.id)
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
        if (getClickableState(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#8ec98d" }
      },
    },
    31: {
      title() {
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getClickableState(this.layer, this.id)
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
        if (getClickableState(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#33bee8" }
      },
    },
    32: {
      title() {
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getClickableState(this.layer, this.id)
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
        if (getClickableState(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#617fed" }
      },
    },
    33: {
      title() {
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getClickableState(this.layer, this.id)
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
        if (getClickableState(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#d16bcb" }
      },
    },
    34: {
      title() {
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getClickableState(this.layer, this.id)
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
        if (getClickableState(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#a1c9c5" }
      },
    },
    41: {
      title() {
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getClickableState(this.layer, this.id)
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
        if (getClickableState(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#d16991" }
      },
    },
    42: {
      title() {
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getClickableState(this.layer, this.id)
        let effect = new Decimal(1.03)
        effect = effect.pow(data.pow(2))
        return effect
      },
      unlocked() { return player[this.layer].buyables[12].gt(1) },
      canClick() {
        return true
      },
      onClick() {
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          buyAMergable(this.layer, this.id)
        } else if (player[this.layer].currentMerge != this.id && player[this.layer].currentMerge != null) {
          merge(this.layer, this.id)
        } else if (player[this.layer].currentMerge == this.id) {
          player[this.layer].currentMerge = null
        } else if (player[this.layer].currentMerge == null) {
          player[this.layer].currentMerge = this.id
        }
      },
      style() {
        if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
        if (getClickableState(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#e8979a" }
      },
    },
    43: {
      title() {
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getClickableState(this.layer, this.id)
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
        if (getClickableState(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#edbfa4" }
      },
    },
    44: {
      title() {
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Work"
        }
        return "Giving a " + format(this.power()) + "x points boost."
      },
      power() {
        let data = getClickableState(this.layer, this.id)
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
        if (getClickableState(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#7e7fa3" }
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
                      if (getClickableState(this.layer, i).lte(getHighestShit(this.layer).add(1)) && getClickableState(this.layer, i).gt(0)) {
                        setClickableState(this.layer, i, getHighestShit(this.layer).add(1))
                        console.log(format(getClickableState(this.layer, i)))
                      }
                    }
                },
                style() {
                   if (player[this.layer].buyables[this.id].gte(tmp[this.layer].buyables[this.id].cap)) return { 'background-color': "#77bf5f" }
                },
                canSellOne() {
                    return player[this.layer].buyables[this.id].gt(1)},
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
      boughtMergeables: new Decimal(0),
      clickables: { [11]: new Decimal(0), [12]: new Decimal(0), [13]: new Decimal(0),
      [21]: new Decimal(0), [22]: new Decimal(0), [23]: new Decimal(0),
      [31]: new Decimal(0), [32]: new Decimal(0), [33]: new Decimal(0) } // Optional default Clickable state
    }
  },
  image:"/aptmamgilded.png",
  color: "#e6e864",
  requires: new Decimal(100000), // Can be a function that takes requirement increases into account
  resource: "gilded points", // Name of prestige currency
  baseResource: "Mergeable Score", // Name of resource prestige is based on
  baseAmount() { return player.sc.points }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.95, // Prestige currency exponent
  gainMult() { // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1)
    return mult
  },
  gainExp() { // Calculate the exponent on main currency from bonuses
    return new Decimal(1)
  },
  row: 1, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    { key: "g", description: "G: Gild points", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
  ],
  clickables: {
    rows: 3,
    cols: 3,
    11: {
      title() {
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Gilded Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Gilded Points"
        }
        return "Adding +" + formatWhole(this.power()) + " to the Better Mergeables cap."
      },
      power() {
        let data = getClickableState(this.layer, this.id)
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
        if (getClickableState(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#a89451" }
      },
    },
    12: {
      title() {
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Gilded Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Gilded Points"
        }
        return "Adding +" + formatWhole(this.power()) + " to the Better Mergeables cap."
      },
      power() {
        let data = getClickableState(this.layer, this.id)
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
        if (getClickableState(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#a89451" }
      },
    },
    13: {
      title() {
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Gilded Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Gilded Points"
        }
        return "Adding +" + formatWhole(this.power()) + " to the Better Mergeables cap."
      },
      power() {
        let data = getClickableState(this.layer, this.id)
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
        if (getClickableState(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#a89451" }
      },
    },
    21: {
      title() {
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Gilded Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Gilded Points"
        }
        return "Adding +" + formatWhole(this.power()) + " to the Better Mergeables cap."
      },
      power() {
        let data = getClickableState(this.layer, this.id)
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
        if (getClickableState(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#a89451" }
      },
    },
    22: {
      title() {
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Gilded Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Gilded Points"
        }
        return "Adding +" + formatWhole(this.power()) + " to the Better Mergeables cap."
      },
      power() {
        let data = getClickableState(this.layer, this.id)
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
        if (getClickableState(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#a89451" }
      },
    },
    23: {
      title() {
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Gilded Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Gilded Points"
        }
        return "Adding +" + formatWhole(this.power()) + " to the Better Mergeables cap."
      },
      power() {
        let data = getClickableState(this.layer, this.id)
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
        if (getClickableState(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#a89451" }
      },
    },
    31: {
      title() {
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Gilded Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Gilded Points"
        }
        return "Adding +" + formatWhole(this.power()) + " to the Better Mergeables cap."
      },
      power() {
        let data = getClickableState(this.layer, this.id)
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
        if (getClickableState(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#a89451" }
      },
    },
    32: {
      title() {
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Gilded Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Gilded Points"
        }
        return "Adding +" + formatWhole(this.power()) + " to the Better Mergeables cap."
      },
      power() {
        let data = getClickableState(this.layer, this.id)
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
        if (getClickableState(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
        return { 'background-color': "#a89451" }
      },
    },
    33: {
      title() {
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Gilded Mergeable for "+formatWhole(getMergeableCost(this.layer))+" Gilded Points"
        }
        return "Adding +" + formatWhole(this.power()) + " to the Better Mergeables cap."
      },
      power() {
        let data = getClickableState(this.layer, this.id)
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
        if (getClickableState(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
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
                     "clickables"],
            },

        },
  layerShown() { return hasMilestone("sc", 2) }
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
            if (getClickableState("p", i).eq(0)) return
            player[this.layer].points = player[this.layer].points.add(Decimal.pow(3, getClickableState("p", i)))
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
                effectDescription: function() { return "Unlock Auto-Merge. Auto-Merge will automatically merge all viable Mergeables once every "+format(getImprovedAutoMergeSpeed())+" seconds." },
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
                unlocked() {return hasMilestone(this.layer, 5)},
                done() {return player[this.layer].best.gte(100000000)}, // Used to determine when to give the milestone
                effectDescription: "Unlock Gilded Mergeables.",
            },
        },
        layerShown() { return player[this.layer].best.gt(0) }
    }, 
)
