import axios from "axios";


// export const api = axios.create({ baseURL: "/api" });

// export interface Paginated<T> { data: T[]; page: number; limit: number; total: number }


export const api = axios.create({
  baseURL: "http://localhost:5000/api", // matches your Express server prefix
});
