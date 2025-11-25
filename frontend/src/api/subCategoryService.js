// import axios from "axios";

// const API_URL = "http://localhost:3000/subcategories";

// // LIST all subcategories
// export const listSubCategories = async () => {
//   const res = await axios.get(API_URL);
//   return res.data;
// };

// // GET subcategory by ID
// export const getSubCategoryById = async (id) => {
//   const res = await axios.get(`${API_URL}/${id}`);
//   return res.data;
// };

// // CREATE subcategory
// export const createSubCategory = async (data) => {
//   const res = await axios.post(API_URL, data);
//   return res.data;
// };

// // UPDATE subcategory
// export const updateSubCategory = async (id, data) => {
//   const res = await axios.put(`${API_URL}/${id}`, data);
//   return res.data;
// };

// // DELETE subcategory
// export const deleteSubCategory = async (id) => {
//   const res = await axios.delete(`${API_URL}/${id}`);
//   return res.data;
// };

// import axios from "axios";

// const API_URL = "http://localhost:3000/subcategories";

import api from "./axios";

// --- Subcategory API Endpoints ---
export const listSubCategories = () => api.get("/subcategory");
export const getSubCategoryById = (id) => api.get(`/subcategory/${id}`);
export const createSubCategory = (data) => api.post("/subcategory", data);
export const updateSubCategory = (id, data) =>
  api.put(`/subcategory/${id}`, data);
export const deleteSubCategory = (id) => api.delete(`/subcategory/${id}`);
