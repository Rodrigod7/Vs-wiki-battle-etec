// Backend/src/controllers/battleController.js
import { Battle, BattleVote, Character, User } from '../config/db.js';

// ✅ MAPA DE PODER ACTUALIZADO
// Asignamos un valor numérico para poder comparar matemáticamente
const tierPowerValues = {
  'Unknown': 0,
  'Street Level': 1,
  'Building Level': 2, // Agregado
  'City Level': 3,
  'Country Level': 4,
  'Continental': 5,
  'Planet Level': 6,
  'Star Level': 7,
  'Galaxy Level': 8,
  'Universal': 9,
  'Multiversal': 10,
  'Hyperversal': 11, // 🔥 NUEVO: Gana a Multi, pierde con Omni
  'Omnipotent': 12
};

const calculateBattleOutcome = (char1, char2) => {
  const power1 = tierPowerValues[char1.tier] || 0;
  const power2 = tierPowerValues[char2.tier] || 0;

  let prob1, prob2;

  if (power1 > power2) {
    // Diferencia de nivel clara
    prob1 = 90;
    prob2 = 10;
  } else if (power2 > power1) {
    prob1 = 10;
    prob2 = 90;
  } else {
    // Mismo nivel (Empate técnico)
    prob1 = 50;
    prob2 = 50;
  }

  // Factor de azar (Random roll 0-100)
  const roll = Math.random() * 100;
  // Si la probabilidad de 1 es 90%, gana si el roll es <= 90
  const winnerId = roll <= prob1 ? char1._id : char2._id;

  return {
    winnerId,
    probability1: prob1,
    probability2: prob2
  };
};

export const createBattle = async (req, res) => {
  try {
    const { character1Id, character2Id } = req.body;
    const userId = req.user._id;

    if (!character1Id || !character2Id) {
      return res.status(400).json({ success: false, message: 'Faltan personajes' });
    }

    if (character1Id === character2Id) {
      return res.status(400).json({ success: false, message: 'No puedes enfrentar un personaje consigo mismo' });
    }

    const [char1, char2] = await Promise.all([
      Character.findByPk(character1Id),
      Character.findByPk(character2Id)
    ]);

    if (!char1 || !char2) {
      return res.status(404).json({ success: false, message: 'Personajes no encontrados' });
    }

    // Usar el nuevo algoritmo basado en Tiers
    const outcome = calculateBattleOutcome(char1, char2);

    const newBattle = await Battle.create({
      character1Id,
      character2Id,
      creatorId: userId,
      simulationWinnerId: outcome.winnerId,
      winProbabilityChar1: outcome.probability1,
      winProbabilityChar2: outcome.probability2
    });

    const battleWithData = await Battle.findByPk(newBattle._id, {
      include: [
        { model: Character, as: 'character1', include: [{ model: User, as: 'creator', attributes: ['username'] }] },
        { model: Character, as: 'character2', include: [{ model: User, as: 'creator', attributes: ['username'] }] },
        { model: User, as: 'creator', attributes: ['username'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Batalla creada',
      data: battleWithData.toJSON()
    });
  } catch (error) {
    console.error('Error creating battle:', error);
    res.status(500).json({ success: false, message: 'Error al crear batalla' });
  }
};

// ... (El resto de funciones getAllBattles, etc. siguen igual, no necesitan cambios)
export const getAllBattles = async (req, res) => { /* ... mismo código ... */ 
    // (Para ahorrar espacio, mantén tu código existente de getAllBattles aquí)
    try {
        const { page = 1, limit = 12, sortBy = 'recent' } = req.query;
        const offset = (page - 1) * limit;
    
        let orderClause = [['createdAt', 'DESC']];
        if (sortBy === 'popular') orderClause = [['views', 'DESC'], ['totalVotes', 'DESC']];
    
        const { count, rows: battles } = await Battle.findAndCountAll({
          where: { isActive: true },
          include: [
            { model: Character, as: 'character1' },
            { model: Character, as: 'character2' },
            { model: User, as: 'creator', attributes: ['username'] }
          ],
          order: orderClause,
          limit: parseInt(limit),
          offset: parseInt(offset)
        });
    
        res.status(200).json({
          success: true,
          data: battles.map(b => b.toJSON()),
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit)
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener batallas' });
      }
}; 
export const getBattleById = async (req, res) => { /* ... mismo código ... */ 
    try {
        const { id } = req.params;
        const battle = await Battle.findOne({
          where: { _id: id, isActive: true },
          include: [
            { model: Character, as: 'character1' },
            { model: Character, as: 'character2' },
            { model: User, as: 'creator', attributes: ['username'] }
          ]
        });
    
        if (!battle) return res.status(404).json({ success: false, message: 'Batalla no encontrada' });
        await battle.increment('views');
    
        res.status(200).json({ success: true, data: battle.toJSON() });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Error al cargar batalla' });
      }
};
export const voteBattle = async (req, res) => { /* ... mismo código ... */
    try {
        const { id } = req.params;
        const { votedCharacterId } = req.body;
        const userId = req.user._id;
    
        const battle = await Battle.findByPk(id);
        if (!battle) return res.status(404).json({ success: false, message: 'Batalla no encontrada' });
    
        const existingVote = await BattleVote.findOne({ where: { battleId: id, userId } });
    
        if (existingVote) {
          if (existingVote.votedCharacterId !== votedCharacterId) {
            if (existingVote.votedCharacterId === battle.character1Id) await battle.decrement('votesChar1');
            else await battle.decrement('votesChar2');
    
            if (votedCharacterId === battle.character1Id) await battle.increment('votesChar1');
            else await battle.increment('votesChar2');
    
            await existingVote.update({ votedCharacterId });
          }
        } else {
          await BattleVote.create({ battleId: id, userId, votedCharacterId });
          if (votedCharacterId === battle.character1Id) await battle.increment('votesChar1');
          else await battle.increment('votesChar2');
          await battle.increment('totalVotes');
        }
        
        const updatedBattle = await Battle.findByPk(id);
        res.status(200).json({
          success: true,
          message: 'Voto registrado',
          data: {
            votesChar1: updatedBattle.votesChar1,
            votesChar2: updatedBattle.votesChar2,
            totalVotes: updatedBattle.totalVotes
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Error al votar' });
      }
};
export const getMyVote = async (req, res) => { /* ... mismo código ... */
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const vote = await BattleVote.findOne({ where: { battleId: id, userId } });
        res.status(200).json({ success: true, data: vote ? vote.toJSON() : null });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener voto' });
      }
};
export const deleteBattle = async (req, res) => { /* ... mismo código ... */ 
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const battle = await Battle.findByPk(id);
        if (!battle) return res.status(404).json({ success: false, message: 'Batalla no encontrada' });
        if (battle.creatorId !== userId) return res.status(403).json({ success: false, message: 'No autorizado' });
        await battle.update({ isActive: false });
        res.status(200).json({ success: true, message: 'Batalla eliminada' });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Error al eliminar batalla' });
      }
};