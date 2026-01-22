(function ($) {
    "use strict";

    // Wait for DOM to be ready
    $(document).ready(function() {
        console.log('Document ready, initializing search functionality');

        // Initialize navbar state based on current scroll position
        var initialScrollTop = $(window).scrollTop();
        var windowHeight = $(window).height();
        var triggerPoint = Math.max(windowHeight * 0.5, 350);

        if (initialScrollTop > triggerPoint) {
            $('.sticky-top').addClass('navbar-visible').removeClass('navbar-hidden');
        } else {
            $('.sticky-top').addClass('navbar-hidden').removeClass('navbar-visible');
        }

        // Spinner
        var spinner = function () {
            setTimeout(function () {
                if ($('#spinner').length > 0) {
                    $('#spinner').removeClass('show');
                }
            }, 1);
        };
        spinner();
    
    
    // Initiate the wowjs
    new WOW().init();

    // Initialize Header Carousel with custom smooth animation
    $('#header-carousel').carousel({
        interval: 5000, // Auto slide every 5 seconds
        pause: 'hover', // Pause on hover
        wrap: true, // Continuous loop
        keyboard: true // Allow keyboard navigation
    });

    // Custom animation handling for smoother transitions
    $('#header-carousel').on('slide.bs.carousel', function(e) {
        var $carousel = $(this);
        var $activeItem = $carousel.find('.carousel-item.active');
        var direction = e.direction; // 'left' or 'right'

        // Remove any existing animations and classes
        $carousel.find('.carousel-item').removeClass('carousel-item-start carousel-item-end');

        // Clear any lingering transforms
        $carousel.find('.carousel-item').css('transform', '');

        if (direction === 'left') {
            // Moving to next slide
            $activeItem.addClass('carousel-item-start');
        } else {
            // Moving to previous slide
            $activeItem.addClass('carousel-item-end');
        }
    });

    // Clean up after slide transition completes
    $('#header-carousel').on('slid.bs.carousel', function(e) {
        var $carousel = $(this);

        // Remove animation classes and reset all positioning
        setTimeout(function() {
            $carousel.find('.carousel-item').removeClass('carousel-item-start carousel-item-end carousel-item-next carousel-item-prev');
            $carousel.find('.carousel-item').css({
                'transform': '',
                'left': '',
                'top': '',
                'position': '',
                'z-index': ''
            });

            // Ensure only the active item is visible
            $carousel.find('.carousel-item').not('.active').hide();
            $carousel.find('.carousel-item.active').show();
        }, 50);
    });


    // Sticky Navbar - Show after slider with smooth scroll effect
    $(window).scroll(function () {
        var scrollTop = $(this).scrollTop();
        var windowHeight = $(window).height();
        var triggerPoint = Math.max(windowHeight * 0.5, 350); // Show after 50% of viewport height or minimum 350px (after slider)

        if (scrollTop > triggerPoint) {
            $('.sticky-top').addClass('navbar-visible').removeClass('navbar-hidden');
        } else {
            $('.sticky-top').addClass('navbar-hidden').removeClass('navbar-visible');
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Modal Video
    var $videoSrc;
    $('.btn-play').click(function () {
        $videoSrc = $(this).data("src");
    });
    console.log($videoSrc);
    $('#videoModal').on('shown.bs.modal', function (e) {
        $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
    })
    $('#videoModal').on('hide.bs.modal', function (e) {
        $("#video").attr('src', $videoSrc);
    })


    // Product carousel
    $(".product-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        margin: 25,
        loop: true,
        center: true,
        dots: false,
        nav: true,
        navText : [
            '<i class="bi bi-chevron-left"></i>',
            '<i class="bi bi-chevron-right"></i>'
        ],
        responsive: {
			0:{
                items:1
            },
            576:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });

    // Handle right item display for product carousel
    function updateRightDisplay(event) {
        // Reset all items to show logos
        $('.product-carousel .owl-item .logo-display').show();
        $('.product-carousel .owl-item .product-display').hide();

        // Find the rightmost visible item (highest index among active items)
        var rightmostItem = null;
        var highestIndex = -1;

        $('.product-carousel .owl-item.active').each(function() {
            var itemIndex = $(this).index();
            if (itemIndex > highestIndex) {
                highestIndex = itemIndex;
                rightmostItem = $(this);
            }
        });

        // Show product image for rightmost item
        if (rightmostItem) {
            rightmostItem.find('.logo-display').hide();
            rightmostItem.find('.product-display').show();
        }
    }

    // Initialize right display on load
    updateRightDisplay();

    // Update right display when carousel changes
    $(".product-carousel").on('changed.owl.carousel', updateRightDisplay);

    // Product filtering and search functionality
    function filterProducts() {
        var searchTerm = $('#productSearch').val().toLowerCase();
        var selectedCategories = [];

        // Get selected categories
        $('input[type="checkbox"]:checked').each(function() {
            selectedCategories.push($(this).val());
        });

        $('.product-item').each(function() {
            var product = $(this);
            var productName = product.find('h4').text().toLowerCase();
            var productCategory = product.data('category');

            // Check if product matches search term
            var matchesSearch = searchTerm === '' || productName.includes(searchTerm);

            // Check if product matches selected categories
            var matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(productCategory);

            // Show or hide product based on filters
            if (matchesSearch && matchesCategory) {
                product.show();
            } else {
                product.hide();
            }
        });
    }

    // Search input event
    $('#productSearch').on('input', filterProducts);

    // Category checkboxes event
    $('input[type="checkbox"]').on('change', filterProducts);


    // Logo carousel
    $(".logo-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        margin: 30,
        loop: true,
        dots: false,
        nav: false,
        responsive: {
            0:{
                items:2
            },
            576:{
                items:3
            },
            768:{
                items:4
            },
            992:{
                items:6
            },
            1200:{
                items:8
            }
        }
    });

    // Testimonial carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        items: 4,
        loop: true,
        dots: true,
        nav: false,
        margin: 20,
        responsive: {
            0: {
                items: 1
            },
            576: {
                items: 2
            },
            768: {
                items: 3
            },
            992: {
                items: 4
            }
        }
    });

    // Branches carousel
    $(".branches-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        margin: 30,
        loop: true,
        dots: false,
        nav: true,
        navText: [
            '<i class="bi bi-chevron-left"></i>',
            '<i class="bi bi-chevron-right"></i>'
        ],
        responsive: {
            0: {
                items: 2
            },
            576: {
                items: 3
            },
            768: {
                items: 4
            },
            992: {
                items: 6
            },
            1200: {
                items: 8
            }
        }
    });


        // Full Screen Search
        window.openSearch = function() {
            console.log('openSearch function called');
            const overlay = document.getElementById('searchOverlay');
            const input = document.getElementById('searchInput');

            console.log('Overlay element:', overlay);
            console.log('Input element:', input);

            if (overlay) {
                overlay.style.display = 'flex';
                overlay.classList.add('active');
                console.log('Search overlay activated');
                console.log('Overlay classes:', overlay.className);
                console.log('Overlay computed style display:', window.getComputedStyle(overlay).display);
            } else {
                console.error('Search overlay element not found');
            }

            if (input) {
                setTimeout(() => input.focus(), 100);
                console.log('Search input will be focused');
            } else {
                console.error('Search input element not found');
            }

            document.body.style.overflow = 'hidden';
        };

        window.closeSearch = function() {
            const overlay = document.getElementById('searchOverlay');
            if (overlay) {
                overlay.classList.remove('active');
                overlay.style.display = 'none';
            }
            document.body.style.overflow = 'auto';
            const input = document.getElementById('searchInput');
            if (input) {
                input.value = '';
            }
            hideSearchDropdown();
        };

        // Search functionality variables
        var searchTimeout = null;
        var currentSearchTerm = '';

        // Show search dropdown
        function showSearchDropdown() {
            document.getElementById('searchDropdown').classList.add('show');
        }

        // Hide search dropdown
        function hideSearchDropdown() {
            document.getElementById('searchDropdown').classList.remove('show');
        }

        // Perform search API call
        function performSearchAPI(query) {
            if (query.length < 2) {
                hideSearchDropdown();
                return;
            }

            fetch('/api/search/products?q=' + encodeURIComponent(query))
                .then(response => response.json())
                .then(data => {
                    displaySearchResults(data, query);
                })
                .catch(error => {
                    console.error('Search error:', error);
                    hideSearchDropdown();
                });
        }

        // Display search results in dropdown
        function displaySearchResults(results, query) {
            var dropdown = document.getElementById('searchDropdown');

            if (results.length === 0) {
                dropdown.innerHTML = '<div class="search-no-results">No products found for "' + query + '"</div>';
                showSearchDropdown();
                return;
            }

            var html = '';
            results.forEach(function(product) {
                var imageHtml = product.image_path ?
                    '<img src="' + product.image_path + '" alt="' + product.name + '" class="search-result-image">' :
                    '<div class="search-result-image"><i class="fas fa-box"></i></div>';

                html += '<div class="search-result-item" onclick="selectProduct(' + product.id + ')">' +
                    imageHtml +
                    '<div class="search-result-content">' +
                        '<div class="search-result-name">' + highlightText(product.name, query) + '</div>' +
                        (product.brand ? '<div class="search-result-brand">' + product.brand + '</div>' : '') +
                        (product.category ? '<div class="search-result-category">' + product.category + '</div>' : '') +
                    '</div>' +
                    '</div>';
            });

            dropdown.innerHTML = html;
            showSearchDropdown();
        }

        // Highlight search text in results
        function highlightText(text, query) {
            if (!query) return text;
            var regex = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
            return text.replace(regex, '<mark>$1</mark>');
        }

        // Handle product selection
        window.selectProduct = function(productId) {
            // For now, just close the search. You can implement navigation to product page here
            console.log('Selected product:', productId);
            closeSearch();
            // You can add: window.location.href = '/product/' + productId;
        };

        // Search input handler
        function handleSearchInput() {
            var searchInput = document.getElementById('searchInput');
            var query = searchInput.value.trim();

            if (query === currentSearchTerm) {
                return;
            }

            currentSearchTerm = query;

            // Clear previous timeout
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }

            if (query.length === 0) {
                hideSearchDropdown();
                return;
            }

            // Debounce search requests
            searchTimeout = setTimeout(function() {
                performSearchAPI(query);
            }, 300);
        }

        window.performSearch = function() {
            var searchTerm = document.getElementById('searchInput').value.trim();
            if (searchTerm) {
                // Perform full search or redirect to search results page
                console.log('Performing full search for: ' + searchTerm);
                closeSearch();
            }
        };

        // Ensure search button works
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Search button clicked via event listener');
                window.openSearch();
            });
            console.log('Search button event listener attached');
        } else {
            console.error('Search button element not found');
        }

        // Initialize search overlay on page load
        const searchOverlay = document.getElementById('searchOverlay');
        if (searchOverlay) {
            console.log('Search overlay found on page load');
            searchOverlay.style.display = 'none';
            searchOverlay.classList.remove('active');
        } else {
            console.error('Search overlay not found on page load');
        }

        // Search input event listeners
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', handleSearchInput);
        } else {
            console.error('Search input element not found');
        }

        // Close search on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && document.getElementById('searchOverlay').classList.contains('active')) {
                closeSearch();
            }
            // Handle Enter key in search input
            if (e.key === 'Enter' && document.getElementById('searchOverlay').classList.contains('active')) {
                performSearch();
            }
        });

        // Close search when clicking outside
        const overlayElement = document.getElementById('searchOverlay');
        if (overlayElement) {
            overlayElement.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeSearch();
                }
            });
        }

        // Hide dropdown when clicking outside search area
        document.addEventListener('click', function(e) {
            var searchOverlay = document.getElementById('searchOverlay');
            var searchDropdown = document.getElementById('searchDropdown');
            var searchInput = document.getElementById('searchInput');

            if (searchOverlay && searchOverlay.classList.contains('active') &&
                searchInput && !searchInput.contains(e.target) &&
                searchDropdown && !searchDropdown.contains(e.target)) {
                hideSearchDropdown();
            }
        });


    // Parallax effect for carousel video background
    $(window).scroll(function() {
        var scrolled = $(window).scrollTop();
        var carouselOffset = $('#header-carousel').offset().top;
        var carouselHeight = $('#header-carousel').outerHeight();
        var windowHeight = $(window).height();

        // Only apply parallax when carousel is in viewport
        if (scrolled + windowHeight > carouselOffset && scrolled < carouselOffset + carouselHeight) {
            // Calculate parallax offset (slower than scroll speed)
            var parallaxOffset = (scrolled - carouselOffset) * 0.5;
            $('#header-carousel video').css({
                'transform': 'translateY(' + parallaxOffset + 'px)'
            });
        }
    });

    // Parallax effect for video section
    // Background image is now handled by CSS

    $(window).scroll(function() {
        var scrolled = $(window).scrollTop();
        var videoOffset = $('.video').offset().top;
        var videoHeight = $('.video').outerHeight();
        var windowHeight = $(window).height();

        // Only apply parallax when video section is in viewport
        if (scrolled + windowHeight > videoOffset && scrolled < videoOffset + videoHeight) {
            // Calculate parallax offset (slower than scroll speed for depth effect)
            var parallaxOffset = (scrolled - videoOffset) * 0.5;

            // Apply parallax to the background position
            $('.video').css({
                'background-position': 'center ' + parallaxOffset + 'px'
            });
        }
    });

    // Parallax effect for cartoon image
    $(window).scroll(function() {
        var scrolled = $(window).scrollTop();
        var parallaxOffset = $('.parallax-container').offset().top;
        var parallaxHeight = $('.parallax-container').outerHeight();
        var windowHeight = $(window).height();

        // Only apply parallax when parallax section is in viewport
        if (scrolled + windowHeight > parallaxOffset && scrolled < parallaxOffset + parallaxHeight) {
            // Calculate parallax offset (slower than scroll speed for depth effect)
            var translateY = (scrolled - parallaxOffset) * 0.2;

            // Limit the movement to prevent image from going out of view
            // Keep it within reasonable bounds (max 50px up or down)
            translateY = Math.max(-30, Math.min(30, translateY));

            // Apply parallax transform to the image
            $('.parallax-image').css({
                'transform': 'translateY(' + translateY + 'px)'
            });
        }
    });

    // Parallax effect for copyright section (bottom movable)
    $(window).scroll(function() {
        var scrolled = $(window).scrollTop();
        var copyrightOffset = $('.parallax-copyright').offset().top;
        var windowHeight = $(window).height();
        var documentHeight = $(document).height();

        // Only apply parallax when near the bottom of the page
        if (scrolled + windowHeight > copyrightOffset) {
            // Calculate parallax offset (subtle upward movement as user reaches bottom)
            var translateY = (scrolled + windowHeight - copyrightOffset) * 0.1;

            // Limit the movement to keep it subtle
            translateY = Math.max(0, Math.min(20, translateY));

            // Apply parallax transform to the copyright section
            $('.parallax-copyright').css({
                'transform': 'translateY(' + translateY + 'px)'
            });
        }
    });

    // Parallax effect for footer section
    $(window).scroll(function() {
        var scrolled = $(window).scrollTop();
        var footerOffset = $('.parallax-footer').offset().top;
        var footerHeight = $('.parallax-footer').outerHeight();
        var windowHeight = $(window).height();

        // Only apply parallax when footer is in viewport
        if (scrolled + windowHeight > footerOffset && scrolled < footerOffset + footerHeight) {
            // Calculate parallax offset (subtle movement)
            var translateY = (scrolled - footerOffset + windowHeight) * 0.05;

            // Limit the movement to keep it subtle
            translateY = Math.max(-10, Math.min(10, translateY));

            // Apply parallax transform to the footer
            $('.parallax-footer').css({
                'transform': 'translateY(' + translateY + 'px)'
            });
        }
    });

    // Parallax effect for testimonial section background
    $(window).scroll(function() {
        var scrolled = $(window).scrollTop();
        var testimonialOffset = $('.parallax-testimonial').offset().top;
        var testimonialHeight = $('.parallax-testimonial').outerHeight();
        var windowHeight = $(window).height();

        // Only apply parallax when testimonial section is in viewport
        if (scrolled + windowHeight > testimonialOffset && scrolled < testimonialOffset + testimonialHeight) {
            // Calculate parallax offset for background (slower than scroll for depth effect)
            var parallaxOffset = (scrolled - testimonialOffset) * 0.3;

            // Limit the movement to keep it elegant and prevent image from going out of view
            parallaxOffset = Math.max(-100, Math.min(100, parallaxOffset));

            // Apply parallax to background position for smooth motion effect
            $('.parallax-testimonial').css({
                'background-position': 'center ' + parallaxOffset + 'px'
            });
        }
    });

    }); // End of first $(document).ready

    // Cookie Consent Dialog
    $(document).ready(function() {
        console.log('Document ready, jQuery version:', $.fn.jquery);
        // Check if cookies have been accepted
        if (!localStorage.getItem('cookiesAccepted')) {
            // Show cookie consent dialog after a short delay
            setTimeout(function() {
                $('#cookieConsentDialog').addClass('show');
            }, 1000);
        }

        // Handle accept cookies button click
        $('#acceptCookiesBtn').click(function() {
            // Store acceptance in localStorage
            localStorage.setItem('cookiesAccepted', 'true');

            // Hide the dialog
            $('#cookieConsentDialog').removeClass('show');

            // Optional: You can add Google Analytics or other cookie-dependent scripts here
            // Example: gtag('consent', 'update', { 'analytics_storage': 'granted' });
        });

        // Optional: Add a way to reset cookies for testing (you can remove this in production)
        // Uncomment the following lines if you want a reset button
        /*
        $(document).on('keydown', function(e) {
            if (e.ctrlKey && e.key === 'r' && e.shiftKey) {
                localStorage.removeItem('cookiesAccepted');
                location.reload();
            }
        });
        */

        // Career Page Functionality
        if ($('.career-page').length > 0 || window.location.pathname.includes('career')) {
            console.log('Career page detected, initializing career functionality');
            initializeCareerPage();
        }

    }); // End of $(document).ready

    // Career Page Data and Functions
    const jobData = [
        {
            id: 'sales-manager',
            title: 'Sales Manager',
            department: 'sales',
            type: 'full-time',
            experience: 'senior',
            location: 'Doha',
            salary: 'Competitive',
            posted: '2 days ago',
            skills: 'Leadership, B2B Sales, Negotiation',
            description: 'Lead our sales team in developing and maintaining strong relationships with key wholesale clients across Qatar\'s food retail sector.'
        },
        {
            id: 'logistics-coordinator',
            title: 'Logistics Coordinator',
            department: 'logistics',
            type: 'full-time',
            experience: 'mid',
            location: 'Industrial Area',
            salary: 'Competitive',
            posted: '1 week ago',
            skills: 'Supply Chain, Warehouse Mgmt, ERP',
            description: 'Oversee warehouse operations and distribution logistics to ensure timely delivery of wholesale food products to our clients.'
        },
        {
            id: 'quality-specialist',
            title: 'Quality Control Specialist',
            department: 'quality',
            type: 'full-time',
            experience: 'mid',
            location: 'Doha',
            salary: 'Competitive',
            posted: '3 days ago',
            skills: 'Quality Assurance, HACCP, Testing',
            description: 'Ensure product quality standards are maintained throughout our supply chain, from procurement to delivery.'
        },
        {
            id: 'procurement-officer',
            title: 'Procurement Officer',
            department: 'procurement',
            type: 'full-time',
            experience: 'mid',
            location: 'Doha',
            salary: 'Competitive',
            posted: '1 week ago',
            skills: 'Negotiation, Supplier Relations, Cost Analysis',
            description: 'Manage procurement activities, negotiate with suppliers, and ensure cost-effective sourcing of quality food products.'
        },
        {
            id: 'marketing-coordinator',
            title: 'Marketing Coordinator',
            department: 'sales',
            type: 'full-time',
            experience: 'entry',
            location: 'Doha',
            salary: 'Competitive',
            posted: '2 weeks ago',
            skills: 'Digital Marketing, Social Media, Content Creation',
            description: 'Support marketing initiatives, manage social media presence, and coordinate promotional activities for our wholesale brand.'
        },
        {
            id: 'warehouse-supervisor',
            title: 'Warehouse Supervisor',
            department: 'logistics',
            type: 'full-time',
            experience: 'mid',
            location: 'Industrial Area',
            salary: 'Competitive',
            posted: '5 days ago',
            skills: 'Warehouse Mgmt, Inventory Control, Team Leadership',
            description: 'Supervise warehouse operations, manage inventory, and ensure efficient storage and distribution of food products.'
        }
    ];

    function initializeCareerPage() {
        setupJobFilters();
        setupJobSearch();
        setupJobApplicationModal();
        updateResultsCounter();
    }

    function setupJobFilters() {
        $('#departmentFilter, #typeFilter, #experienceFilter').on('change', function() {
            filterJobs();
        });

        $('#clearFilters').on('click', function() {
            $('#departmentFilter').val('');
            $('#typeFilter').val('');
            $('#experienceFilter').val('');
            $('#jobSearch').val('');
            filterJobs();
        });

        $('#clearAllFilters').on('click', function() {
            $('#clearFilters').click();
        });
    }

    function setupJobSearch() {
        let searchTimeout;
        $('#jobSearch').on('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(function() {
                filterJobs();
            }, 300);
        });
    }

    function filterJobs() {
        const searchTerm = $('#jobSearch').val().toLowerCase();
        const departmentFilter = $('#departmentFilter').val();
        const typeFilter = $('#typeFilter').val();
        const experienceFilter = $('#experienceFilter').val();

        let visibleCount = 0;

        $('.job-card').each(function() {
            const $card = $(this);
            const title = $card.data('title').toLowerCase();
            const department = $card.data('department');
            const type = $card.data('type');
            const experience = $card.data('experience');

            const matchesSearch = searchTerm === '' ||
                title.includes(searchTerm) ||
                $card.find('.job-skills').text().toLowerCase().includes(searchTerm) ||
                $card.find('.text-muted').first().text().toLowerCase().includes(searchTerm);

            const matchesDepartment = departmentFilter === '' || department === departmentFilter;
            const matchesType = typeFilter === '' || type === typeFilter;
            const matchesExperience = experienceFilter === '' || experience === experienceFilter;

            if (matchesSearch && matchesDepartment && matchesType && matchesExperience) {
                $card.removeClass('d-none').addClass('wow fadeInUp');
                visibleCount++;
            } else {
                $card.addClass('d-none').removeClass('wow fadeInUp');
            }
        });

        if (visibleCount === 0) {
            $('#noResults').removeClass('d-none');
            $('#jobCardsContainer').addClass('d-none');
        } else {
            $('#noResults').addClass('d-none');
            $('#jobCardsContainer').removeClass('d-none');
        }

        updateResultsCounter(visibleCount);
    }

    function updateResultsCounter(visibleCount) {
        const totalCount = $('.job-card').length;
        const showingCount = visibleCount !== undefined ? visibleCount : $('.job-card:not(.d-none)').length;
        $('#showingCount').text(showingCount);
        $('#totalCount').text(totalCount);
    }

    function setupJobApplicationModal() {
        $(document).on('click', '.apply-btn', function() {
            const jobId = $(this).data('job-id');
            const jobTitle = $(this).data('job-title');
            openJobApplicationModal(jobId, jobTitle);
        });

        $('#submitApplication').off('click').on('click', function() {
            submitJobApplication();
        });

        $('#resume, #portfolio').on('change', function() {
            validateFileSize(this);
        });
    }

    function openJobApplicationModal(jobId, jobTitle) {
        const job = jobData.find(j => j.id === jobId);
        if (job) {
            $('#modalJobTitle').text(jobTitle);
            $('#jobTitle').val(job.title);
            $('#summaryJobTitle').text(job.title);
            $('#summaryDepartment').text(getDepartmentName(job.department));
            $('#summaryJobType').text(getJobTypeName(job.type));
            $('#summaryLocation').text(job.location);
            $('#summarySalary').text(job.salary);
            $('#successJobTitle').text(job.title);

            $('#jobApplicationForm')[0].reset();
            $('#jobTitle').val(job.title);
            $('#termsCheck').prop('checked', false);
            $('#jobApplicationModal').modal('show');
        }
    }

    function getDepartmentName(dept) {
        const departments = {
            'sales': 'Sales & Marketing',
            'logistics': 'Logistics & Operations',
            'quality': 'Quality Control',
            'procurement': 'Procurement',
            'finance': 'Finance & Admin'
        };
        return departments[dept] || dept;
    }

    function getJobTypeName(type) {
        const types = {
            'full-time': 'Full-time',
            'part-time': 'Part-time',
            'contract': 'Contract',
            'internship': 'Internship'
        };
        return types[type] || type;
    }

    function validateFileSize(input) {
        const file = input.files[0];
        if (file) {
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                alert('File size exceeds 5MB limit.');
                input.value = '';
                return false;
            }
        }
        return true;
    }

    function submitJobApplication() {
        console.log('=== SUBMIT JOB APPLICATION CALLED ===');
        const form = $('#jobApplicationForm')[0];
        
        if (!form.checkValidity()) {
            console.warn('Form validation failed');
            form.reportValidity();
            return;
        }

        if (!$('#termsCheck').is(':checked')) {
            console.warn('Terms not accepted');
            alert('Please accept the terms and conditions.');
            return;
        }

        const resumeInput = document.getElementById('resume');
        if (!resumeInput.files[0]) {
            console.warn('No resume file selected');
            alert('Please upload your resume.');
            return;
        }

        const submitBtn = $('#submitApplication');
        const originalText = submitBtn.html();
        submitBtn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2"></span>Submitting...');

        const formData = new FormData(form);
        console.log('Form data prepared, sending AJAX request...');
        console.log('Job Title:', formData.get('jobTitle'));
        console.log('Email:', formData.get('email'));
        console.log('Resume file:', resumeInput.files[0].name);

        $.ajax({
            url: '/api/career/apply',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            timeout: 60000, // 60 second timeout
            success: function(response) {
                console.log('AJAX Success Response:', response);
                submitBtn.prop('disabled', false).html(originalText);
                
                if (response.status === 'success') {
                    // Only show success if emails were sent successfully
                    $('#jobApplicationModal').modal('hide');
                    $('#successModal').modal('show');
                    
                    // Reset form
                    form.reset();
                } else {
                    // Show error message
                    alert('Error: ' + (response.message || 'Unknown error occurred'));
                }
            },
            error: function(xhr, status, error) {
                console.error('AJAX Error:', status, error);
                console.error('XHR Status:', xhr.status);
                console.error('XHR Response:', xhr.responseText);
                
                submitBtn.prop('disabled', false).html(originalText);
                
                let msg = 'Submission failed. Please try again.';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    msg = xhr.responseJSON.message;
                } else if (xhr.responseText) {
                    try {
                        const errorData = JSON.parse(xhr.responseText);
                        msg = errorData.message || msg;
                    } catch(e) {
                        msg = xhr.responseText.substring(0, 200);
                    }
                }
                
                alert('Error: ' + msg);
            }
        });
    }

})(jQuery);

