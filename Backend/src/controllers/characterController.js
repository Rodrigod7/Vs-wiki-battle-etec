// Backend/src/controllers/characterController.js
import { Character, User } from '../config/db.js';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';

export const createCharacter = async (req, res) => {
  try {
    const { 
      name, alias, quote, description, origin, gender, classification,
      images, // Array de objetos { url, label }
      tier, attackPotency, speed, durability, weaknesses, equipment,
      strength, speed_stat, durability_stat, intelligence, energy, combat,
      abilities
    } = req.body;

    // Convertir a string para guardar en SQLite
    const abilitiesStr = JSON.stringify(abilities || []);
    const imagesStr = JSON.stringify(images || []);

    const newCharacter = await Character.create({
      name, alias, quote, description, origin, gender, classification,
      images: imagesStr,
      tier: tier || 'Unknown',
      attackPotency, speed, durability, weaknesses, equipment,
      strength: strength || 50,
      speed_stat: speed_stat || 50,
      durability_stat: durability_stat || 50,
      intelligence: intelligence || 50,
      energy: energy || 50,
      combat: combat || 50,
      abilities: abilitiesStr,
      // ❌ ELIMINADO: image: ... (Ya no se guarda aquí)
      creatorId: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Personaje creado exitosamente',
      data: newCharacter.toJSON()
    });

  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear el personaje', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// @desc    Get all characters
export const getAllCharacters = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const offset = (page - 1) * limit;
        const { universe, tier, search, creatorId, sortBy } = req.query;
        
        const whereConditions = { isActive: true };
        
        if (universe) whereConditions.universe = universe;
        if (tier) whereConditions.tier = tier;
        if (creatorId) whereConditions.creatorId = parseInt(creatorId);
        
        if (search) {
          whereConditions[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { alias: { [Op.like]: `%${search}%` } },
            { description: { [Op.like]: `%${search}%` } }
          ];
        }
        
        let orderClause = [['createdAt', 'DESC']];
        if (sortBy === 'popular') orderClause = [['views', 'DESC'], ['likes', 'DESC']];
        else if (sortBy === 'name') orderClause = [['name', 'ASC']];
    
        const { count, rows: characters } = await Character.findAndCountAll({
          where: whereConditions,
          limit,
          offset,
          order: orderClause,
          include: [{
            model: User,
            as: 'creator',
            attributes: ['_id', 'username', 'avatar']
          }]
        });
        
        res.status(200).json({
          success: true,
          data: characters.map(c => c.toJSON()),
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalCharacters: count
          }
        });
      } catch (error) {
        console.error('Error fetching characters:', error);
        res.status(500).json({ success: false, message: 'Error al obtener los personajes' });
      }
};

export const getCharacterById = async (req, res) => {
    try {
        const { id } = req.params;
        const character = await Character.findOne({
          where: { _id: id, isActive: true },
          include: [{
            model: User,
            as: 'creator',
            attributes: ['_id', 'username', 'avatar', 'email']
          }]
        });
        
        if (!character) {
            return res.status(404).json({ success: false, message: 'Personaje no encontrado' });
        }
        
        await character.increment('views');
        
        res.status(200).json({ success: true, data: character.toJSON() });
      } catch (error) {
        console.error('Error fetching character:', error);
        res.status(500).json({ success: false, message: 'Error al obtener el personaje' });
      }
};

export const updateCharacter = async (req, res) => {
  try {
    const { id } = req.params;
    const character = await Character.findOne({ where: { _id: id, isActive: true } });

    if (!character) return res.status(404).json({ success: false, message: 'Personaje no encontrado' });
    if (character.creatorId !== req.user._id) return res.status(403).json({ success: false, message: 'No autorizado' });

    const updateData = {};
    const allowedFields = [
      'name', 'alias', 'quote', 'description', 'origin', 'gender', 'classification',
      'images', 'tier', 'attackPotency', 'speed', 'durability', 'weaknesses', 'equipment',
      'strength', 'speed_stat', 'durability_stat', 'intelligence', 'energy', 'combat', 
      'abilities'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if ((field === 'abilities' || field === 'images') && typeof req.body[field] !== 'string') {
           updateData[field] = JSON.stringify(req.body[field]);
        } else {
           updateData[field] = req.body[field];
        }
      }
    });

    // ❌ ELIMINADO: Actualizar imagen principal
    
    await character.update(updateData);
    
    const updatedCharacter = await Character.findOne({ 
        where: { _id: id }, 
        include: [{ model: User, as: 'creator', attributes: ['_id', 'username', 'avatar'] }] 
    });

    res.status(200).json({ success: true, message: 'Personaje actualizado', data: updatedCharacter.toJSON() });
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar' });
  }
};

export const deleteCharacter = async (req, res) => {
  try {
    const { id } = req.params;
    const character = await Character.findOne({ where: { _id: id, isActive: true } });

    if (!character) return res.status(404).json({ success: false, message: 'Personaje no encontrado' });
    if (character.creatorId !== req.user._id) return res.status(403).json({ success: false, message: 'No autorizado' });

    await character.update({ isActive: false });
    res.status(200).json({ success: true, message: 'Personaje eliminado' });
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar' });
  }
};

export const getCharactersByCreator = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const { count, rows: characters } = await Character.findAndCountAll({
      where: { creatorId: parseInt(creatorId), isActive: true },
      limit: 12, offset: 0, order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'creator', attributes: ['_id', 'username', 'avatar'] }]
    });
    res.status(200).json({ success: true, data: characters.map(c => c.toJSON()) });
  } catch (error) {
    console.error('Error fetching creator characters:', error);
    res.status(500).json({ success: false, message: 'Error al obtener personajes' });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const character = await Character.findOne({ where: { _id: id, isActive: true } });
    
    if (!character) return res.status(404).json({ success: false, message: 'Personaje no encontrado' });
    
    let likedBy = JSON.parse(character.likedBy || '[]');
    const hasLiked = likedBy.includes(userId);

    if (hasLiked) {
      likedBy = likedBy.filter(uid => uid !== userId);
      character.likes = Math.max(0, character.likes - 1);
    } else {
      likedBy.push(userId);
      character.likes += 1;
    }

    character.likedBy = JSON.stringify(likedBy);
    await character.save();

    res.status(200).json({ 
      success: true, 
      message: hasLiked ? 'Like removido' : 'Like registrado', 
      data: { 
        likes: character.likes,
        hasLiked: !hasLiked 
      } 
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ success: false, message: 'Error al dar like' });
  }
};