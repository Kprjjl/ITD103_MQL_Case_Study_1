import axios from "axios";

export const fetchRegistrations = async () => {
  try {
    const response = await axios.get("http://localhost:3001/registrations", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    console.log("response.data", response.data)
    return response.data;
  } catch (error) {
    console.error("Error fetching registrations:", error);
  }
};

export const fetchTenants = async () => {
  try {
    const response = await axios.get("http://localhost:3001/users", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching tenants:", error);
  }
};

export const fetchRooms = async () => {
  try {
    const response = await axios.get("http://localhost:3001/rooms", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  }
  catch (error) {
    console.error("Error fetching rooms:", error);
  }
};

export const fetchSalesStatistics = async () => {
  try {
    const response = await axios.get("http://localhost:3001/sales-statistics", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching sales statistics:", error);
  }
};
