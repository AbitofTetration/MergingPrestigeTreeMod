function getHighestShit() {
  let tier = new Decimal(1)
  tier = tier.add(buyableEffect("p", 11))
  return tier
}

function getMergeableCost() {
  let cost = new Decimal(5)
  cost = cost.pow(getHighestShit().sub(1))
  return cost
}

function merge(layer, id, merge, autoMerge=false) {
  let data = getClickableState(layer, id)
  if (data.lt(getHighestShit())) return
  if (getClickableState(layer, (autoMerge?merge:player[layer].currentMerge)).eq(data)) {
    setClickableState(layer, (autoMerge?merge:player[layer].currentMerge), new Decimal(0))
    setClickableState(layer, id, data.add(1))
  }
  if (autoMerge != true) player[layer].currentMerge = null
}

function buyAMergable(layer, id) {
    if (player.p.points.gte(getMergeableCost())) {
      setClickableState(layer, id, getHighestShit())
      player.p.points = player.p.points.sub(getMergeableCost())
    }
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
      autoBuyerOn: false,
      autoMergeOn: false,
      timeSinceLastAMerge: 0,
      clickables: { [11]: new Decimal(0), [12]: new Decimal(0), [13]: new Decimal(0),
      [21]: new Decimal(0), [22]: new Decimal(0), [23]: new Decimal(0),
      [31]: new Decimal(0), [32]: new Decimal(0), [33]: new Decimal(0),
      [41]: new Decimal(0), [42]: new Decimal(0), [43]: new Decimal(0) } // Optional default Clickable state
    }
  },
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
  update(diff) {
    if (player.p.autoMergeOn && hasMilestone("sc", 2)) {
      player.p.timeSinceLastAMerge = player.p.timeSinceLastAMerge + (diff)
      if (player.p.timeSinceLastAMerge >= 10) {
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
          console.log(viableClickables)
          for (var i in moreViableClickables) {
            while (moreViableClickables[i].length > 1) {
              console.log(moreViableClickables[i][0])
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
    if (player.p.autoBuyerOn &&  hasMilestone("sc", 1)) {
      for (var i in player.p.clickables) {
        if (player.p.clickables[i].eq(0)) {
          if (!layers.p.clickables[i].unlocked || layers.p.clickables[i].unlocked()) buyAMergable("p", i)
        }
      }
    }
  },
  clickables: {
    rows: 4,
    cols: 3,
    11: {
      title: "Mergeable 1", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost())+" Work"
        }
        return "Current tier: " + data + ", resulting in a " + format(this.power()) + "x points boost."
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
        return { 'background-color': "#e05e5e" }
      },
    },
    12: {
      title: "Mergeable 2", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost())+" Work"
        }
        return "Current tier: " + data + ", resulting in a " + format(this.power()) + "x points boost."
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
        return { 'background-color': "#e3ad66" }
      },
    },
    13: {
      title: "Mergeable 3", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost())+" Work"
        }
        return "Current tier: " + data + ", resulting in a " + format(this.power()) + "x points boost."
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
        return { 'background-color': "#d6e063" }
      },
    },
    21: {
      title: "Mergeable 4", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost())+" Work"
        }
        return "Current tier: " + data + ", resulting in a " + format(this.power()) + "x points boost."
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
        return { 'background-color': "#91e660" }
      },
    },
    22: {
      title: "Mergeable 5", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost())+" Work"
        }
        return "Current tier: " + data + ", resulting in a " + format(this.power()) + "x points boost."
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
      title: "Mergeable 6", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost())+" Work"
        }
        return "Current tier: " + data + ", resulting in a " + format(this.power()) + "x points boost."
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
        return { 'background-color': "#33e8ac" }
      },
    },
    31: {
      title: "Mergeable 7", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost())+" Work"
        }
        return "Current tier: " + data + ", resulting in a " + format(this.power()) + "x points boost."
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
        return { 'background-color': "#33bee8" }
      },
    },
    32: {
      title: "Mergeable 8", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost())+" Work"
        }
        return "Current tier: " + data + ", resulting in a " + format(this.power()) + "x points boost."
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
        return { 'background-color': "#617fed" }
      },
    },
    33: {
      title: "Mergeable 9", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost())+" Work"
        }
        return "Current tier: " + data + ", resulting in a " + format(this.power()) + "x points boost."
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
        return { 'background-color': "#d16bcb" }
      },
    },
    41: {
      title: "Mergeable 10", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost())+" Work"
        }
        return "Current tier: " + data + ", resulting in a " + format(this.power()) + "x points boost."
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
        return { 'background-color': "#d16991" }
      },
    },
    42: {
      title: "Mergeable 11", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost())+" Work"
        }
        return "Current tier: " + data + ", resulting in a " + format(this.power()) + "x points boost."
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
      title: "Mergeable 12", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost())+" Work"
        }
        return "Current tier: " + data + ", resulting in a " + format(this.power()) + "x points boost."
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
        return { 'background-color': "#edbfa4" }
      },
    },
  },
        buyables: {
            rows: 1,
            cols: 2,
            11: {
                title: "Better Mergeables", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
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
                    Level: " + formatWhole(player[this.layer].buyables[this.id]) + "/"+ formatWhole(10) + "\n\
                    Increases the beginning tier of Mergeables by "+ formatWhole(data.effect)+", but multiplies Mergeable cost by "+formatWhole(getMergeableCost())
                },
                unlocked() { return hasMilestone("sc", 0) }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) && player[this.layer].buyables[this.id].lt(10)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    console.log(getHighestShit())
                    for (let i in player[this.layer].clickables) {
                      if (getClickableState(this.layer, i).lte(getHighestShit().add(1)) && getClickableState(this.layer, i).gt(0)) {
                        setClickableState(this.layer, i, getHighestShit().add(1))
                        console.log(format(getClickableState(this.layer, i)))
                      }
                    }
                },
                style() {
                   if (player[this.layer].buyables[this.id].eq(10)) return { 'background-color': "#77bf5f" }
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
                    Level: " + formatWhole(player[this.layer].buyables[this.id]) + "/"+ formatWhole(3) + "\n\
                    Adds "+ formatWhole(data.effect)+" mergeables."
                },
                unlocked() { return hasMilestone("sc", 0) }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) && player[this.layer].buyables[this.id].lt(3)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].eq(3)) return { 'background-color': "#77bf5f" }
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
      /*currentMerge: null,
      clickables: { [11]: new Decimal(0), [12]: new Decimal(0), [13]: new Decimal(0),
      [21]: new Decimal(0), [22]: new Decimal(0), [23]: new Decimal(0),
      [31]: new Decimal(0), [32]: new Decimal(0), [33]: new Decimal(0),
      [41]: new Decimal(0), [42]: new Decimal(0), [43]: new Decimal(0) }  Optional default Clickable state*/
    }
  },
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
  /*clickables: {
    rows: 4,
    cols: 3,
    11: {
      title: "Mergeable 1", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost())+" Work"
        }
        return "Current tier: " + data + ", resulting in a " + format(this.power()) + "x points boost."
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
        return { 'background-color': "#e05e5e" }
      },
    },
    12: {
      title: "Mergeable 2", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost())+" Work"
        }
        return "Current tier: " + data + ", resulting in a " + format(this.power()) + "x points boost."
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
        return { 'background-color': "#e3ad66" }
      },
    },
    13: {
      title: "Mergeable 3", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost())+" Work"
        }
        return "Current tier: " + data + ", resulting in a " + format(this.power()) + "x points boost."
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
        return { 'background-color': "#d6e063" }
      },
    },
    21: {
      title: "Mergeable 4", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost())+" Work"
        }
        return "Current tier: " + data + ", resulting in a " + format(this.power()) + "x points boost."
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
        return { 'background-color': "#91e660" }
      },
    },
    22: {
      title: "Mergeable 5", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost())+" Work"
        }
        return "Current tier: " + data + ", resulting in a " + format(this.power()) + "x points boost."
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
      title: "Mergeable 6", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost())+" Work"
        }
        return "Current tier: " + data + ", resulting in a " + format(this.power()) + "x points boost."
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
        return { 'background-color': "#33e8ac" }
      },
    },
    31: {
      title: "Mergeable 7", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost())+" Work"
        }
        return "Current tier: " + data + ", resulting in a " + format(this.power()) + "x points boost."
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
        return { 'background-color': "#33bee8" }
      },
    },
    32: {
      title: "Mergeable 8", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost())+" Work"
        }
        return "Current tier: " + data + ", resulting in a " + format(this.power()) + "x points boost."
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
        return { 'background-color': "#617fed" }
      },
    },
    33: {
      title: "Mergeable 9", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost())+" Work"
        }
        return "Current tier: " + data + ", resulting in a " + format(this.power()) + "x points boost."
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
        return { 'background-color': "#d16bcb" }
      },
    },
    41: {
      title: "Mergeable 10", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost())+" Work"
        }
        return "Current tier: " + data + ", resulting in a " + format(this.power()) + "x points boost."
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
        return { 'background-color': "#d16991" }
      },
    },
    42: {
      title: "Mergeable 11", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost())+" Work"
        }
        return "Current tier: " + data + ", resulting in a " + format(this.power()) + "x points boost."
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
      title: "Mergeable 12", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for "+formatWhole(getMergeableCost())+" Work"
        }
        return "Current tier: " + data + ", resulting in a " + format(this.power()) + "x points boost."
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
        return { 'background-color': "#edbfa4" }
      },
    },
  },*/
        buyables: {
            rows: 1,
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
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) && player[this.layer].buyables[this.id].lt(10)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].eq(10)) return { 'background-color': "#77bf5f" }
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
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) && player[this.layer].buyables[this.id].lt(5)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                style() {
                   if (player[this.layer].buyables[this.id].eq(5)) return { 'background-color': "#77bf5f" }
                },
                buyMax() {}, // You'll have to handle this yourself if you want
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
            1: {requirementDescription: "1500 Mergeable Score",
                unlocked() {return hasMilestone(this.layer, 0)},
                done() {return player[this.layer].best.gte(1500)},
                effectDescription: "Unlock Auto-Buyer. Auto-Buyer will automatically buy any empty Mergeable slots.",
                toggles: [
                    ["p", "autoBuyerOn"]],
            },
            2: {requirementDescription: "8000 Mergeable Score",
                unlocked() {return hasMilestone(this.layer, 1)},
                done() {return player[this.layer].best.gte(8000)},
                effectDescription: "Unlock Auto-Merge. Auto-Merge will automatically merge all viable Mergeables once every 10 seconds.",
                toggles: [
                    ["p", "autoMergeOn"]],
            },
            3: {requirementDescription: "100,000 Mergeable Score",
                unlocked() {return hasMilestone(this.layer, 2)},
                done() {return player[this.layer].best.gte(100000)}, // Used to determine when to give the milestone
                effectDescription: "Unlock Gilded Points.",
            },
        },
        layerShown() { return player[this.layer].best.gt(0) }
    }, 
)
