console.log("Content script loaded");

function createAIButton() {
    const button = document.createElement('div');
    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3 ai-reply-button';
    
    // Apply inline styles to ensure visibility
    button.style.cssText = `
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 8px 16px !important;
        margin: 0 12px 0 4px !important;
        border: 1px solid #0B57D0 !important;
        border-radius: 18px 0px 0px 18px !important;
        background: #0B57D0 !important;
        color: white !important;
        font-family: 'Google Sans', Roboto, Arial, sans-serif !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        cursor: pointer !important;
        height: 36px !important;
        min-width: 80px !important;
        z-index: 9999 !important;
        position: relative !important;
        visibility: visible !important;
        opacity: 1 !important;
    `;
    
    button.innerHTML = 'AI Reply';
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');
    return button;
}

function findToolbar() {
    // More specific selectors for reply scenarios
    const selectors = [
        // Reply-specific toolbars
        '.aDh', // Reply toolbar class
        '.btC', // Compose toolbar class
        'div[role="toolbar"]', // Generic toolbar
        '.gU.Up', // Alternative Gmail toolbar
        '.Am.Al.editable', // Near compose area
        // Look for send button and get its parent
        '[data-tooltip*="Send"] .bAK', // Send button container
        '[data-tooltip*="Send"]', // Send button itself
        '.wO .dC', // Another send button location
        '.dC', // Send button container
        '.bAK', // Another send button class
    ];
    
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            // If we found the send button, get its parent toolbar
            let toolbar = element;
            if (selector.includes('Send') || selector.includes('bAK') || selector.includes('dC')) {
                // Navigate up to find the toolbar container
                toolbar = element.closest('.aDh, .btC, [role="toolbar"], .gU, .wO') || element.parentElement;
            }
            
            if (toolbar && toolbar.offsetWidth > 0 && toolbar.offsetHeight > 0) {
                console.log('Found toolbar with selector:', selector, toolbar);
                return toolbar;
            }
        }
    }
    
    // Try to find any compose container as fallback
    const fallback = document.querySelector('[role="dialog"] .nH') || 
                    document.querySelector('.nH.if') ||
                    document.querySelector('.AD') ||
                    document.querySelector('[role="dialog"]');
    if (fallback) {
        console.log('Using fallback container:', fallback);
        return fallback;
    }
    
    console.log('No toolbar found with any selector');
    return null;
}

function getEmailContent() {
    // Try to find the original email content to reply to
    const selectors = [
        '.h7', // Gmail email content
        '.a3s.aiL', // Alternative email content
        '.gmail_quote', // Quoted content
        '[role="listitem"] .a3s', // Email in conversation
        '.ii.gt .a3s.aiL', // Another email content selector
        '.adn.ads .ii.gt .a3s.aiL' // Deep email content
    ];
    
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content && content.innerText && content.innerText.trim().length > 10) {
            console.log('Found email content with selector:', selector);
            return content.innerText.trim();
        }
    }
    
    console.log('No email content found with any selector');
    return null;
}

function findComposeBox() {
    // Gmail compose box selectors
    const selectors = [
        'div[contenteditable="true"][role="textbox"]', // Modern Gmail compose
        'div[contenteditable="true"][g_editable="true"]', // Alternative Gmail selector
        'div[aria-label*="Message Body"]', // Gmail compose body by aria-label
        'div[aria-label*="message body"]', // Case variation
        'div.Am.Al.editable', // Classic Gmail compose classes
        'div.editable[contenteditable="true"]', // Generic editable div
        'textarea[name="body"]', // Fallback textarea
        'div[role="textbox"]', // Generic textbox role
        '.ii.gt .Am.Al.editable', // Nested Gmail compose
        'div[contenteditable="true"]:not([role="button"])', // Any contenteditable that's not a button
    ];

    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && isVisibleElement(element)) {
            console.log('Found compose box with selector:', selector);
            return element;
        }
    }
    
    console.log('No compose box found');
    return null;
}

function isVisibleElement(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           element.offsetWidth > 0 && 
           element.offsetHeight > 0;
}

function injectButton() {
    console.log("injectButton called");
    
    const existingButton = document.querySelector('.ai-reply-button');
    if (existingButton) {
        console.log("Removing existing button");
        existingButton.remove();
    }
    
    const toolbar = findToolbar();
    if (!toolbar) {
        console.log("Toolbar not found - cannot inject button");
        return;
    }
    
    console.log("Creating and injecting button into:", toolbar);
    const newButton = createAIButton();
    
    newButton.addEventListener('click', async () => {
        try {
            console.log('AI Reply button clicked - starting AI generation');
            
            // Update button state to show loading
            const originalText = newButton.innerHTML;
            newButton.innerHTML = 'Generating...';
            newButton.style.background = '#f1f3f4 !important';
            newButton.style.color = '#5f6368 !important';
            newButton.style.cursor = 'not-allowed !important';
            newButton.disabled = true;

            // Get the email content to reply to
            const emailContent = getEmailContent();
            console.log('=== EMAIL CONTENT EXTRACTION ===');
            console.log('Email content found:', emailContent);
            console.log('=== END EMAIL CONTENT ===');
            
            if (!emailContent) {
                throw new Error('Could not find email content to reply to');
            }
            
            // Check if background script is available
            if (!chrome.runtime || !chrome.runtime.sendMessage) {
                throw new Error('Chrome runtime messaging not available');
            }
            
            // Send request to background script for AI generation
            console.log('Sending message to background script for AI generation');
            const response = await new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({
                    action: 'generateEmail',
                    emailContent: emailContent,
                    tone: 'Professional'
                }, (response) => {
                    console.log('=== BACKGROUND SCRIPT RESPONSE ===');
                    console.log('Received response from background:', response);
                    console.log('=== END BACKGROUND RESPONSE ===');
                    
                    if (chrome.runtime.lastError) {
                        console.error('Chrome runtime error:', chrome.runtime.lastError.message);
                        reject(new Error(chrome.runtime.lastError.message));
                    } else if (response && response.success) {
                        console.log('=== AI GENERATED REPLY ===');
                        console.log('AI generation successful:', response.data);
                        console.log('=== END AI REPLY ===');
                        resolve(response.data);
                    } else if (response && response.error) {
                        console.error('AI generation error:', response.error);
                        reject(new Error(response.error));
                    } else {
                        console.error('Unexpected response format:', response);
                        reject(new Error('Invalid response from background script'));
                    }
                });
            });

            // Find the compose box to insert the AI reply
            const composeBox = findComposeBox();
            console.log('Compose box found:', composeBox);

            if (composeBox) {
                composeBox.focus();
                console.log('=== INSERTING AI REPLY INTO COMPOSE BOX ===');
                console.log('AI reply to insert:', response);
                console.log('Compose box found:', composeBox);
                console.log('=== END INSERTION INFO ===');
                
                // Clear existing content
                composeBox.innerHTML = '';
                
                // Insert the AI-generated reply
                if (composeBox.isContentEditable) {
                    try {
                        document.execCommand('insertText', false, response);
                        console.log('AI reply inserted using execCommand');
                    } catch (e) {
                        composeBox.innerHTML = response.replace(/\n/g, '<br>');
                        console.log('AI reply inserted using innerHTML');
                    }
                } else {
                    composeBox.value = response;
                    console.log('AI reply inserted using value property');
                }
                
                // Trigger events to ensure Gmail recognizes the change
                const events = ['input', 'change', 'keyup', 'paste'];
                events.forEach(eventType => {
                    composeBox.dispatchEvent(new Event(eventType, { bubbles: true }));
                });
                
                // Move cursor to end
                if (composeBox.isContentEditable) {
                    const range = document.createRange();
                    const selection = window.getSelection();
                    range.selectNodeContents(composeBox);
                    range.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
                
                console.log('AI reply successfully inserted');
                
                // Show success state briefly
                newButton.innerHTML = 'Success!';
                newButton.style.background = '#34a853 !important';
                newButton.style.color = 'white !important';
                
            } else {
                throw new Error('Could not find compose box to insert reply');
            }

        } catch (error) {
            console.error('Error generating AI reply:', error);
            
            let errorMessage = 'Failed to generate AI reply';
            if (error && error.message) {
                errorMessage = error.message;
            }
            
            // Show error state
            newButton.innerHTML = 'Error';
            newButton.style.background = '#ea4335 !important';
            newButton.style.color = 'white !important';
            
            // Show user-friendly error message
            if (errorMessage.includes('Extension context invalidated') || 
                errorMessage.includes('message port closed')) {
                alert('Extension was reloaded. Please refresh this Gmail tab and try again.');
            } else if (errorMessage.includes('Could not find email content')) {
                alert('Please make sure you are replying to an email with content.');
            } else if (errorMessage.includes('Could not find compose box')) {
                alert('Please make sure the compose window is open and try again.');
            } else {
                alert('Error generating AI reply: ' + errorMessage);
            }
            
        } finally {
            // Reset button state after 2 seconds
            setTimeout(() => {
                newButton.innerHTML = originalText;
                newButton.style.background = '#0B57D0 !important';
                newButton.style.color = 'white !important';
                newButton.style.cursor = 'pointer !important';
                newButton.disabled = false;
            }, 2000);
        }
    });

    try {
        // Try multiple insertion strategies
        let inserted = false;
        
        // Strategy 1: Insert before send button
        const sendButton = toolbar.querySelector('[data-tooltip*="Send"], .dC, .bAK');
        if (sendButton && !inserted) {
            sendButton.parentElement.insertBefore(newButton, sendButton);
            console.log("Button inserted before send button");
            inserted = true;
        }
        
        // Strategy 2: Insert at the beginning of toolbar
        if (!inserted && toolbar.firstChild) {
            toolbar.insertBefore(newButton, toolbar.firstChild);
            console.log("Button inserted at beginning of toolbar");
            inserted = true;
        }
        
        // Strategy 3: Append to toolbar
        if (!inserted) {
            toolbar.appendChild(newButton);
            console.log("Button appended to toolbar");
            inserted = true;
        }
        
        // Verify the button is actually in the DOM and visible
        setTimeout(() => {
            const buttonInDom = document.querySelector('.ai-reply-button');
            if (buttonInDom) {
                const rect = buttonInDom.getBoundingClientRect();
                console.log("Button position:", rect);
                console.log("Button visible:", rect.width > 0 && rect.height > 0);
                
                // Force visibility if needed
                if (rect.width === 0 || rect.height === 0) {
                    buttonInDom.style.display = 'inline-flex !important';
                    buttonInDom.style.visibility = 'visible !important';
                    console.log("Forced button visibility");
                }
            } else {
                console.log("Button not found in DOM after insertion");
            }
        }, 100);
        
    } catch (error) {
        console.error("Error injecting button:", error);
    }
}

// Observer to watch for compose windows
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElement = addedNodes.some(node => {
            return node.nodeType === Node.ELEMENT_NODE && (
                node.matches('.aDh, .btC, [role="dialog"]') || 
                node.querySelector('.aDh, .btC, [role="dialog"]') ||
                node.querySelector('[data-tooltip*="Send"]') ||
                node.querySelector('.dC, .bAK') // Send button classes
            );
        });

        if (hasComposeElement) {
            console.log("Compose element detected via observer");
            setTimeout(injectButton, 500);
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Manual trigger for debugging - inject button every 3 seconds if compose is open
setInterval(() => {
    const composeOpen = document.querySelector('.aDh, .btC, [role="dialog"], [data-tooltip*="Send"]');
    if (composeOpen && !document.querySelector('.ai-reply-button')) {
        console.log("Manual injection - compose detected but no button found");
        injectButton();
    }
}, 3000);

// Try to inject immediately in case compose is already open
setTimeout(() => {
    console.log("Initial injection attempt");
    injectButton();
}, 1000);