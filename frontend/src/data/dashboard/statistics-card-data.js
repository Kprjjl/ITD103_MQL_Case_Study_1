import axios from "axios";

export const getSalesStatistics = async() => {
    try {
        const response = await axios.get("/sales-statistics");
        return response.data;
    } catch (error) {
        console.error("Error getting sales statistics:", error);
        return null;
    }
}

export const getRegistrations = async() => {
    try {
        const response = await axios.get("/registrations");
        return response.data;
    } catch (error) {
        console.error("Error getting registrations:", error);
        return null;
    }
}
