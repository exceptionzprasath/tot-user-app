// Mock authentication service

let currentUser = null;
let sentOTP = null;

export const sendOTP = async (phoneNumber) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Generate a random 4-digit OTP
            sentOTP = Math.floor(1000 + Math.random() * 9000).toString();
            console.log(`[Mock OTP] Sent OTP ${sentOTP} to ${phoneNumber}`);

            resolve({
                success: true,
                message: 'OTP sent successfully',
                // In production, don't return OTP in response!
                // This is only for testing
                otp: sentOTP,
            });
        }, 1000);
    });
};

export const verifyOTP = async (phoneNumber, otp) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // For mock purposes, accept any 4-digit OTP
            if (otp.length === 4) {
                const mockToken = 'mock_token_' + Date.now();
                currentUser = {
                    phone: phoneNumber,
                    token: mockToken,
                };

                console.log(`[Mock Auth] OTP verified for ${phoneNumber}`);

                resolve({
                    success: true,
                    message: 'Login successful',
                    token: mockToken,
                    user: currentUser,
                });
            } else {
                resolve({
                    success: false,
                    message: 'Invalid OTP',
                });
            }
        }, 800);
    });
};

export const logout = () => {
    currentUser = null;
    sentOTP = null;
    console.log('[Mock Auth] User logged out');
};

export const getCurrentUser = () => {
    return currentUser;
};

export default {
    sendOTP,
    verifyOTP,
    logout,
    getCurrentUser,
};
