// ================================
// Contact Page JavaScript
// ================================

class ContactFormManager extends ArchStudio.FormManager {
    constructor() {
        super();
        this.contactForm = document.getElementById('contact-form');
        this.init();
    }

    init() {
        if (!this.contactForm) return;
        
        this.bindAdvancedValidation();
        this.setupFieldInteractions();
        this.initializeFormTracking();
    }

    bindAdvancedValidation() {
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const messageInput = document.getElementById('message');

        // Email validation with suggestions
        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                this.validateEmailWithSuggestions(emailInput);
            });
        }

        // Phone formatting
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                this.formatPhoneNumber(e.target);
            });
        }

        // Message character counter
        if (messageInput) {
            this.addCharacterCounter(messageInput);
        }
    }

    validateEmailWithSuggestions(input) {
        const email = input.value.trim();
        if (!email) return;

        const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
        const emailParts = email.split('@');
        
        if (emailParts.length === 2) {
            const domain = emailParts[1];
            const suggestion = this.suggestDomain(domain, commonDomains);
            
            if (suggestion && suggestion !== domain) {
                this.showEmailSuggestion(input, `${emailParts[0]}@${suggestion}`);
            }
        }
    }

    suggestDomain(domain, commonDomains) {
        const threshold = 2; // Levenshtein distance threshold
        
        for (const commonDomain of commonDomains) {
            if (this.levenshteinDistance(domain, commonDomain) <= threshold) {
                return commonDomain;
            }
        }
        return null;
    }

    levenshteinDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
        
        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
        
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i] + 1,
                    matrix[j - 1][i - 1] + indicator
                );
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    showEmailSuggestion(input, suggestedEmail) {
        let suggestionDiv = document.getElementById('email-suggestion');
        
        if (!suggestionDiv) {
            suggestionDiv = document.createElement('div');
            suggestionDiv.id = 'email-suggestion';
            suggestionDiv.className = 'email-suggestion';
            input.parentNode.appendChild(suggestionDiv);
        }

        suggestionDiv.innerHTML = `
            <p class="suggestion-text">
                Did you mean <button type="button" class="suggestion-link">${suggestedEmail}</button>?
            </p>
        `;

        const suggestionLink = suggestionDiv.querySelector('.suggestion-link');
        suggestionLink.addEventListener('click', () => {
            input.value = suggestedEmail;
            suggestionDiv.remove();
            this.validateField(input);
        });

        // Add styles
        if (!document.getElementById('email-suggestion-styles')) {
            const styles = document.createElement('style');
            styles.id = 'email-suggestion-styles';
            styles.textContent = `
                .email-suggestion {
                    margin-top: 8px;
                    padding: 12px;
                    background: #FFF3CD;
                    border: 1px solid #FFEAA7;
                    border-radius: 6px;
                    font-size: 14px;
                }
                
                .suggestion-text {
                    margin: 0;
                    color: #856404;
                }
                
                .suggestion-link {
                    color: var(--color-accent);
                    background: none;
                    border: none;
                    text-decoration: underline;
                    cursor: pointer;
                    font-weight: 600;
                }
                
                .suggestion-link:hover {
                    color: var(--color-accent-dark);
                }
            `;
            document.head.appendChild(styles);
        }
    }

    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.length >= 6) {
            value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (value.length >= 3) {
            value = value.replace(/(\d{3})(\d{3})/, '($1) $2');
        } else if (value.length > 0) {
            value = value.replace(/(\d{3})/, '($1');
        }
        
        input.value = value;
    }

    addCharacterCounter(textarea) {
        const maxLength = 1000;
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.innerHTML = `<span class="current">0</span>/<span class="max">${maxLength}</span> characters`;
        
        textarea.parentNode.appendChild(counter);
        
        textarea.addEventListener('input', () => {
            const current = textarea.value.length;
            counter.querySelector('.current').textContent = current;
            
            if (current > maxLength * 0.9) {
                counter.classList.add('warning');
            } else {
                counter.classList.remove('warning');
            }
            
            if (current > maxLength) {
                counter.classList.add('error');
                textarea.value = textarea.value.substring(0, maxLength);
            } else {
                counter.classList.remove('error');
            }
        });

        // Add styles
        if (!document.getElementById('character-counter-styles')) {
            const styles = document.createElement('style');
            styles.id = 'character-counter-styles';
            styles.textContent = `
                .character-counter {
                    text-align: right;
                    font-size: 12px;
                    color: var(--color-text-secondary);
                    margin-top: 4px;
                }
                
                .character-counter.warning {
                    color: var(--color-warning);
                }
                
                .character-counter.error {
                    color: var(--color-error);
                }
            `;
            document.head.appendChild(styles);
        }
    }

    setupFieldInteractions() {
        // Auto-advance from name to email
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        
        if (nameInput && emailInput) {
            nameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Tab' && nameInput.value.trim().length > 0) {
                    emailInput.focus();
                }
            });
        }

        // Smart field suggestions based on project type
        const projectTypeSelect = document.getElementById('project-type');
        const budgetSelect = document.getElementById('budget');
        
        if (projectTypeSelect && budgetSelect) {
            projectTypeSelect.addEventListener('change', () => {
                this.updateBudgetSuggestions(projectTypeSelect.value, budgetSelect);
            });
        }
    }

    updateBudgetSuggestions(projectType, budgetSelect) {
        const budgetRanges = {
            residential: ['100k-500k', '500k-1m', '1m-plus'],
            commercial: ['500k-1m', '1m-plus'],
            institutional: ['1m-plus'],
            renovation: ['under-100k', '100k-500k'],
            consultation: ['under-100k']
        };

        const suggestedRanges = budgetRanges[projectType] || [];
        const options = budgetSelect.querySelectorAll('option');

        options.forEach(option => {
            if (option.value === '') return; // Skip placeholder
            
            if (suggestedRanges.includes(option.value)) {
                option.style.backgroundColor = '#FFF3CD';
                option.style.fontWeight = '600';
            } else {
                option.style.backgroundColor = '';
                option.style.fontWeight = '';
            }
        });
    }

    initializeFormTracking() {
        // Track form interactions for analytics
        const formElements = this.contactForm.querySelectorAll('input, textarea, select');
        
        formElements.forEach(element => {
            element.addEventListener('focus', () => {
                this.trackFormEvent('field_focus', element.name);
            });
            
            element.addEventListener('blur', () => {
                if (element.value.trim()) {
                    this.trackFormEvent('field_complete', element.name);
                }
            });
        });
    }

    trackFormEvent(eventType, fieldName) {
        // This would integrate with your analytics platform
        console.log(`Form Event: ${eventType} - ${fieldName}`);
        
        // Example: Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventType, {
                'custom_parameter': fieldName
            });
        }
    }

    async submitForm(form) {
        // Enhanced form submission with better user feedback
        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        
        // Show loading state
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
        submitBtn.disabled = true;

        try {
            // Collect form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Add timestamp
            data.timestamp = new Date().toISOString();
            
            // Simulate API call
            await this.submitToAPI(data);
            
            // Track successful submission
            this.trackFormEvent('form_submit_success', 'contact_form');
            
            // Show success message
            this.showFormSuccess(form);
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showFormError('There was an error submitting your message. Please try again or contact us directly.');
            this.trackFormEvent('form_submit_error', 'contact_form');
        } finally {
            // Reset button state
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
            submitBtn.disabled = false;
        }
    }

    async submitToAPI(data) {
        // This would be your actual API endpoint
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate random success/failure for demo
                if (Math.random() > 0.1) { // 90% success rate
                    console.log('Form submitted successfully:', data);
                    resolve(data);
                } else {
                    reject(new Error('Simulated API error'));
                }
            }, 2000);
        });
    }

    showFormError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
                <button class="error-dismiss">&times;</button>
            </div>
        `;

        this.contactForm.insertBefore(errorDiv, this.contactForm.firstChild);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);

        // Manual dismiss
        errorDiv.querySelector('.error-dismiss').addEventListener('click', () => {
            errorDiv.remove();
        });

        // Add styles if not already present
        if (!document.getElementById('form-error-styles')) {
            const styles = document.createElement('style');
            styles.id = 'form-error-styles';
            styles.textContent = `
                .form-error-message {
                    margin-bottom: 20px;
                    background: #F8D7DA;
                    border: 1px solid #F5C6CB;
                    border-radius: 6px;
                    padding: 15px;
                    color: #721C24;
                }
                
                .error-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .error-content i {
                    color: #DC3545;
                    font-size: 18px;
                }
                
                .error-content p {
                    flex: 1;
                    margin: 0;
                }
                
                .error-dismiss {
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #721C24;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                }
            `;
            document.head.appendChild(styles);
        }
    }
}

// Office Hours Manager
class OfficeHoursManager {
    constructor() {
        this.hoursElement = document.querySelector('.contact-detail-text');
        this.init();
    }

    init() {
        this.updateOfficeStatus();
        
        // Update every minute
        setInterval(() => {
            this.updateOfficeStatus();
        }, 60000);
    }

    updateOfficeStatus() {
        if (!this.hoursElement) return;

        const now = new Date();
        const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const hour = now.getHours();
        const isWeekday = day >= 1 && day <= 5; // Monday to Friday
        const isSaturday = day === 6;
        const isOpen = (isWeekday && hour >= 9 && hour < 18) || 
                      (isSaturday && hour >= 10 && hour < 16);

        const statusIndicator = document.createElement('div');
        statusIndicator.className = `office-status ${isOpen ? 'open' : 'closed'}`;
        statusIndicator.innerHTML = `
            <span class="status-dot"></span>
            <span class="status-text">${isOpen ? 'Open Now' : 'Closed'}</span>
        `;

        // Remove existing status if any
        const existingStatus = this.hoursElement.parentNode.querySelector('.office-status');
        if (existingStatus) {
            existingStatus.remove();
        }

        this.hoursElement.parentNode.appendChild(statusIndicator);

        // Add styles
        if (!document.getElementById('office-status-styles')) {
            const styles = document.createElement('style');
            styles.id = 'office-status-styles';
            styles.textContent = `
                .office-status {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 8px;
                    font-size: 14px;
                    font-weight: 600;
                }
                
                .status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }
                
                .office-status.open .status-dot {
                    background: var(--color-success);
                }
                
                .office-status.closed .status-dot {
                    background: var(--color-error);
                }
                
                .office-status.open .status-text {
                    color: var(--color-success);
                }
                
                .office-status.closed .status-text {
                    color: var(--color-error);
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `;
            document.head.appendChild(styles);
        }
    }
}

// Contact Map Manager (for future integration)
class ContactMapManager {
    constructor() {
        this.mapContainer = document.querySelector('.map-container');
        this.init();
    }

    init() {
        if (!this.mapContainer) return;
        
        // Add click handler to show full map
        this.mapContainer.addEventListener('click', () => {
            this.openFullMap();
        });
    }

    openFullMap() {
        // This would integrate with Google Maps or similar
        const address = "123 Design Street, Creative District, Portland, OR 97201";
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        window.open(mapsUrl, '_blank');
    }
}

// Initialize contact page functionality
document.addEventListener('DOMContentLoaded', () => {
    const contactFormManager = new ContactFormManager();
    const officeHoursManager = new OfficeHoursManager();
    const contactMapManager = new ContactMapManager();

    // Add form progress tracking
    const formInputs = document.querySelectorAll('#contact-form input, #contact-form textarea, #contact-form select');
    let completedFields = 0;
    
    formInputs.forEach(input => {
        input.addEventListener('blur', () => {
            const isCompleted = input.value.trim() !== '';
            const wasCompleted = input.dataset.completed === 'true';
            
            if (isCompleted && !wasCompleted) {
                completedFields++;
                input.dataset.completed = 'true';
            } else if (!isCompleted && wasCompleted) {
                completedFields--;
                input.dataset.completed = 'false';
            }
            
            const progress = (completedFields / formInputs.length) * 100;
            console.log(`Form completion: ${Math.round(progress)}%`);
        });
    });
});