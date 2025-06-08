import axios from 'src/utils/axios';

export async function getProjects() {
  const response = await axios.get('/api/project');
  // Now returns { projects, summary }
  return response.data;
}

export async function getProjectById(id) {
  const response = await axios.get(`/api/project/${id}`);
  return response.data.data;
}
