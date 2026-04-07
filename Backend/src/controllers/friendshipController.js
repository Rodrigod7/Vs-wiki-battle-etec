// Backend/src/controllers/friendshipController.js
import { Friendship, User } from '../config/db.js';
import { Op } from 'sequelize';

// @desc    Send friend request
// @route   POST /api/friends/request
export const sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const requesterId = req.user._id;

    if (!receiverId) {
      return res.status(400).json({ success: false, message: 'Falta el ID del usuario' });
    }

    if (parseInt(receiverId) === requesterId) {
      return res.status(400).json({ success: false, message: 'No puedes enviarte una solicitud a ti mismo' });
    }

    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Check if friendship already exists (in either direction)
    const existing = await Friendship.findOne({
      where: {
        [Op.or]: [
          { requesterId, receiverId: parseInt(receiverId) },
          { requesterId: parseInt(receiverId), receiverId: requesterId }
        ]
      }
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ success: false, message: 'Ya son amigos' });
      }
      if (existing.status === 'pending') {
        // If the other person already sent a request, auto-accept
        if (existing.requesterId === parseInt(receiverId)) {
          await existing.update({ status: 'accepted' });
          return res.status(200).json({ success: true, message: '¡Solicitud aceptada automáticamente! Ya eran amigos pendientes', data: { status: 'accepted' } });
        }
        return res.status(400).json({ success: false, message: 'Ya enviaste una solicitud pendiente' });
      }
      if (existing.status === 'rejected') {
        // Allow re-sending if previously rejected
        await existing.update({ status: 'pending', requesterId, receiverId: parseInt(receiverId) });
        return res.status(200).json({ success: true, message: 'Solicitud de amistad enviada', data: { status: 'pending' } });
      }
    }

    const friendship = await Friendship.create({
      requesterId,
      receiverId: parseInt(receiverId),
      status: 'pending'
    });

    res.status(201).json({ success: true, message: 'Solicitud de amistad enviada', data: friendship });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ success: false, message: 'Error al enviar solicitud' });
  }
};

// @desc    Respond to friend request (accept/reject)
// @route   PUT /api/friends/:id/respond
export const respondToRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    const userId = req.user._id;

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Acción inválida. Usa "accept" o "reject"' });
    }

    const friendship = await Friendship.findByPk(id);
    if (!friendship) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    // Only the receiver can respond
    if (friendship.receiverId !== userId) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    if (friendship.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Esta solicitud ya fue respondida' });
    }

    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    await friendship.update({ status: newStatus });

    const message = action === 'accept' ? '¡Solicitud aceptada! Ahora son amigos' : 'Solicitud rechazada';
    res.status(200).json({ success: true, message, data: { status: newStatus } });
  } catch (error) {
    console.error('Error responding to request:', error);
    res.status(500).json({ success: false, message: 'Error al responder solicitud' });
  }
};

// @desc    Get friends list
// @route   GET /api/friends
export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    const friendships = await Friendship.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [
          { requesterId: userId },
          { receiverId: userId }
        ]
      },
      include: [
        { model: User, as: 'requester', attributes: ['_id', 'username', 'avatar', 'email'] },
        { model: User, as: 'receiver', attributes: ['_id', 'username', 'avatar', 'email'] }
      ]
    });

    // Map to return the "other" user
    const friends = friendships.map(f => {
      const friend = f.requesterId === userId ? f.receiver : f.requester;
      return {
        friendshipId: f._id,
        ...friend.toJSON(),
        since: f.updatedAt
      };
    });

    res.status(200).json({ success: true, data: friends });
  } catch (error) {
    console.error('Error getting friends:', error);
    res.status(500).json({ success: false, message: 'Error al obtener amigos' });
  }
};

// @desc    Get pending friend requests (incoming)
// @route   GET /api/friends/pending
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await Friendship.findAll({
      where: {
        receiverId: userId,
        status: 'pending'
      },
      include: [
        { model: User, as: 'requester', attributes: ['_id', 'username', 'avatar', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: requests.map(r => ({
        _id: r._id,
        requester: r.requester.toJSON(),
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    console.error('Error getting pending requests:', error);
    res.status(500).json({ success: false, message: 'Error al obtener solicitudes' });
  }
};

// @desc    Get sent friend requests (outgoing pending)
// @route   GET /api/friends/sent
export const getSentRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await Friendship.findAll({
      where: {
        requesterId: userId,
        status: 'pending'
      },
      include: [
        { model: User, as: 'receiver', attributes: ['_id', 'username', 'avatar', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: requests.map(r => ({
        _id: r._id,
        receiver: r.receiver.toJSON(),
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    console.error('Error getting sent requests:', error);
    res.status(500).json({ success: false, message: 'Error al obtener solicitudes enviadas' });
  }
};

// @desc    Remove friend
// @route   DELETE /api/friends/:id
export const removeFriend = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const friendship = await Friendship.findByPk(id);
    if (!friendship) {
      return res.status(404).json({ success: false, message: 'Amistad no encontrada' });
    }

    // Only participants can remove
    if (friendship.requesterId !== userId && friendship.receiverId !== userId) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    await friendship.destroy();
    res.status(200).json({ success: true, message: 'Amigo eliminado' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar amigo' });
  }
};

// @desc    Get friendship status with a specific user
// @route   GET /api/friends/status/:userId
export const getFriendshipStatus = async (req, res) => {
  try {
    const myId = req.user._id;
    const otherUserId = parseInt(req.params.userId);

    if (myId === otherUserId) {
      return res.status(200).json({ success: true, data: { status: 'self' } });
    }

    const friendship = await Friendship.findOne({
      where: {
        [Op.or]: [
          { requesterId: myId, receiverId: otherUserId },
          { requesterId: otherUserId, receiverId: myId }
        ]
      }
    });

    if (!friendship) {
      return res.status(200).json({ success: true, data: { status: 'none', friendshipId: null } });
    }

    // Determine direction
    const isSender = friendship.requesterId === myId;

    res.status(200).json({
      success: true,
      data: {
        status: friendship.status,
        friendshipId: friendship._id,
        direction: isSender ? 'sent' : 'received'
      }
    });
  } catch (error) {
    console.error('Error getting friendship status:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estado de amistad' });
  }
};
