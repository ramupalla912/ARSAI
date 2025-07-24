// ================================
// Projects Page JavaScript
// ================================

class ProjectFilterManager {
    constructor() {
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.projectCards = document.querySelectorAll('.project-card');
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.animateProjectCards();
    }

    bindEvents() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                this.setActiveFilter(e.target);
                this.filterProjects(filter);
            });
        });
    }

    setActiveFilter(activeButton) {
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        activeButton.classList.add('active');
    }

    filterProjects(filter) {
        this.currentFilter = filter;
        
        this.projectCards.forEach((card, index) => {
            const categories = card.getAttribute('data-category');
            const shouldShow = filter === 'all' || categories.includes(filter);
            
            if (shouldShow) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });

        // Update URL without page reload
        if (history.pushState) {
            const newUrl = filter === 'all' ? 
                window.location.pathname : 
                `${window.location.pathname}?filter=${filter}`;
            history.pushState(null, '', newUrl);
        }
    }

    animateProjectCards() {
        // Initial animation for project cards
        this.projectCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }

    // Public method to set filter from URL
    setFilterFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const filter = urlParams.get('filter') || 'all';
        
        // Find and activate the correct filter button
        const filterButton = document.querySelector(`[data-filter="${filter}"]`);
        if (filterButton) {
            this.setActiveFilter(filterButton);
            this.filterProjects(filter);
        }
    }
}

class ProjectModalManager {
    constructor() {
        this.modal = null;
        this.currentProjectIndex = 0;
        this.init();
    }

    init() {
        this.createModal();
        this.bindEvents();
    }

    createModal() {
        const modalHTML = `
            <div id="project-modal" class="project-modal hidden">
                <div class="modal-backdrop"></div>
                <div class="modal-content">
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="modal-body">
                        <div class="modal-image-container">
                            <img src="" alt="" class="modal-image">
                            <div class="modal-navigation">
                                <button class="modal-nav-btn modal-prev">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <button class="modal-nav-btn modal-next">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                        <div class="modal-info">
                            <div class="modal-category"></div>
                            <h2 class="modal-title"></h2>
                            <p class="modal-description"></p>
                            <div class="modal-meta">
                                <div class="modal-detail">
                                    <span class="modal-label">Location:</span>
                                    <span class="modal-value modal-location"></span>
                                </div>
                                <div class="modal-detail">
                                    <span class="modal-label">Year:</span>
                                    <span class="modal-value modal-year"></span>
                                </div>
                                <div class="modal-detail">
                                    <span class="modal-label">Type:</span>
                                    <span class="modal-value modal-type"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('project-modal');
    }

    bindEvents() {
        // Open modal on project action button click
        const actionButtons = document.querySelectorAll('.project-action-btn');
        actionButtons.forEach((button, index) => {
            if (button.querySelector('.fa-search-plus')) {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.openModal(Math.floor(index / 2)); // Two buttons per project
                });
            }
        });

        // Close modal events
        const closeButton = this.modal.querySelector('.modal-close');
        const backdrop = this.modal.querySelector('.modal-backdrop');
        
        closeButton.addEventListener('click', () => this.closeModal());
        backdrop.addEventListener('click', () => this.closeModal());

        // Navigation events
        const prevButton = this.modal.querySelector('.modal-prev');
        const nextButton = this.modal.querySelector('.modal-next');
        
        prevButton.addEventListener('click', () => this.showPreviousProject());
        nextButton.addEventListener('click', () => this.showNextProject());

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (!this.modal.classList.contains('hidden')) {
                switch (e.key) {
                    case 'Escape':
                        this.closeModal();
                        break;
                    case 'ArrowLeft':
                        this.showPreviousProject();
                        break;
                    case 'ArrowRight':
                        this.showNextProject();
                        break;
                }
            }
        });
    }

    openModal(projectIndex) {
        this.currentProjectIndex = projectIndex;
        this.loadProjectData();
        this.modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Focus trap
        this.modal.focus();
    }

    closeModal() {
        this.modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    showPreviousProject() {
        const visibleProjects = this.getVisibleProjects();
        this.currentProjectIndex = this.currentProjectIndex > 0 ? 
            this.currentProjectIndex - 1 : 
            visibleProjects.length - 1;
        this.loadProjectData();
    }

    showNextProject() {
        const visibleProjects = this.getVisibleProjects();
        this.currentProjectIndex = this.currentProjectIndex < visibleProjects.length - 1 ? 
            this.currentProjectIndex + 1 : 
            0;
        this.loadProjectData();
    }

    getVisibleProjects() {
        return Array.from(document.querySelectorAll('.project-card'))
            .filter(card => card.style.display !== 'none');
    }

    loadProjectData() {
        const visibleProjects = this.getVisibleProjects();
        const project = visibleProjects[this.currentProjectIndex];
        
        if (!project) return;

        // Extract project data
        const image = project.querySelector('.project-image');
        const title = project.querySelector('.project-title');
        const description = project.querySelector('.project-description');
        const category = project.querySelector('.project-category');
        const location = project.querySelector('.project-location');
        const year = project.querySelector('.project-year');

        // Update modal content
        this.modal.querySelector('.modal-image').src = image.src;
        this.modal.querySelector('.modal-image').alt = image.alt;
        this.modal.querySelector('.modal-title').textContent = title.textContent;
        this.modal.querySelector('.modal-description').textContent = description.textContent;
        this.modal.querySelector('.modal-category').textContent = category.textContent;
        this.modal.querySelector('.modal-location').textContent = location.textContent;
        this.modal.querySelector('.modal-year').textContent = year.textContent;
        this.modal.querySelector('.modal-type').textContent = category.textContent;

        // Update navigation buttons
        const visibleProjectsCount = visibleProjects.length;
        this.modal.querySelector('.modal-prev').style.display = visibleProjectsCount > 1 ? 'block' : 'none';
        this.modal.querySelector('.modal-next').style.display = visibleProjectsCount > 1 ? 'block' : 'none';
    }
}

// Masonry Layout Manager
class MasonryManager {
    constructor() {
        this.container = document.querySelector('.projects-grid');
        this.items = document.querySelectorAll('.project-card');
        this.init();
    }

    init() {
        if (!this.container) return;
        
        // Apply masonry layout on larger screens
        if (window.innerWidth > 768) {
            this.applyMasonryLayout();
        }

        // Reapply on window resize
        window.addEventListener('resize', ArchStudio.utils.debounce(() => {
            if (window.innerWidth > 768) {
                this.applyMasonryLayout();
            } else {
                this.removeMasonryLayout();
            }
        }, 250));
    }

    applyMasonryLayout() {
        // Simple masonry effect using CSS Grid
        this.container.style.display = 'grid';
        this.container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(350px, 1fr))';
        this.container.style.gridAutoRows = '10px';
        
        this.items.forEach(item => {
            const height = item.getBoundingClientRect().height;
            const spans = Math.ceil(height / 10);
            item.style.gridRowEnd = `span ${spans}`;
        });
    }

    removeMasonryLayout() {
        this.items.forEach(item => {
            item.style.gridRowEnd = 'auto';
        });
    }
}

// Project Search Manager
class ProjectSearchManager {
    constructor() {
        this.searchInput = document.getElementById('project-search');
        this.projects = document.querySelectorAll('.project-card');
        this.noResultsMessage = null;
        this.init();
    }

    init() {
        if (!this.searchInput) return;
        
        this.createNoResultsMessage();
        this.bindEvents();
    }

    createNoResultsMessage() {
        this.noResultsMessage = document.createElement('div');
        this.noResultsMessage.className = 'no-results-message';
        this.noResultsMessage.innerHTML = `
            <div class="text-center py-16">
                <i class="fas fa-search text-6xl text-gray-400 mb-4"></i>
                <h3 class="text-2xl font-semibold text-gray-600 mb-2">No projects found</h3>
                <p class="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
        `;
        this.noResultsMessage.style.display = 'none';
        
        const container = document.querySelector('.projects-grid').parentNode;
        container.appendChild(this.noResultsMessage);
    }

    bindEvents() {
        this.searchInput.addEventListener('input', ArchStudio.utils.debounce((e) => {
            this.searchProjects(e.target.value);
        }, 300));
    }

    searchProjects(query) {
        const searchTerm = query.toLowerCase().trim();
        let visibleCount = 0;

        this.projects.forEach(project => {
            const title = project.querySelector('.project-title').textContent.toLowerCase();
            const description = project.querySelector('.project-description').textContent.toLowerCase();
            const location = project.querySelector('.project-location').textContent.toLowerCase();
            
            const matches = !searchTerm || 
                title.includes(searchTerm) || 
                description.includes(searchTerm) || 
                location.includes(searchTerm);

            if (matches) {
                project.style.display = 'block';
                visibleCount++;
            } else {
                project.style.display = 'none';
            }
        });

        // Show/hide no results message
        this.noResultsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
        document.querySelector('.projects-grid').style.display = visibleCount === 0 ? 'none' : 'grid';
    }
}

// Project Statistics Counter
class ProjectStatsCounter {
    constructor() {
        this.statsElements = document.querySelectorAll('.stat-number');
        this.hasAnimated = false;
        this.init();
    }

    init() {
        this.observeStats();
    }

    observeStats() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasAnimated) {
                    this.animateStats();
                    this.hasAnimated = true;
                }
            });
        }, { threshold: 0.5 });

        this.statsElements.forEach(stat => observer.observe(stat));
    }

    animateStats() {
        this.statsElements.forEach(stat => {
            const finalValue = parseInt(stat.textContent.replace(/\D/g, ''));
            const suffix = stat.textContent.replace(/[\d]/g, '');
            let currentValue = 0;
            const increment = finalValue / 50;
            const duration = 2000;
            const stepTime = duration / 50;

            const timer = setInterval(() => {
                currentValue += increment;
                if (currentValue >= finalValue) {
                    currentValue = finalValue;
                    clearInterval(timer);
                }
                stat.textContent = Math.floor(currentValue) + suffix;
            }, stepTime);
        });
    }
}

// Initialize project-specific functionality
document.addEventListener('DOMContentLoaded', () => {
    const projectFilterManager = new ProjectFilterManager();
    const projectModalManager = new ProjectModalManager();
    const masonryManager = new MasonryManager();
    const projectSearchManager = new ProjectSearchManager();
    const projectStatsCounter = new ProjectStatsCounter();

    // Set filter from URL on page load
    projectFilterManager.setFilterFromURL();

    // Add custom CSS for modal
    const modalStyles = `
        <style>
        .project-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease-in-out;
        }

        .project-modal:not(.hidden) {
            opacity: 1;
            visibility: visible;
        }

        .modal-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(5px);
        }

        .modal-content {
            position: relative;
            max-width: 90vw;
            max-height: 90vh;
            background: var(--color-background);
            border-radius: var(--radius-lg);
            overflow: hidden;
            box-shadow: var(--shadow-xl);
            transform: scale(0.9);
            transition: transform 0.3s ease-in-out;
        }

        .project-modal:not(.hidden) .modal-content {
            transform: scale(1);
        }

        .modal-close {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            background: rgba(0, 0, 0, 0.5);
            color: white;
            border: none;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 10;
            transition: all 0.3s ease;
        }

        .modal-close:hover {
            background: var(--color-accent);
        }

        .modal-body {
            display: grid;
            grid-template-columns: 1fr 1fr;
            height: 80vh;
        }

        .modal-image-container {
            position: relative;
            overflow: hidden;
        }

        .modal-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .modal-navigation {
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            display: flex;
            justify-content: space-between;
            padding: 0 20px;
            transform: translateY(-50%);
        }

        .modal-nav-btn {
            width: 50px;
            height: 50px;
            background: rgba(0, 0, 0, 0.5);
            color: white;
            border: none;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .modal-nav-btn:hover {
            background: var(--color-accent);
        }

        .modal-info {
            padding: var(--spacing-2xl);
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .modal-category {
            background: var(--color-accent);
            color: white;
            padding: var(--spacing-xs) var(--spacing-md);
            border-radius: var(--radius-base);
            font-size: var(--font-size-sm);
            font-weight: 600;
            text-transform: uppercase;
            width: fit-content;
            margin-bottom: var(--spacing-lg);
        }

        .modal-title {
            font-size: var(--font-size-3xl);
            font-weight: 700;
            margin-bottom: var(--spacing-lg);
            color: var(--color-text);
        }

        .modal-description {
            color: var(--color-text-secondary);
            line-height: 1.6;
            margin-bottom: var(--spacing-xl);
        }

        .modal-meta {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md);
        }

        .modal-detail {
            display: flex;
            justify-content: space-between;
            padding: var(--spacing-sm) 0;
            border-bottom: 1px solid var(--color-border);
        }

        .modal-label {
            font-weight: 600;
            color: var(--color-text);
        }

        .modal-value {
            color: var(--color-text-secondary);
        }

        @media (max-width: 768px) {
            .modal-body {
                grid-template-columns: 1fr;
                height: auto;
                max-height: 90vh;
                overflow-y: auto;
            }

            .modal-image-container {
                height: 300px;
            }

            .modal-info {
                padding: var(--spacing-xl);
            }
        }
        </style>
    `;

    document.head.insertAdjacentHTML('beforeend', modalStyles);
});