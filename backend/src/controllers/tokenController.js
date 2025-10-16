const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ✅ Koop tokens
const buyTokens = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount || amount <= 0)
      return res.status(400).json({ error: 'Invalid token amount' });

    const transaction = await prisma.tokenTransaction.create({
      data: {
        userId,
        amount: Number(amount),
        type: 'purchase',
      },
    });

    res.status(201).json({ message: 'Tokens purchased successfully', transaction });
  } catch (err) {
    console.error('Error buying tokens:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ Gebruik tokens (bijv. bij boeken)
const useTokens = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount || amount <= 0)
      return res.status(400).json({ error: 'Invalid token amount' });

    // check huidige saldo
    const balance = await prisma.tokenTransaction.aggregate({
      _sum: { amount: true },
      where: { userId },
    });

    const totalTokens = balance._sum.amount || 0;
    if (totalTokens < amount)
      return res.status(400).json({ error: 'Not enough tokens' });

    const transaction = await prisma.tokenTransaction.create({
      data: {
        userId,
        amount: -Number(amount),
        type: 'use',
      },
    });

    res.status(201).json({ message: 'Tokens used successfully', transaction });
  } catch (err) {
    console.error('Error using tokens:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ Bekijk tokens per user
 const getUserTokens = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await prisma.tokenTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const balance = await prisma.$transaction.aggregate({
      _sum: { amount: true },
      where: { userId },
    });

    const totalTokens = balance._sum.amount || 0;

    res.json({
      totalTokens,
      transactions,
    });
  } catch (err) {
    console.error('Error fetching user tokens:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


module.exports = { buyTokens, useTokens, getUserTokens };
