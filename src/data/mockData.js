// Mock data for the app

export const MOCK_USER = {
    id: 'user_001',
    name: 'Rajesh Kumar',
    phone: '+91 9876543210',
    email: 'rajesh@example.com',
    addresses: [
        {
            id: 'addr_001',
            label: 'Home',
            address: '123, MG Road, Bangalore',
            latitude: 12.9716,
            longitude: 77.5946,
        },
        {
            id: 'addr_002',
            label: 'Office',
            address: '45, Brigade Road, Bangalore',
            latitude: 12.9698,
            longitude: 77.5990,
        },
    ],
};

export const MOCK_MENU = [
    // Tea items

    {
        id: 'item_001',
        name: 'Premium tea',
        category: 'tea',
        price: 15,
        image: 'https://www.munatycooking.com/wp-content/uploads/2024/04/Three-glasses-filled-with-karak-chai-500x500.jpg',
        description: 'Authentic premium tea',
        available: true,
    },
    {
        id: 'item_002',
        name: 'Flask Tea',
        category: 'tea',
        price: 120,
        image: 'https://www.suranasons.in/cdn/shop/files/Untitled_design_2_92a180c0-b482-42cb-b8bd-93bb697afc2d.png?v=1725386672&width=1445',
        description: 'Serves 10 tea',
        available: true,
    },
];

export const MOCK_VEHICLES = [
    {
        id: 'vehicle_001',
        name: 'Chai Cart #1',
        employeeName: 'Suresh',
        employeePhone: '+91 9876543211',
        vehicleNumber: 'KA01AB1234',
        latitude: 12.9750,
        longitude: 77.5980,
        status: 'available',
        rating: 4.5,
        type: 'tea',
    },
    {
        id: 'vehicle_002',
        name: 'Coffee Express #2',
        employeeName: 'Ramesh',
        employeePhone: '+91 9876543212',
        vehicleNumber: 'KA01CD5678',
        latitude: 12.9680,
        longitude: 77.5920,
        status: 'available',
        rating: 4.8,
        type: 'tea',
    },
    {
        id: 'vehicle_003',
        name: 'Tea & Coffee #3',
        employeeName: 'Mahesh',
        employeePhone: '+91 9876543213',
        vehicleNumber: 'KA01EF9012',
        latitude: 12.9730,
        longitude: 77.6000,
        status: 'busy',
        rating: 4.3,
        type: 'both',
    },
    {
        id: 'vehicle_004',
        name: 'Chai Point #4',
        employeeName: 'Ganesh',
        employeePhone: '+91 9876543214',
        vehicleNumber: 'KA01GH3456',
        latitude: 12.9700,
        longitude: 77.5950,
        status: 'available',
        rating: 4.6,
        type: 'tea',
    },
];

export const MOCK_ORDERS = [
    {
        id: 'order_001',
        userId: 'user_001',
        vehicleId: 'vehicle_001',
        items: [
            { ...MOCK_MENU[0], quantity: 2 },
        ],
        totalAmount: 30,
        status: 'on_the_way',
        orderTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        estimatedDelivery: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        deliveryAddress: MOCK_USER.addresses[0],
    },
    {
        id: 'order_002',
        userId: 'user_001',
        vehicleId: 'vehicle_002',
        items: [
            { ...MOCK_MENU[1], quantity: 1 },
        ],
        totalAmount: 120,
        status: 'delivered',
        orderTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        deliveryTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000).toISOString(),
        deliveryAddress: MOCK_USER.addresses[0],
    },
    {
        id: 'order_003',
        userId: 'user_001',
        vehicleId: 'vehicle_004',
        items: [
            { ...MOCK_MENU[0], quantity: 3 },
            { ...MOCK_MENU[1], quantity: 1 },
        ],
        totalAmount: 165,
        status: 'delivered',
        orderTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        deliveryTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
        deliveryAddress: MOCK_USER.addresses[1],
    },
];

export default {
    MOCK_USER,
    MOCK_MENU,
    MOCK_VEHICLES,
    MOCK_ORDERS,
};
