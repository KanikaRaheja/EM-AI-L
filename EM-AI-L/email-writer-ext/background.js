// Background script to handle API calls and bypass CORS
console.log('Background script loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background script received message:', request);
    
    if (request.action === 'generateEmail') {
        console.log('Starting AI email generation...');
        console.log('Email content to reply to:', request.emailContent);
        console.log('Requested tone:', request.tone);
        
        generateEmail(request.emailContent, request.tone)
            .then(response => {
                console.log('=== AI REPLY GENERATED ===');
                console.log('Generated reply:', response);
                console.log('=== END AI REPLY ===');
                sendResponse({ success: true, data: response });
            })
            .catch(error => {
                console.error('Background script error:', error);
                sendResponse({ success: false, error: error.message });
            });
        
        // Return true to indicate we will send a response asynchronously
        return true;
    }
});

async function generateEmail(emailContent, tone) {
    try {
        console.log('Making API request to:', 'http://localhost:8080/api/email/generate');
        console.log('Request data:', { emailContent, tone });
        
        const response = await fetch('http://localhost:8080/api/email/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                emailContent: emailContent, 
                tone: tone 
            })
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);

        if (!response.ok) {
            // If server returns 403, it's likely a CORS/server config issue
            if (response.status === 403) {
                throw new Error(`Server returned 403 Forbidden. Please check your Spring Boot server CORS configuration.`);
            }
            throw new Error(`API request failed with status: ${response.status}`);
        }

        const responseText = await response.text();
        console.log('Raw API response received:');
        console.log('--- START API RESPONSE ---');
        console.log(responseText);
        console.log('--- END API RESPONSE ---');
        
        return responseText;
    } catch (error) {
        console.error('Error in background script:', error);
        
        // For testing purposes, return a mock response if the server is not properly configured
        if (error.message.includes('403') || error.message.includes('CORS')) {
            console.log('Returning mock response due to server configuration issue');
            return `Mock AI Reply: Thank you for your email regarding "${emailContent ? emailContent.substring(0, 50) + '...' : 'your message'}". I'll get back to you soon with a detailed response.`;
        }
        
        throw error;
    }
}
