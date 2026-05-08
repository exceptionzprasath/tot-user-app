// Mock menu service
import { MOCK_MENU } from '../data/mockData';

export const getMenuItems = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                data: MOCK_MENU,
            });
        }, 500);
    });
};

export const getMenuByCategory = async (category) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const filtered = MOCK_MENU.filter(item => item.category === category);
            resolve({
                success: true,
                data: filtered,
            });
        }, 300);
    });
};

export default {
    getMenuItems,
    getMenuByCategory,
};
