import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const customAxios = axios.create({
    baseURL: process.env.BASE_URL,
    timeout: Number(process.env.TIMEOUT),
    headers: {
        Accept: "application/json",
        "x-cg-demo-api-key": process.env.API_KEY
    }
});

export default customAxios;
