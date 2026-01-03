(function ($) {
    "use strict";

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


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.sticky-top').addClass('shadow-sm').css('top', '0px');
        } else {
            $('.sticky-top').removeClass('shadow-sm').css('top', '-150px');
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
        document.getElementById('searchOverlay').classList.add('active');
        document.getElementById('searchInput').focus();
        document.body.style.overflow = 'hidden';
    };

    window.closeSearch = function() {
        document.getElementById('searchOverlay').classList.remove('active');
        document.body.style.overflow = 'auto';
        document.getElementById('searchInput').value = '';
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

    // Search input event listeners
    document.getElementById('searchInput').addEventListener('input', handleSearchInput);

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
    document.getElementById('searchOverlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeSearch();
        }
    });

    // Hide dropdown when clicking outside search area
    document.addEventListener('click', function(e) {
        var searchOverlay = document.getElementById('searchOverlay');
        var searchDropdown = document.getElementById('searchDropdown');
        var searchInput = document.getElementById('searchInput');

        if (searchOverlay.classList.contains('active') &&
            !searchInput.contains(e.target) &&
            !searchDropdown.contains(e.target)) {
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

    });

})(jQuery);

