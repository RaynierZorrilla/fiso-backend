
import { Router } from 'express';
import { handleFinanceBot } from '../controllers/finance-bot.controller';

const router = Router();

router.post('/', handleFinanceBot);

export default router;
