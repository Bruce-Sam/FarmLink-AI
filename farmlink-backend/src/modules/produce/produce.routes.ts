import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { uuidParam } from '../../utils/common-schemas';
import { getCategory, listCategories } from './produce.controller';

const router = Router();

router.get('/', listCategories);
router.get('/:categoryId', validate({ params: uuidParam('categoryId') }), getCategory);

export const produceRoutes = router;
