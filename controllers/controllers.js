import { PrismaClient } from "@prisma/client";
import { round } from "../utils/utils.js";

const prisma = new PrismaClient();

// GET https://localhost:4000/api/stats?coin=
async function getStatistics(req, res) {
    let { coin } = req.query;
    if (coin === "matic-network") {
        coin = "matic_network";
    }
    const coinData = await prisma.coin.findFirst({
        where: { coinType: coin },
        orderBy: { createdTime: "desc" },
        select: { price: true, marketCap: true, change24Hour: true }
    });
    return res.status(200).send({
        price: round(coinData.price, 2),
        marketCap: round(coinData.marketCap, 2),
        "24hChange": round(coinData.change24Hour, 2)
    });
}

// GET https://localhost:4000/api/deviation?coin=
async function getDeviation(req, res) {
    let { coin } = req.query;
    if (coin === "matic-network") {
        coin = "matic_network";
    }
    const coins = await prisma.coin.findMany({
        where: { coinType: coin },
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
