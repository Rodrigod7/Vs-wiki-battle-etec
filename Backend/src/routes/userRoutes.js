// Backend/src/routes/userRoutes.js
import express from 'express';
import { 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser 
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getUsers);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

export default router;
