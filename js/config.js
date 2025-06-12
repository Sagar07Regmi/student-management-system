// This file will store configuration variables.
// IMPORTANT: For a real application, sensitive keys should NOT be hardcoded here
// if this file is committed to public version control.
// For Cognito, the User Pool ID and App Client ID are not super secret but API keys are.
// We are not using API keys for API Gateway initially.

const config = {
    cognito: {
        userPoolId: 'YOUR_COGNITO_USER_POOL_ID', // Replace with your User Pool ID
        userPoolWebClientId: 'YOUR_COGNITO_APP_CLIENT_ID', // Replace with your App Client ID
        region: 'ap-south-1' // Replace with your Cognito User Pool region
    },
    api: {
        invokeUrl: 'YOUR_API_GATEWAY_INVOKE_URL' // Replace with your API Gateway invoke URL (e.g., https://xyz.execute-api.region.amazonaws.com/stage)
    }
};

// Make it available globally or for module import
window.appConfig = config;
