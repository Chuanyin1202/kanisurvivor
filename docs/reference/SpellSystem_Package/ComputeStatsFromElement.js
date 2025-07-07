
function computeStatsFromElement(baseStats, elementCombo, levelCombo) {
  const effects = {
    F: { damage: 1.2, ignite: true, burnDuration: 2 },
    I: { slow: 0.3, slowDuration: 2, cooldownReduction: 0.1 },
    L: { chain: 1, stun: true },
    A: { tracking: true, projectileSpeedBoost: 1.5 }
  };

  let computed = { ...baseStats };
  let levelSum = Object.values(levelCombo).reduce((a, b) => a + b, 0);

  for (let elem of Object.keys(levelCombo)) {
    const effect = effects[elem];
    if (!effect) continue;

    if (effect.damage) {
      computed.damage = (computed.damage || 0) + effect.damage * levelCombo[elem];
    }
    if (effect.chain) {
      computed.chain = (computed.chain || 0) + effect.chain;
    }
    if (effect.cooldownReduction) {
      computed.cooldown = Math.max(0.5, (computed.cooldown || 2) - effect.cooldownReduction * levelCombo[elem]);
    }

    // 附加布林屬性
    for (let key of ["ignite", "stun", "tracking"]) {
      if (effect[key]) {
        computed[key] = true;
      }
    }

    // 其他直接寫入
    for (let key of ["burnDuration", "slow", "slowDuration", "projectileSpeedBoost"]) {
      if (effect[key]) {
        computed[key] = effect[key];
      }
    }
  }

  return computed;
}
