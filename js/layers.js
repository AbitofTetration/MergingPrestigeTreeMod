addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true}
})
addLayer("p", {
  name: "merge", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
      currentMerge: null,
      clickables: { [11]: new Decimal(0), [12]: new Decimal(0), [13]: new Decimal(0),
      [21]: new Decimal(0), [22]: new Decimal(0), [23]: new Decimal(0),
      [31]: new Decimal(0), [32]: new Decimal(0), [33]: new Decimal(0) } // Optional default Clickable state
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
    return new Decimal(1)
  },
  row: 0, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    { key: "p", description: "P: Reset for prestige points", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
  ],
  clickables: {
    rows: 3,
    cols: 3,
    11: {
      title: "Mergeable 1", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for 1 Work"
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
        console.log(this.id)
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          if (player.p.points.gte(1)) {
            setClickableState(this.layer, this.id, new Decimal(1))
            player.p.points = player.p.points.sub(1)
          }
        } else if (player[this.layer].currentMerge != this.id && player[this.layer].currentMerge != null) {
          if (getClickableState(this.layer,  player[this.layer].currentMerge).eq(data)) {
            setClickableState(this.layer, player[this.layer].currentMerge, new Decimal(0))
            setClickableState(this.layer, this.id, data.add(1))
            console.log(player[this.layer].currentMerge + "printed")
          }
          player[this.layer].currentMerge = null
        } else if (player[this.layer].currentMerge == this.id) {
          player[this.layer].currentMerge = null
        } else if (player[this.layer].currentMerge == null) {
          player[this.layer].currentMerge = this.id
        }
      },
      style() {
        return { 'background-color': "#e05e5e" }
      },
    },
    12: {
      title: "Mergeable 2", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for 1 Work"
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
        console.log(this.id)
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          if (player.p.points.gte(1)) {
            setClickableState(this.layer, this.id, new Decimal(1))
            player.p.points = player.p.points.sub(1)
          }
        } else if (player[this.layer].currentMerge != this.id && player[this.layer].currentMerge != null) {
          if (getClickableState(this.layer,  player[this.layer].currentMerge).eq(data)) {
            setClickableState(this.layer, player[this.layer].currentMerge, new Decimal(0))
            setClickableState(this.layer, this.id, data.add(1))
            console.log(player[this.layer].currentMerge + "printed")
          }
          player[this.layer].currentMerge = null
        } else if (player[this.layer].currentMerge == this.id) {
          player[this.layer].currentMerge = null
        } else if (player[this.layer].currentMerge == null) {
          player[this.layer].currentMerge = this.id
        }
      },
      style() {
        return { 'background-color': "#e3ad66" }
      },
    },
    13: {
      title: "Mergeable 3", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for 1 Work"
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
        console.log(this.id)
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          if (player.p.points.gte(1)) {
            setClickableState(this.layer, this.id, new Decimal(1))
            player.p.points = player.p.points.sub(1)
          }
        } else if (player[this.layer].currentMerge != this.id && player[this.layer].currentMerge != null) {
          if (getClickableState(this.layer,  player[this.layer].currentMerge).eq(data)) {
            setClickableState(this.layer, player[this.layer].currentMerge, new Decimal(0))
            setClickableState(this.layer, this.id, data.add(1))
            console.log(player[this.layer].currentMerge + "printed")
          }
          player[this.layer].currentMerge = null
        } else if (player[this.layer].currentMerge == this.id) {
          player[this.layer].currentMerge = null
        } else if (player[this.layer].currentMerge == null) {
          player[this.layer].currentMerge = this.id
        }
      },
      style() {
        return { 'background-color': "#d6e063" }
      },
    },
    21: {
      title: "Mergeable 4", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for 1 Work"
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
        console.log(this.id)
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          if (player.p.points.gte(1)) {
            setClickableState(this.layer, this.id, new Decimal(1))
            player.p.points = player.p.points.sub(1)
          }
        } else if (player[this.layer].currentMerge != this.id && player[this.layer].currentMerge != null) {
          if (getClickableState(this.layer,  player[this.layer].currentMerge).eq(data)) {
            setClickableState(this.layer, player[this.layer].currentMerge, new Decimal(0))
            setClickableState(this.layer, this.id, data.add(1))
            console.log(player[this.layer].currentMerge + "printed")
          }
          player[this.layer].currentMerge = null
        } else if (player[this.layer].currentMerge == this.id) {
          player[this.layer].currentMerge = null
        } else if (player[this.layer].currentMerge == null) {
          player[this.layer].currentMerge = this.id
        }
      },
      style() {
        return { 'background-color': "#91e660" }
      },
    },
    22: {
      title: "Mergeable 5", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for 1 Work"
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
        console.log(this.id)
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          if (player.p.points.gte(1)) {
            setClickableState(this.layer, this.id, new Decimal(1))
            player.p.points = player.p.points.sub(1)
          }
        } else if (player[this.layer].currentMerge != this.id && player[this.layer].currentMerge != null) {
          if (getClickableState(this.layer,  player[this.layer].currentMerge).eq(data)) {
            setClickableState(this.layer, player[this.layer].currentMerge, new Decimal(0))
            setClickableState(this.layer, this.id, data.add(1))
            console.log(player[this.layer].currentMerge + "printed")
          }
          player[this.layer].currentMerge = null
        } else if (player[this.layer].currentMerge == this.id) {
          player[this.layer].currentMerge = null
        } else if (player[this.layer].currentMerge == null) {
          player[this.layer].currentMerge = this.id
        }
      },
      style() {
        return { 'background-color': "#33e857" }
      },
    },
    23: {
      title: "Mergeable 6", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for 1 Work"
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
        console.log(this.id)
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          if (player.p.points.gte(1)) {
            setClickableState(this.layer, this.id, new Decimal(1))
            player.p.points = player.p.points.sub(1)
          }
        } else if (player[this.layer].currentMerge != this.id && player[this.layer].currentMerge != null) {
          if (getClickableState(this.layer,  player[this.layer].currentMerge).eq(data)) {
            setClickableState(this.layer, player[this.layer].currentMerge, new Decimal(0))
            setClickableState(this.layer, this.id, data.add(1))
            console.log(player[this.layer].currentMerge + "printed")
          }
          player[this.layer].currentMerge = null
        } else if (player[this.layer].currentMerge == this.id) {
          player[this.layer].currentMerge = null
        } else if (player[this.layer].currentMerge == null) {
          player[this.layer].currentMerge = this.id
        }
      },
      style() {
        return { 'background-color': "#33e8ac" }
      },
    },
    31: {
      title: "Mergeable 7", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for 1 Work"
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
        console.log(this.id)
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          if (player.p.points.gte(1)) {
            setClickableState(this.layer, this.id, new Decimal(1))
            player.p.points = player.p.points.sub(1)
          }
        } else if (player[this.layer].currentMerge != this.id && player[this.layer].currentMerge != null) {
          if (getClickableState(this.layer,  player[this.layer].currentMerge).eq(data)) {
            setClickableState(this.layer, player[this.layer].currentMerge, new Decimal(0))
            setClickableState(this.layer, this.id, data.add(1))
            console.log(player[this.layer].currentMerge + "printed")
          }
          player[this.layer].currentMerge = null
        } else if (player[this.layer].currentMerge == this.id) {
          player[this.layer].currentMerge = null
        } else if (player[this.layer].currentMerge == null) {
          player[this.layer].currentMerge = this.id
        }
      },
      style() {
        return { 'background-color': "#33bee8" }
      },
    },
    32: {
      title: "Mergeable 8", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for 1 Work"
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
        console.log(this.id)
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          if (player.p.points.gte(1)) {
            setClickableState(this.layer, this.id, new Decimal(1))
            player.p.points = player.p.points.sub(1)
          }
        } else if (player[this.layer].currentMerge != this.id && player[this.layer].currentMerge != null) {
          if (getClickableState(this.layer,  player[this.layer].currentMerge).eq(data)) {
            setClickableState(this.layer, player[this.layer].currentMerge, new Decimal(0))
            setClickableState(this.layer, this.id, data.add(1))
            console.log(player[this.layer].currentMerge + "printed")
          }
          player[this.layer].currentMerge = null
        } else if (player[this.layer].currentMerge == this.id) {
          player[this.layer].currentMerge = null
        } else if (player[this.layer].currentMerge == null) {
          player[this.layer].currentMerge = this.id
        }
      },
      style() {
        return { 'background-color': "#617fed" }
      },
    },
    33: {
      title: "Mergeable 9", // Optional, displayed at the top in a larger font
      display() { // Everything else displayed in the buyable button after the title
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          return "Buy Mergeable for 1 Work"
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
        console.log(this.id)
        let data = getClickableState(this.layer, this.id)
        if (data == 0) {
          if (player.p.points.gte(1)) {
            setClickableState(this.layer, this.id, new Decimal(1))
            player.p.points = player.p.points.sub(1)
          }
        } else if (player[this.layer].currentMerge != this.id && player[this.layer].currentMerge != null) {
          if (getClickableState(this.layer,  player[this.layer].currentMerge).eq(data)) {
            setClickableState(this.layer, player[this.layer].currentMerge, new Decimal(0))
            setClickableState(this.layer, this.id, data.add(1))
            console.log(player[this.layer].currentMerge + "printed")
          }
          player[this.layer].currentMerge = null
        } else if (player[this.layer].currentMerge == this.id) {
          player[this.layer].currentMerge = null
        } else if (player[this.layer].currentMerge == null) {
          player[this.layer].currentMerge = this.id
        }
      },
      style() {
        return { 'background-color': "#d16bcb" }
      },
    },
  },
  layerShown() { return true }
})
