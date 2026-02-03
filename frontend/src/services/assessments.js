import api from '../services/api';

const assessmentsService = {
    // Create a new assessment
    createAssessment: async (data) => {
        try {
            const response = await api.post('/assessments/', data);
            return response;
        } catch (error) {
            console.error('Error creating assessment:', error);
            throw error;
        }
    },

    // Get all assessments
    getAssessments: async (params = {}) => {
        try {
            const response = await api.get('/assessments/', { params });
            return response;
        } catch (error) {
            console.error('Error fetching assessments:', error);
            throw error;
        }
    },

    // Get assessment details by ID - Placeholder for now if needed individually
    getAssessmentById: async (id) => {
        // Assuming GET /assessments/:id endpoint exists or will exist
        // For now using list filter if needed or just placeholder
        return {};
    }
};

export default assessmentsService;
