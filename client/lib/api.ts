import axios from "axios";

export const api = axios.create({ baseURL: "/api" });

export interface Paginated<T> { data: T[]; page: number; limit: number; total: number }
