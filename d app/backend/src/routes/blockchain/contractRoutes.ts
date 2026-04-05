import { Router, Request, Response } from 'express';
import { logger } from '../../utils/logger';
import { ApiError } from '../../middleware/errorHandler';
import { initializeBlockchainService } from '../../services/blockchain/contractService';

const router = Router();

/**
 * POST /api/blockchain/init
 * Initialize blockchain service
 */
router.post('/init', async (req: Request, res: Response) => {
  try {
    initializeBlockchainService();
    res.json({
      success: true,
      message: 'Blockchain service initialized',
    });
  } catch (error) {
    logger.error('Error initializing blockchain:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

/**
 * GET /api/blockchain/config
 * Get blockchain configuration (without sensitive data)
 */
router.get('/config', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        chainId: process.env.CHAIN_ID,
        rpcUrl: process.env.POLYGON_RPC_URL?.substring(0, 30) + '...',
        contractAddress: process.env.SMART_CONTRACT_ADDRESS,
        network: process.env.CHAIN_ID === '137' ? 'Polygon Mainnet' : 'Polygon Testnet',
      },
    });
  } catch (error) {
    logger.error('Error getting blockchain config:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;
