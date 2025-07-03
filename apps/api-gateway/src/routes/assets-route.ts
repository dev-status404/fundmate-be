import path from 'path';
import express, { Router } from 'express'; // Add this import

const router = Router();

const assetsPath = path.join(__dirname, '..', '..', '..', '..', 'src', 'assets');
router.use(express.static(assetsPath)); // Change require to express

export default router;
