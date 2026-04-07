// Backend/src/utils/battleEngine.js — Motor de batalla narrativo dramático

const tierPowerValues = {
  'Unknown': 0,
  'Street Level': 1,
  'Building Level': 2,
  'City Level': 3,
  'Country Level': 4,
  'Continental': 5,
  'Planet Level': 6,
  'Star Level': 7,
  'Galaxy Level': 8,
  'Universal': 9,
  'Multiversal': 10,
  'Hyperversal': 11,
  'Omnipotent': 12
};

const powerKeywords = [
  [/omnipotente|omnipotent/i, 10],
  [/infinit[oa]|infinite|ilimitad[oa]/i, 9],
  [/incalculable|inmensurable|immeasurable/i, 9],
  [/multiversal/i, 9],
  [/universal/i, 8],
  [/gal[aá]cti[co]|galaxia|galaxy/i, 7],
  [/estelar|estrella|star level/i, 7],
  [/planetari[oa]|planeta|planet/i, 6],
  [/continental/i, 5],
  [/pa[ií]s|country/i, 4],
  [/ciudad|city/i, 3],
  [/destrucci[oó]n masiva|devastador|devastating/i, 5],
  [/edificio|building/i, 2],
  [/sobrehumano|superhuman/i, 2],
  [/humano|human|normal|calle|street/i, 1],
];

const speedKeywords = [
  [/omnipresente|omnipresent/i, 10],
  [/instant[aá]ne[oa]|instantaneous/i, 10],
  [/infinit[oa]|infinite/i, 10],
  [/inmensurable|immeasurable|incalculable/i, 9],
  [/mftl|ftl\+|faster than light\+/i, 9],
  [/velocidad de la luz|speed of light|ftl|luz/i, 8],
  [/teletransportaci[oó]n|teleport/i, 7],
  [/hipers[oó]ni[co]|hypersonic/i, 5],
  [/supers[oó]ni[co]|supersonic/i, 4],
  [/veloz|swift|r[aá]pido|fast/i, 3],
  [/subsonic|subs[oó]nico/i, 2],
  [/humano|human|normal/i, 1],
  [/lento|slow/i, 0],
];

const durabilityKeywords = [
  [/invulnerable|indestructible/i, 10],
  [/inmortal|immortal|etern[oa]/i, 9],
  [/inmune|immune/i, 8],
  [/regeneraci[oó]n|regeneration|factor curativo/i, 7],
  [/irrompible|unbreakable/i, 7],
  [/blindad[oa]|armored|armadura/i, 5],
  [/muy resistente|highly resistant/i, 5],
  [/resistente|resistant|duro|tough/i, 3],
  [/humano|human|normal/i, 1],
  [/fr[aá]gil|fragile|d[eé]bil|weak/i, 0],
];

// ── Helpers ───────────────────────────────────────────────────────
function analyzeText(text, keywordTable) {
  if (!text) return 0;
  let maxScore = 0;
  for (const [regex, score] of keywordTable) {
    if (regex.test(text)) maxScore = Math.max(maxScore, score);
  }
  return maxScore;
}

function parseAbilities(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function analyzeCharacter(char) {
  const tier = tierPowerValues[char.tier] || 0;
  const abilities = parseAbilities(char.abilities);
  const stats = {
    strength: (char.strength || 50),
    speed: (char.speed_stat || 50),
    durability: (char.durability_stat || 50),
    intelligence: (char.intelligence || 50),
    energy: (char.energy || 50),
    combat: (char.combat || 50),
  };
  return {
    id: char._id,
    name: char.name,
    alias: char.alias || '',
    tier,
    tierName: char.tier || 'Unknown',
    stats,
    textAttack: analyzeText(char.attackPotency, powerKeywords),
    textSpeed: analyzeText(char.speed, speedKeywords),
    textDurability: analyzeText(char.durability, durabilityKeywords),
    abilities,
    abilityCount: abilities.length,
    weaknesses: char.weaknesses || '',
    equipment: char.equipment || '',
    attackPotency: char.attackPotency || '',
    speedDesc: char.speed || '',
    durabilityDesc: char.durability || '',
    description: char.description || '',
    origin: char.origin || '',
  };
}

function calcScores(a, b) {
  // Tier
  let scoreA = 0, scoreB = 0;
  const tierDiff = a.tier - b.tier;
  if (tierDiff >= 3) scoreA += 4;
  else if (tierDiff === 2) scoreA += 3;
  else if (tierDiff === 1) scoreA += 1;
  else if (tierDiff === -1) scoreB += 1;
  else if (tierDiff === -2) scoreB += 3;
  else if (tierDiff <= -3) scoreB += 4;

  // Speed
  const speedA = a.stats.speed / 100 * 5 + a.textSpeed;
  const speedB = b.stats.speed / 100 * 5 + b.textSpeed;
  const sRatio = speedA / (speedB || 0.1);
  if (sRatio > 2) scoreA += 3;
  else if (sRatio > 1.3) scoreA += 2;
  else if (sRatio > 1.05) scoreA += 1;
  else if (sRatio < 0.5) scoreB += 3;
  else if (sRatio < 0.75) scoreB += 2;
  else if (sRatio < 0.95) scoreB += 1;

  // Attack vs Defense
  const atkA = a.stats.strength / 100 * 5 + a.textAttack + a.stats.energy / 100 * 3;
  const atkB = b.stats.strength / 100 * 5 + b.textAttack + b.stats.energy / 100 * 3;
  const defA = a.stats.durability / 100 * 5 + a.textDurability;
  const defB = b.stats.durability / 100 * 5 + b.textDurability;
  const netA = (atkA - defB) + (defA - atkB);
  if (netA > 5) scoreA += 3;
  else if (netA > 2) scoreA += 2;
  else if (netA > 0.5) scoreA += 1;
  else if (netA < -5) scoreB += 3;
  else if (netA < -2) scoreB += 2;
  else if (netA < -0.5) scoreB += 1;

  // Abilities
  const totalAbilA = a.abilityCount * 2 + a.stats.combat / 20;
  const totalAbilB = b.abilityCount * 2 + b.stats.combat / 20;
  if (totalAbilA > totalAbilB * 1.5) scoreA += 2;
  else if (totalAbilA > totalAbilB * 1.1) scoreA += 1;
  else if (totalAbilB > totalAbilA * 1.5) scoreB += 2;
  else if (totalAbilB > totalAbilA * 1.1) scoreB += 1;

  // Intelligence
  const intDiff = a.stats.intelligence - b.stats.intelligence;
  if (intDiff > 30) scoreA += 2;
  else if (intDiff > 10) scoreA += 1;
  else if (intDiff < -30) scoreB += 2;
  else if (intDiff < -10) scoreB += 1;

  // Weaknesses
  const hasWeakA = a.weaknesses && a.weaknesses.length > 5;
  const hasWeakB = b.weaknesses && b.weaknesses.length > 5;
  if (hasWeakA && !hasWeakB) scoreB += 1;
  else if (hasWeakB && !hasWeakA) scoreA += 1;

  // Equipment
  const hasEquipA = a.equipment && a.equipment.length > 5;
  const hasEquipB = b.equipment && b.equipment.length > 5;
  if (hasEquipA && !hasEquipB) scoreA += 1;
  else if (hasEquipB && !hasEquipA) scoreB += 1;

  return { scoreA, scoreB };
}

// ══════════════════════════════════════════════════════════════════
// NARRATIVE GENERATION — Dramatic story-like battle text
// ══════════════════════════════════════════════════════════════════

const scenarioLocations = [
  'en las ruinas de una civilización olvidada, donde los ecos de batallas pasadas aún resuenan entre las columnas de piedra',
  'en un vasto campo de batalla bajo un cielo tormentoso, con relámpagos iluminando las nubes oscuras',
  'en la cima de una montaña que toca las nubes, donde el viento aúlla como un presagio de destrucción',
  'en una dimensión intermedia entre el caos y el orden, donde la realidad misma se dobla ante el poder',
  'en una metrópolis abandonada, con rascacielos agrietados como testigos silenciosos del choque inminente',
  'en un coliseo cósmico forjado por entidades ancestrales para ser testigos de combates legendarios',
  'en el borde del fin del mundo, donde el horizonte se quiebra y el cielo arde en tonos carmesí',
  'en un desierto infinito donde cada grano de arena vibra ante la presión de dos poderes inconmensurables',
  'en un bosque ancestral cuyas raíces conectan con el corazón del planeta, testigo de la confrontación',
  'en una arena flotante entre dimensiones, sostenida por la pura voluntad de fuerzas cósmicas',
];

const impactDescriptions = [
  'La onda expansiva sacude la tierra por kilómetros a la redonda',
  'El impacto genera un cráter que se extiende como una herida en la superficie del mundo',
  'La colisión de poderes crea ondas de choque que distorsionan el espacio circundante',
  'El suelo se agrieta en patrones radiales, como si la realidad misma se resquebrajara',
  'Una columna de energía asciende al cielo, visible desde cualquier punto del horizonte',
  'El aire crepita con electricidad estática mientras las partículas de polvo flotan ingrávidas',
];

const tensionPhrases = [
  'Por un instante, el tiempo parece detenerse.',
  'El silencio que sigue es ensordecedor.',
  'Ambos combatientes se miran, calculando su próximo movimiento.',
  'La tensión en el aire es casi palpable.',
  'Un segundo de quietud... antes de la tormenta.',
  'Sus miradas se cruzan, y en ese instante ambos comprenden la magnitud de su oponente.',
];

function generateIntroduction(a, b) {
  const location = pick(scenarioLocations);

  const introA = a.alias 
    ? `**${a.name}**, conocido como *"${a.alias}"*` 
    : `**${a.name}**`;
  const introB = b.alias 
    ? `**${b.name}**, conocido como *"${b.alias}"*` 
    : `**${b.name}**`;

  const originA = a.origin ? `, proveniente de ${a.origin},` : '';
  const originB = b.origin ? `, proveniente de ${b.origin},` : '';

  let text = `${pick(scenarioLocations).charAt(0).toUpperCase() + location.slice(1)}, dos fuerzas están a punto de colisionar.\n\n`;
  text += `De un lado se encuentra ${introA}${originA} clasificado como **${a.tierName}**. `;
  
  if (a.description) {
    const shortDesc = a.description.length > 150 ? a.description.substring(0, 150) + '...' : a.description;
    text += `${shortDesc} `;
  }
  
  if (a.abilities.length > 0) {
    const showAbilities = a.abilities.slice(0, 4);
    text += `Posee poderes como ${showAbilities.join(', ')}${a.abilities.length > 4 ? ' entre otros' : ''}. `;
  }

  text += `\n\nDel otro lado emerge ${introB}${originB} clasificado como **${b.tierName}**. `;
  
  if (b.description) {
    const shortDesc = b.description.length > 150 ? b.description.substring(0, 150) + '...' : b.description;
    text += `${shortDesc} `;
  }
  
  if (b.abilities.length > 0) {
    const showAbilities = b.abilities.slice(0, 4);
    text += `Posee poderes como ${showAbilities.join(', ')}${b.abilities.length > 4 ? ' entre otros' : ''}. `;
  }

  text += `\n\nEl escenario está listo. La batalla comienza.`;

  return { title: '📜 Prólogo: Dos Fuerzas Destinadas a Colisionar', text, winner: 0 };
}

function generatePhase1(a, b, scoreA, scoreB) {
  const faster = a.textSpeed > b.textSpeed || a.stats.speed > b.stats.speed ? a : 
                 b.textSpeed > a.textSpeed || b.stats.speed > a.stats.speed ? b : 
                 (scoreA >= scoreB ? a : b);
  const slower = faster === a ? b : a;
  
  let text = '';

  // First strike
  if (faster.speedDesc) {
    text += `Con ${faster.speedDesc.toLowerCase().includes('velocidad') ? faster.speedDesc.toLowerCase() : `una velocidad descrita como "${faster.speedDesc}"`}, **${faster.name}** es el primero en moverse. `;
  } else {
    text += `**${faster.name}** toma la iniciativa con un movimiento fulminante. `;
  }

  if (faster.abilities.length > 0) {
    const firstAbility = pick(faster.abilities);
    text += `Desata su **${firstAbility}** directamente contra ${slower.name}. `;
  } else {
    text += `Lanza un ataque devastador con toda su fuerza. `;
  }

  text += pick(impactDescriptions) + '. ';

  // Response
  text += `\n\nPero **${slower.name}** no es un oponente cualquiera. `;
  
  if (slower.durabilityDesc) {
    text += `Con una resistencia descrita como "${slower.durabilityDesc}", `;
  }

  if (slower.stats.durability > 70) {
    text += `resiste el impacto y se mantiene firme. `;
  } else if (slower.stats.durability > 40) {
    text += `absorbe el golpe con dificultad, pero no cede terreno. `;
  } else {
    text += `el golpe lo sacude, pero su determinación lo mantiene en pie. `;
  }

  if (slower.abilities.length > 0) {
    const counterAbility = pick(slower.abilities);
    text += `Contraataca usando su **${counterAbility}**, buscando explotar cualquier apertura. `;
  } else {
    text += `Contraataca con una respuesta fulminante, buscando explotar cualquier apertura. `;
  }

  text += `\n\n${pick(tensionPhrases)}`;

  const phaseWinner = faster === a ? (scoreA >= scoreB ? 1 : 0) : (scoreB >= scoreA ? 2 : 0);

  return { title: '⚔️ Fase 1: El Primer Choque', text, winner: phaseWinner };
}

function generatePhase2(a, b, scoreA, scoreB) {
  let text = 'La batalla se intensifica. Ambos combatientes han medido a su oponente y ahora luchan en serio.\n\n';

  // Character A escalation  
  if (a.attackPotency) {
    text += `**${a.name}** eleva su poder de ataque — descrito como "${a.attackPotency}". `;
  } else if (a.stats.strength > 70) {
    text += `**${a.name}** desata toda su fuerza bruta (${a.stats.strength}/100), `;
  } else {
    text += `**${a.name}** cambia de estrategia, `;
  }

  if (a.equipment) {
    text += `Empuña su ${a.equipment}, potenciando cada golpe. `;
  }

  if (a.abilities.length > 1) {
    const combo = a.abilities.slice(0, 3).join(' + ');
    text += `Combina **${combo}** en una secuencia devastadora que hace temblar el campo de batalla. `;
  } else if (a.abilities.length === 1) {
    text += `Canaliza todo su poder en **${a.abilities[0]}**, llevándolo al límite. `;
  }

  text += pick(impactDescriptions) + '.\n\n';

  // Character B response
  if (b.stats.intelligence > 70) {
    text += `**${b.name}**, con una inteligencia de ${b.stats.intelligence}/100, analiza cada movimiento y busca el patrón perfecto para su contraataque. `;
  } else {
    text += `**${b.name}** responde con una ferocidad que iguala la de su oponente. `;
  }

  if (b.attackPotency) {
    text += `Su poder de ataque — "${b.attackPotency}" — se manifiesta en toda su gloria. `;
  }

  if (b.equipment) {
    text += `Con ${b.equipment} en mano, `;
  }

  if (b.abilities.length > 1) {
    const combo = b.abilities.slice(0, 3).join(' + ');
    text += `ejecuta una combinación de **${combo}** que sacude los cimientos de la realidad. `;
  } else if (b.abilities.length === 1) {
    text += `libera todo el potencial de **${b.abilities[0]}**. `;
  } else {
    text += `responde con un contraataque brutal. `;
  }

  // Damage assessment
  text += '\n\n';
  const dominantA = scoreA > scoreB;
  const dominant = dominantA ? a : b;
  const underdog = dominantA ? b : a;

  if (Math.abs(scoreA - scoreB) >= 4) {
    text += `Es evidente que **${dominant.name}** está tomando el control del combate. Cada intercambio le es más favorable, y ${underdog.name} comienza a acusar el desgaste. `;
  } else if (Math.abs(scoreA - scoreB) >= 2) {
    text += `**${dominant.name}** lleva una ligera ventaja en este intercambio. Sus ataques son más efectivos, pero ${underdog.name} no se rinde fácilmente. `;
  } else {
    text += `Ambos combatientes están parejos. Cada golpe es respondido con igual ferocidad. La batalla podría inclinarse hacia cualquier lado. `;
  }

  text += pick(tensionPhrases);

  return { title: '🔥 Fase 2: Escalada de Poder', text, winner: scoreA > scoreB ? 1 : scoreB > scoreA ? 2 : 0 };
}

function generatePhase3(a, b, scoreA, scoreB, winnerId) {
  let text = '';
  
  const isClose = Math.abs(scoreA - scoreB) < 3;
  const dominant = scoreA >= scoreB ? a : b;
  const underdog = scoreA >= scoreB ? b : a;
  const domScore = scoreA >= scoreB ? scoreA : scoreB;
  const undScore = scoreA >= scoreB ? scoreB : scoreA;

  if (isClose) {
    // Close fight - dramatic turnaround moment
    text += `Cuando parece que **${dominant.name}** está a punto de asegurar la victoria, **${underdog.name}** encuentra una reserva oculta de poder. `;
    
    if (underdog.weaknesses) {
      text += `A pesar de sus debilidades conocidas — ${underdog.weaknesses} — encuentra la fuerza para continuar. `;
    }
    
    if (underdog.abilities.length > 0) {
      const ultimateAbility = underdog.abilities[underdog.abilities.length - 1];
      text += `\n\nEn un último acto desesperado, desata **${ultimateAbility}** con una intensidad nunca antes vista. `;
    } else {
      text += `\n\nCon un grito que resuena en el alma, reúne cada gramo de energía que le queda para un ataque final. `;
    }
    
    text += pick(impactDescriptions) + '. ';
    text += `\n\n${dominant.name} no esperaba esto. `;

    if (dominant.abilities.length > 0) {
      const counterUlt = dominant.abilities[dominant.abilities.length - 1];
      text += `Responde activando **${counterUlt}** en su forma más pura. `;
    }

    text += `El choque de ambos poderes crea una explosión que ilumina el horizonte entero. El polvo se levanta, y por un momento nadie puede ver el resultado...`;

  } else {
    // Dominant fighter takes control
    text += `La diferencia de poder se hace innegable. **${dominant.name}** ha tomado el control absoluto de la batalla.\n\n`;
    
    if (dominant.abilities.length > 0) {
      const finalAbility = dominant.abilities[dominant.abilities.length - 1];
      text += `Canaliza todo su poder restante en un último y devastador **${finalAbility}**. `;
    } else {
      text += `Reúne toda su energía para un ataque final decisivo. `;
    }

    text += `El golpe conecta con una fuerza ${dominant.tier >= 6 ? 'que trasciende la comprensión mortal' : 'descomunal'}. `;
    text += pick(impactDescriptions) + '.\n\n';

    if (underdog.durabilityDesc) {
      text += `A pesar de su resistencia (${underdog.durabilityDesc}), **${underdog.name}** `;
    } else {
      text += `**${underdog.name}** `;
    }

    if (domScore > undScore * 2) {
      text += `no puede soportar más. El impacto es demasiado poderoso.`;
    } else {
      text += `lucha con todo lo que tiene, pero las pequeñas ventajas acumuladas por ${dominant.name} finalmente hacen la diferencia.`;
    }
  }

  return { title: '💥 Fase 3: El Momento Decisivo', text, winner: winnerId === a.id ? 1 : winnerId === b.id ? 2 : 0 };
}

function generateConclusion(a, b, scoreA, scoreB, winnerId) {
  const total = scoreA + scoreB || 1;
  const pctA = Math.round((scoreA / total) * 100);
  const pctB = 100 - pctA;
  
  let text = '';

  if (!winnerId) {
    // TIE
    text += `Cuando el polvo se asienta y el silencio regresa al campo de batalla, ambos guerreros permanecen en pie.\n\n`;
    text += `**${a.name}** y **${b.name}** se miran con respeto mutuo. `;
    text += `Ambos han dado todo de sí, y ninguno ha logrado superar al otro de forma definitiva.\n\n`;
    text += `📊 **Puntuación final:** ${a.name} ${scoreA} pts (${pctA}%) — ${b.name} ${scoreB} pts (${pctB}%)\n\n`;
    text += `Este combate queda registrado como un **EMPATE** legendario. Dos fuerzas perfectamente equilibradas, destinadas quizás a enfrentarse de nuevo en el futuro.`;
  } else {
    const winner = winnerId === a.id ? a : b;
    const loser = winnerId === a.id ? b : a;
    const winnerScore = winnerId === a.id ? scoreA : scoreB;
    const loserScore = winnerId === a.id ? scoreB : scoreA;
    const winnerPct = winnerId === a.id ? pctA : pctB;
    const loserPct = winnerId === a.id ? pctB : pctA;

    text += `El campo de batalla queda en silencio. Cuando el polvo se disipa, solo uno permanece en pie.\n\n`;
    
    text += `**${winner.name}** alza la mirada, `;
    if (winnerScore > loserScore * 2) {
      text += `habiendo dominado completamente a su oponente. La diferencia de poder era demasiado grande.`;
    } else if (winnerScore > loserScore * 1.5) {
      text += `con heridas de batalla que demuestran que no fue una victoria fácil, pero el resultado era claro desde el inicio.`;
    } else {
      text += `con el cuerpo marcado por la batalla más difícil de su vida. Esta victoria se ganó por el más mínimo margen.`;
    }

    text += `\n\n**${loser.name}** `;
    if (loserScore > winnerScore * 0.8) {
      text += `cayó con honor, demostrando que estaba a la altura del desafío. En cualquier otra circunstancia, el resultado podría haber sido diferente.`;
    } else {
      text += `luchó valientemente, pero las ventajas acumuladas por su oponente fueron determinantes.`;
    }

    text += `\n\n📊 **Puntuación final:** ${winner.name} ${winnerScore} pts (${winnerPct}%) — ${loser.name} ${loserScore} pts (${loserPct}%)\n\n`;
    
    // Victory analysis
    text += `**¿Por qué gana ${winner.name}?**\n`;
    
    // Tier advantage
    if (winner.tier > loser.tier) {
      text += `• Clasificado como **${winner.tierName}** contra ${loser.tierName} — una ventaja fundamental de poder.\n`;
    }
    // Speed
    const wSpeed = winner === a ? a.stats.speed : b.stats.speed;
    const lSpeed = winner === a ? b.stats.speed : a.stats.speed;
    if (wSpeed > lSpeed + 15) {
      text += `• Velocidad superior (${wSpeed} vs ${lSpeed}), permitiéndole controlar el ritmo del combate.\n`;
    }
    // Strength
    const wStr = winner === a ? a.stats.strength : b.stats.strength;
    const lStr = winner === a ? b.stats.strength : a.stats.strength;
    if (wStr > lStr + 15) {
      text += `• Mayor fuerza bruta (${wStr} vs ${lStr}), golpes más devastadores.\n`;
    }
    // Intelligence
    const wInt = winner === a ? a.stats.intelligence : b.stats.intelligence;
    const lInt = winner === a ? b.stats.intelligence : a.stats.intelligence;
    if (wInt > lInt + 15) {
      text += `• Inteligencia superior (${wInt} vs ${lInt}), mejor estrategia y explotación de debilidades.\n`;
    }
    // Abilities
    if (winner.abilityCount > loser.abilityCount) {
      text += `• Arsenal de habilidades más amplio (${winner.abilityCount} vs ${loser.abilityCount}).\n`;
    }
    // Opponent weaknesses
    if (loser.weaknesses && loser.weaknesses.length > 5) {
      text += `• Debilidades del oponente: ${loser.weaknesses}\n`;
    }
  }

  return { 
    title: '🏆 Veredicto Final', 
    text, 
    winner: winnerId === a.id ? 1 : winnerId === b.id ? 2 : 0 
  };
}

// ── Main engine ───────────────────────────────────────────────────
export function runBattle(char1, char2) {
  const a = analyzeCharacter(char1);
  const b = analyzeCharacter(char2);

  const { scoreA, scoreB } = calcScores(a, b);

  // Determine winner (tie if within 2 points)
  const margin = Math.abs(scoreA - scoreB);
  let winnerId = null;
  let result = 'EMPATE';

  if (margin >= 2) {
    if (scoreA > scoreB) { winnerId = char1._id; result = 'VICTORIA'; }
    else { winnerId = char2._id; result = 'VICTORIA'; }
  }

  // Probabilities
  const total = scoreA + scoreB || 1;
  const prob1 = Math.round((scoreA / total) * 100);
  const prob2 = 100 - prob1;

  // Generate dramatic narrative
  const narrative = [
    generateIntroduction(a, b),
    generatePhase1(a, b, scoreA, scoreB),
    generatePhase2(a, b, scoreA, scoreB),
    generatePhase3(a, b, scoreA, scoreB, winnerId),
    generateConclusion(a, b, scoreA, scoreB, winnerId),
  ];

  return {
    winnerId,
    result,
    probability1: prob1,
    probability2: prob2,
    scoreChar1: scoreA,
    scoreChar2: scoreB,
    narrative,
  };
}
