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