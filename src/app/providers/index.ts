import axios from "axios";
import { SERVER_URL } from "src/environments/environment";

export const httpAuthProvider = axios.create(
    {
        baseURL: SERVER_URL,
        withCredentials: false,
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            'X-Requested-With': 'XMLHttpRequest',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
            'Access-Control-Request-Method': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
            'Access-Control-Allow-Headers': 'Origin'
        }
    });
