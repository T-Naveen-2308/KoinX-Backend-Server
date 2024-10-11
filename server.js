import exp from "express";
import cron from "node-cron";
import dotenv from "dotenv";
import mainApp from "./routes/routes.js";
import customAxios from "./utils/customAxios.js";
import { PrismaClient } from "@prisma/client/default.js";

dotenv.config();

const app = exp();
const prisma = new PrismaClient();

const fetchPrices = () => {
    customAxios
        .get("/price", {
            params: {
                ids: "bitcoin,matic-network,ethereum",
                vs_currencies: "usd",
                include_market_cap: true,
                include_24hr_vol: false,
                include_24hr_change: true,
                include_last_updated_at: false,
                precision: 12
            }
        })
        .then(async (response) => {
            if (response.status !== 200) {
                throw new Error(`Unexpected status code: ${response.status}`);
            }
            try {
                const newCoins = await prisma.coin.createMany({
                    data: [
                        {
                            coinType: "bitcoin",
                            price: response.data.bitcoin.usd,
                            marketCap: response.data.bitcoin.usd_market_cap,
                            change24Hour: response.data.bitcoin.usd_24h_change
                        },
                        {
                            coinType: "ethereum",
                            price: response.data.ethereum.usd,
                            marketCap: response.data.ethereum.usd_market_cap,
                            change24Hour: response.data.ethereum.usd_24h_change
                        },
                        {
                            coinType: "matic_network",
                            price: response.data["matic-network"].usd,
                            marketCap:
                                response.data["matic-network"].usd_market_cap,
                            change24Hour:
                                response.data["matic-network"].usd_24h_change
                        }
                    ]
                });
            } catch (error) {
                console.error("Error creating new coin entry:", error);
                throw error;
            }
        })
        .catch((error) => {
            console.error("Error during API call:", error);
        });
};

fetchPrices();

cron.schedule("0 */2 * * *", () => {
    console.log("Running API call every 2 hours");
    fetchPrices();
});

app.use(exp.json());

app.use("/api", mainApp);

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`\nHTTP Server on Port ${port}`);
});

process.on("SIGINT", async () => {
    await prisma.$disconnect();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    await prisma.$disconnect();
    process.exit(0);
});
