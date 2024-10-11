import { PrismaClient, CoinType } from "@prisma/client";
import { round } from "../utils/utils.js";
import { Request, Response, NextFunction } from "express-serve-static-core";

const prisma = new PrismaClient();

// GET https://localhost:4000/api/stats?coin=
async function getStatistics(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    let { coin } = req.query as { coin: string };
    let coinEnum: CoinType;
    switch (coin) {
        case "bitcoin":
            coinEnum = CoinType.bitcoin;
            break;
        case "matic-network":
            coinEnum = CoinType.matic_network;
            break;
        case "ethereum":
            coinEnum = CoinType.ethereum;
            break;
        default:
            return res.status(400).send({
                message:
                    "Invalid coin type. Only bitcoin, matic-network and ethereum are allowed."
            });
    }
    const coinData = await prisma.coin.findFirst({
        where: { coinType: coinEnum },
        orderBy: { createdTime: "desc" },
        select: { price: true, marketCap: true, change24Hour: true }
    });
    if (!coinData) {
        return res.status(404).send({
            message: "Coin data not found."
        });
    }
    return res.status(200).send({
        price: round(coinData.price, 2),
        marketCap: round(coinData.marketCap, 2),
        "24hChange": round(coinData.change24Hour, 2)
    });
}

// GET https://localhost:4000/api/deviation?coin=
async function getDeviation(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    let { coin } = req.query as { coin: string };
    let coinEnum: CoinType;
    switch (coin) {
        case "bitcoin":
            coinEnum = CoinType.bitcoin;
            break;
        case "matic-network":
            coinEnum = CoinType.matic_network;
            break;
        case "ethereum":
            coinEnum = CoinType.ethereum;
            break;
        default:
            return res.status(400).send({
                message:
                    "Invalid coin type. Only bitcoin, matic-network and ethereum are allowed."
            });
    }
    const coins = await prisma.coin.findMany({
        where: { coinType: coinEnum },
        orderBy: { createdTime: "desc" },
        select: { price: true },
        take: 100
    });
    const mean =
        coins.map((coin) => coin.price).reduce((acc, curr) => acc + curr, 0) /
        coins.length;
    const variance =
        coins
            .map((coin) => Math.pow(coin.price - mean, 2))
            .reduce((acc, curr) => acc + curr, 0) / coins.length;
    const standardDeviation = Math.sqrt(variance);
    return res.status(200).send({ deviation: round(standardDeviation, 2) });
}

export { getStatistics, getDeviation };
