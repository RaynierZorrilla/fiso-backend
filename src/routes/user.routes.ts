import { Router, Request, Response } from 'express';
import { User } from '../entities/User';
import { AppDataSource } from '../config/data-source';

const router = Router();
const userRepo = AppDataSource.getRepository(User);

router.get('/', async (_req: Request, res: Response) => {
    const users = await userRepo.find();
    res.json(users);
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
    const { name, email, password } = req.body;

    try {
        const existing = await userRepo.findOneBy({ email });
        if (existing) {
            res.status(400).json({ error: 'Email already registered' });
            return;
        }

        const user = userRepo.create({ name, email, password });
        await userRepo.save(user);

        res.status(201).json(user);
    } catch (error) {
        console.error('❌ Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;