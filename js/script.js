// Wait for DOM to be fully loaded before executing code
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
    // Add a global variable for backend URL
    const BACKEND_URL = 'http://localhost:3000';
    
    // Initialize variables
    const header = document.querySelector('header');
    const pollOptions = document.querySelectorAll('.poll-option');
    const heroContent = document.querySelector('.hero-content');
    const heroImage = document.querySelector('.hero-image');
    const visionSection = document.getElementById('vision');
    const visionContent = document.querySelector('#vision .vision-content');
    const visionImage = document.querySelector('#vision .vision-image');
    
    // Log for debugging
    console.log('Parallax elements:', { heroContent, heroImage, visionContent, visionImage });
    
    // Simple parallax scrolling effect
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        
        // For the hero section
        if (heroContent && heroImage) {
            heroContent.style.transform = `translateY(${scrollPosition * 0.2}px)`;
            heroImage.style.transform = `translateY(-${scrollPosition * 0.1}px)`;
        }
        
        // For the vision section
        // Ensure visionSection, visionContent, and visionImage are the variables defined at the top of DOMContentLoaded
        if (visionSection && visionContent && visionImage) {
            const rect = visionSection.getBoundingClientRect();
            
            if (rect.top < window.innerHeight && rect.bottom > 0) { // If section is visible in viewport
                // Calculate scroll relative to the section's original top position.
                // This value is 0 when the section's top aligns with the viewport's top.
                const relativeScroll = scrollPosition - visionSection.offsetTop;

                // Apply parallax transforms similar to hero section
                // Positive factor for translateY makes it scroll slower (appears to move down less than page scroll)
                // Negative factor for translateY makes it scroll faster or reverse (appears to move up relative to page scroll)
                visionContent.style.transform = `translateY(${relativeScroll * 0.2}px)`;
                visionImage.style.transform = `translateY(${relativeScroll * -0.1}px)`;
            } else {
                // Reset transform when the section is not visible to avoid it being stuck
                visionContent.style.transform = 'translateY(0px)';
                visionImage.style.transform = 'translateY(0px)';
            }
        }
        
        // Header scroll effect
        if (scrollPosition > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Stop propagation for email form elements to keep dropdown open
    document.addEventListener('click', function(e) {
        // Stop propagation for email form elements and prevent dropdown from closing
        if (e.target.classList.contains('signup-email') || 
            e.target.classList.contains('submit-email') ||
            e.target.closest('.email-form')) {
            e.stopPropagation();
        }
    });
    
    // Also prevent dropdown closing when interacting with the email form
    document.addEventListener('focus', function(e) {
        if (e.target.classList.contains('signup-email')) {
            e.stopPropagation();
        }
    }, true);
    
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('signup-email')) {
            e.stopPropagation();
        }
    });
    
    // Toggle dropdown when clicking on interest button
    document.querySelectorAll('.interest-button').forEach(button => {
        button.addEventListener('click', function(e) {
            // Only toggle if clicking directly on the button or arrow (not the dropdown)
            if (e.target.closest('.interest-dropdown')) {
                return;
            }
            
            e.stopPropagation();
            
            // Find the dropdown inside this button
            const dropdown = this.querySelector('.interest-dropdown');
            
            // Get current state
            const isActive = dropdown.classList.contains('active');
            
            // Close all dropdowns first
            document.querySelectorAll('.interest-dropdown').forEach(d => {
                d.classList.remove('active');
            });
            
            document.querySelectorAll('.interest-button').forEach(b => {
                b.classList.remove('active');
            });
            
            // Only open this dropdown if it wasn't already open
            if (!isActive) {
                dropdown.classList.add('active');
                this.classList.add('active');
            }
            
            // Update arrow
            const arrow = this.querySelector('.dropdown-arrow');
            if (dropdown.classList.contains('active')) {
                arrow.style.transform = 'rotate(180deg)';
            } else {
                arrow.style.transform = 'rotate(0deg)';
            }
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        // Only close if click is outside an interest button
        if (!e.target.closest('.interest-button')) {
            document.querySelectorAll('.interest-dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
            
            document.querySelectorAll('.dropdown-arrow').forEach(arrow => {
                arrow.style.transform = 'rotate(0deg)';
            });
        }
    });
    
    // Enhanced interest buttons functionality
    document.addEventListener('click', function(e) {
        // Handle interest poll options
        if (e.target.classList.contains('poll-option')) {
            // Stop propagation to prevent dropdown from closing
            e.stopPropagation();
            
            const option = e.target;
            const value = option.getAttribute('data-value');
            const count = parseInt(option.getAttribute('data-count')) || 0;
            const featureCard = option.closest('.feature-card');
            const featureId = featureCard ? featureCard.id : 'unknown';
            
            // Increment count (only in memory for demo)
            option.setAttribute('data-count', count + 1);
            
            // Add visual feedback that option is selected
            const allOptions = option.closest('.interest-dropdown').querySelectorAll('.poll-option');
            allOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            // If this is the high-interest option, show email form
            if (option.classList.contains('signup-option')) {
                e.stopPropagation();
                console.log('Sign me up clicked!');
                
                // Hide all poll options
                const interestDropdown = option.closest('.interest-dropdown');
                const pollOptions = interestDropdown.querySelectorAll('.poll-option');
                pollOptions.forEach(opt => {
                    opt.style.display = 'none';
                });
                
                // Show email form immediately
                const emailForm = interestDropdown.querySelector('.email-form');
                if (emailForm) {
                    emailForm.classList.remove('hidden');
                    
                    // Focus the email input after a short delay
                    const emailInput = emailForm.querySelector('.signup-email');
                    if (emailInput) {
                        setTimeout(() => {
                            emailInput.focus();
                            console.log('Email input focused');
                        }, 50);
                    }
                }
            } else {
                // For other options, just show confirmation and track vote
                // For "Not interested" or "Yeeah Maybe" options:
                // 1. Add highlight class to the clicked option
                option.classList.add('poll-option-voted');

                const highlightDuration = 500; // Duration for the text to stay green (in ms)
                const closeDelayAfterHighlight = 300; // Delay after highlight removal before closing dropdown (in ms)

                // 2. Set a timer to remove highlight
                setTimeout(() => {
                    option.classList.remove('poll-option-voted');

                    // 3. Then, after another short delay, close the dropdown
                    setTimeout(() => {
                        const dropdown = option.closest('.interest-dropdown');
                        if (dropdown && dropdown.classList.contains('active')) {
                            dropdown.classList.remove('active');
                            
                            const parentButton = dropdown.closest('.interest-button');
                            if (parentButton) {
                                parentButton.classList.remove('active'); // Deactivate parent button as well
                                const arrow = parentButton.querySelector('.dropdown-arrow');
                                if (arrow) {
                                    arrow.style.transform = 'rotate(0deg)';
                                }
                            }
                        }
                    }, closeDelayAfterHighlight);
                }, highlightDuration);
            }
            
            // Send vote to backend API (with fallback to localStorage)
            fetch(`${BACKEND_URL}/api/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ featureId, voteType: value })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Vote recorded:', data);
                // Update admin view if admin mode is enabled
                updateAdminView();
            })
            .catch(error => {
                console.error('Error recording vote (using localStorage fallback):', error);
                // If server is not available, increment count locally anyway
                const newCount = count + 1;
                option.setAttribute('data-count', newCount);
                // Update admin view with local data
                updateAdminView();
            });
            
            console.log(`User interest in ${featureId}: ${value}, count: ${count + 1}`);
        }
        
        // Handle email submissions
        if (e.target.classList.contains('submit-email')) {
            e.preventDefault();
            e.stopPropagation(); // Prevent dropdown from closing
            const submitBtn = e.target;
            const emailForm = submitBtn.closest('.email-form');
            const emailInput = emailForm.querySelector('.signup-email');
            const email = emailInput ? emailInput.value.trim() : '';
            console.log('Email submit clicked:', email);
            
            if (email && isValidEmail(email)) {
                // Here you would typically send this data to a server
                // Valid email, show success message
                submitBtn.parentNode.innerHTML = '<div class="email-success">Thanks! We\'ll be in touch. <span class="success-checkmark">✓</span></div>';
                console.log(`Email submitted: ${email}`);
                
                // Store the email for admin view and send to backend API
                const featureCard = submitBtn.closest('.feature-card');
                if (featureCard) {
                    const featureId = featureCard.id;
                    
                    // Send to backend API with localStorage fallback
                    fetch(`${BACKEND_URL}/api/subscribe`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email, featureId })
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Subscription successful:', data);
                    })
                    .catch(error => {
                        console.error('Error during subscription (using localStorage fallback):', error);
                    });
                }
                
                // Close the dropdown after a short delay to show success
                setTimeout(() => {
                    const dropdown = submitBtn.closest('.interest-dropdown');
                    if (dropdown) {
                        dropdown.classList.remove('active');
                        
                        // Reset dropdown arrow
                        const button = dropdown.closest('.interest-button');
                        if (button) {
                            const arrow = button.querySelector('.dropdown-arrow');
                            if (arrow) arrow.style.transform = 'rotate(0deg)';
                        }
                        
                        // Reset form state after dropdown is closed (for future interactions)
                        setTimeout(() => {
                            // Reset poll options visibility
                            const pollOptions = dropdown.querySelectorAll('.poll-option');
                            pollOptions.forEach(opt => {
                                opt.style.display = '';
                            });
                            
                            // Re-hide the email form
                            const emailForm = dropdown.querySelector('.email-form');
                            if (emailForm) emailForm.classList.add('hidden');
                        }, 300);
                    }
                }, 1500);
            } else {
                // Show error for invalid email
                if (emailInput) {
                    emailInput.classList.add('error');
                    emailInput.placeholder = 'Please enter a valid email';
                    setTimeout(() => {
                        emailInput.classList.remove('error');
                        emailInput.placeholder = 'Your email address';
                    }, 2000);
                }
            }
        }
    });
    
    // Helper function to show feedback confirmation
    function showFeedbackConfirmation(element) {
        const confirmMessage = document.createElement('div');
        confirmMessage.classList.add('poll-confirmation');
        confirmMessage.innerHTML = '<span class="success-checkmark">✓</span>';
        confirmMessage.style.cssText = `
            position: absolute;
            background-color: var(--apple-green);
            color: white;
            padding: 8px 12px;
            border-radius: 50%;
            font-size: 1rem;
            bottom: -40px;
            left: 50%;
            transform: translateX(-50%);
            opacity: 0;
            transition: all 0.3s ease;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        element.closest('.interest-dropdown').appendChild(confirmMessage);
        
        // Animate the confirmation checkmark
        setTimeout(() => {
            confirmMessage.style.opacity = '1';
            confirmMessage.style.bottom = '-30px';
            
            setTimeout(() => {
                confirmMessage.style.opacity = '0';
                confirmMessage.style.bottom = '-40px';
                
                setTimeout(() => {
                    confirmMessage.remove();
                }, 300);
            }, 1500);
        }, 10);
    }
    
    // Helper function to validate email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Check if backend is running (without showing admin panel)
    fetch(`${BACKEND_URL}/api/status`)
        .then(response => response.json())
        .then(data => {
            console.log('Backend status:', data);
            document.body.classList.add('backend-connected');
        })
        .catch(error => {
            console.error('Backend connection error:', error);
            document.body.classList.add('backend-disconnected');
        });
    
    // Share functionality
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            const platform = this.getAttribute('data-platform');
            const url = encodeURIComponent(window.location.href);
            const text = encodeURIComponent('Check out Memojo - Your Memories, Organized Automatically!');
            
            let shareUrl = '';
            
            switch(platform) {
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
                    break;
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                    break;
                case 'email':
                    shareUrl = `mailto:?subject=${text}&body=${url}`;
                    break;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank');
            }
        });
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Account for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Privacy modal functionality
    const privacyBtn = document.getElementById('privacyModal');
    const modal = document.getElementById('privacy-modal');
    const closeModal = document.querySelector('.close-modal');
    
    if (privacyBtn && modal && closeModal) {
        privacyBtn.addEventListener('click', function() {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
        });
        
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Re-enable scrolling
        });
        
        // Close modal when clicking outside the modal content
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Form submission handling
    const androidForm = document.getElementById('android-form');
    const iosForm = document.getElementById('ios-form');
    
    function handleFormSubmit(e, platform) {
        e.preventDefault();
        
        const emailInput = e.target.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        
        if (!email) {
            alert('Please enter your email address');
            return;
        }
        
        // Send beta signup to backend API with localStorage fallback
        fetch(`${BACKEND_URL}/api/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, platform })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Beta signup successful:', data);
        })
        .catch(error => {
            console.error('Error during beta signup (using localStorage fallback):', error);
            // Store beta signup in localStorage as fallback
            const signupKey = `platform-${platform.toLowerCase()}`;
            let betaSignups = JSON.parse(localStorage.getItem('memojoBetaSignups') || '{}');
            if (!betaSignups[signupKey]) {
                betaSignups[signupKey] = [];
            }
            if (!betaSignups[signupKey].includes(email)) {
                betaSignups[signupKey].push(email);
                localStorage.setItem('memojoBetaSignups', JSON.stringify(betaSignups));
            }
        });
        
        const formContainer = e.target.parentElement;
        const originalContent = formContainer.innerHTML;
        
        formContainer.innerHTML = `
            <div class="success-message">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#34c759" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <h3>Thank You!</h3>
                <p>You're signed up for the ${platform} beta. We'll be in touch soon!</p>
            </div>
        `;
        
        // Add some basic styles to the success message
        const successMessage = formContainer.querySelector('.success-message');
        successMessage.style.textAlign = 'center';
        successMessage.style.padding = '2rem 0';
    }
    
    if (androidForm) {
        androidForm.addEventListener('submit', e => handleFormSubmit(e, 'Android'));
    }
    
    if (iosForm) {
        iosForm.addEventListener('submit', e => handleFormSubmit(e, 'iOS'));
    }
    
        // Fixed header appearance after scrolling
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.style.padding = '0.75rem 0';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.padding = '1rem 0';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Animate search examples
    const chips = document.querySelectorAll('.chip');
    
    function animateChips() {
        chips.forEach((chip, index) => {
            setTimeout(() => {
                chip.style.transform = 'scale(1.05)';
                
                setTimeout(() => {
                    chip.style.transform = 'scale(1)';
                }, 300);
            }, index * 300);
        });
    }
    
    // Run the animation once on page load
    setTimeout(animateChips, 2000);
    
    // Then run it periodically
    setInterval(animateChips, 8000);
    
    // Phone mockup animation
    const phoneMockup = document.querySelector('.phone-mockup');
    const screenAnimation = document.querySelector('.search-animation');
    
    // Simulates a search and results view in the phone mockup
    function animatePhoneScreen() {
        if (!phoneMockup || !screenAnimation) return;
        
        // Phase 1: Loading animation (already in CSS)
        
        // Phase 2: After loading, show search results (simulated)
        setTimeout(() => {
            screenAnimation.style.background = 'white';
            screenAnimation.innerHTML = `
                <div class="mock-search-interface">
                    <div class="mock-search-bar"></div>
                    <div class="mock-results">
                        <div class="mock-result"></div>
                        <div class="mock-result"></div>
                        <div class="mock-result"></div>
                        <div class="mock-result"></div>
                    </div>
                </div>
            `;
            
            // Add some basic styles to the mocked elements
            const searchBar = screenAnimation.querySelector('.mock-search-bar');
            const results = screenAnimation.querySelectorAll('.mock-result');
            
            searchBar.style.margin = '12px';
            searchBar.style.height = '40px';
            searchBar.style.borderRadius = '20px';
            searchBar.style.backgroundColor = '#f0f0f0';
            
            results.forEach((result, index) => {
                result.style.height = '120px';
                result.style.margin = '12px';
                result.style.marginTop = index === 0 ? '24px' : '12px';
                result.style.borderRadius = '8px';
                result.style.backgroundImage = 'linear-gradient(120deg, #f5f5f7 30%, #ffffff 38%, #ffffff 40%, #f5f5f7 48%)';
                result.style.backgroundSize = '200% 100%';
                result.style.animation = 'loading 1.5s infinite';
                
                // Stagger the animations
                result.style.animationDelay = `${index * 0.2}s`;
            });
            
            // Return to the start state after a while
            setTimeout(() => {
                screenAnimation.innerHTML = '';
                screenAnimation.style.background = 'linear-gradient(120deg, #f5f5f7 30%, #ffffff 38%, #ffffff 40%, #f5f5f7 48%)';
                screenAnimation.style.backgroundSize = '200% 100%';
                screenAnimation.style.animation = 'loading 1.5s infinite';
            }, 5000);
        }, 3000);
    }
    
    // Run phone animation once on page load
    setTimeout(animatePhoneScreen, 1000);
    
    // Then run it periodically
    setInterval(animatePhoneScreen, 10000);
    
    // Intersection Observer for fade-in animations
    const animateElements = document.querySelectorAll('.feature-card, .join-card, .privacy-content, .message-box');
    
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Initialize elements for animation and observe them
    animateElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
});
