import axios from "axios";

const API_KEY = process.env.REACT_APP_TM_API_KEY;
const BASE_URL = process.env.REACT_APP_TM_BASE_URL;

export const getEvents = async (city, keyword) => {
  try {
    const response = await axios.get(`${BASE_URL}events.json`, {
      params: {
        apikey: API_KEY,
        city: city,
        keyword: keyword,
        size: 10
      }
    });
    return response.data._embedded?.events || [];
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};
