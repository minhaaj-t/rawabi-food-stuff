document.addEventListener('DOMContentLoaded', () => {
  const heroContent = document.querySelector('.glass-card');
  const videoPreview = document.querySelector('.video-preview');
  const brands = document.querySelectorAll('.brand-name');
  const navbar = document.querySelector('.navbar');

  // Navbar scroll effect
  if (navbar) {
    let lastScroll = 0;
    const handleNavbarScroll = () => {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > 100) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      
      lastScroll = currentScroll;
    };

    window.addEventListener('scroll', handleNavbarScroll);
    handleNavbarScroll(); // Initial check
  }

  // Hamburger Menu Toggle
  const hamburgerMenu = document.querySelector('.hamburger-menu');
  const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
  const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');
  const body = document.body;

  if (hamburgerMenu && mobileMenuOverlay) {
    const mobileMenuClose = document.querySelector('.mobile-menu-close');

    hamburgerMenu.addEventListener('click', () => {
      hamburgerMenu.classList.toggle('active');
      mobileMenuOverlay.classList.toggle('active');
      body.classList.toggle('menu-open');
    });

    if (mobileMenuClose) {
      mobileMenuClose.addEventListener('click', () => {
        hamburgerMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        body.classList.remove('menu-open');
      });
    }

    // Close menu when clicking on overlay (outside menu content)
    mobileMenuOverlay.addEventListener('click', (e) => {
      if (e.target === mobileMenuOverlay) {
        hamburgerMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        body.classList.remove('menu-open');
      }
    });

    // Close menu when clicking on menu links
    mobileMenuLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburgerMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        body.classList.remove('menu-open');
      });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenuOverlay.classList.contains('active')) {
        hamburgerMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        body.classList.remove('menu-open');
      }
    });
  }

  // Entrance Animations with modern easing
  if (heroContent) {
    heroContent.style.opacity = '0';
    heroContent.style.transform = 'translateY(30px)';

    setTimeout(() => {
      heroContent.style.transition = 'all 1s cubic-bezier(0.2, 0.8, 0.2, 1)';
      heroContent.style.opacity = '1';
      heroContent.style.transform = 'translateY(0)';
    }, 300);
  }

  if (videoPreview) {
    videoPreview.style.opacity = '0';
    videoPreview.style.transform = 'translateY(50px)';

    setTimeout(() => {
      videoPreview.style.transition = 'all 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)';
      videoPreview.style.opacity = '1';
      videoPreview.style.transform = 'translateY(0)';
    }, 700);
  }

  // Brand stagger fade in
  brands.forEach((brand, index) => {
    brand.style.opacity = '0';
    brand.style.transition = 'opacity 0.8s ease';
    setTimeout(() => {
      brand.style.opacity = '0.5';
    }, 1200 + (index * 150));
  });

  // Smooth hover for glass card
  const glassCard = document.querySelector('.glass-card');
  if (glassCard) {
    glassCard.addEventListener('mousemove', (e) => {
      const rect = glassCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      glassCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    glassCard.addEventListener('mouseleave', () => {
      glassCard.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
    });
  }

  // Micro-interaction: Play button pulse
  const playBtn = document.querySelector('.play-button');
  if (playBtn) {
    playBtn.addEventListener('mouseenter', () => {
      playBtn.animate([
        { transform: 'translate(-50%, -50%) scale(1)' },
        { transform: 'translate(-50%, -50%) scale(1.1)' }
      ], {
        duration: 300,
        fill: 'forwards'
      });
    });

    playBtn.addEventListener('mouseleave', () => {
      playBtn.animate([
        { transform: 'translate(-50%, -50%) scale(1.1)' },
        { transform: 'translate(-50%, -50%) scale(1)' }
      ], {
        duration: 300,
        fill: 'forwards'
      });
    });
  }

  // Scroll Progress Indicator
  const scrollProgress = document.querySelector('.scroll-progress');
  if (scrollProgress) {
    const updateScrollProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
      scrollProgress.style.width = `${Math.min(scrollPercent, 100)}%`;
    };

    window.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress(); // Initial call
  }

  // Scroll Indicator - Hide when scrolling
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    let scrollTimeout;
    
    const hideScrollIndicator = () => {
      scrollIndicator.classList.add('hidden');
    };

    const showScrollIndicator = () => {
      scrollIndicator.classList.remove('hidden');
    };

    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      hideScrollIndicator();
      
      scrollTimeout = setTimeout(() => {
        if (window.pageYOffset < window.innerHeight * 0.5) {
          showScrollIndicator();
        }
      }, 2000);
    });

    // Click to scroll down
    scrollIndicator.addEventListener('click', () => {
      const heroSection = document.querySelector('.hero');
      if (heroSection) {
        const heroHeight = heroSection.offsetHeight;
        window.scrollTo({
          top: heroHeight,
          behavior: 'smooth'
        });
      }
    });
  }

  // Intersection Observer for Scroll-Triggered Animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Optional: Unobserve after animation to improve performance
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all elements with scroll animation classes
  const animatedElements = document.querySelectorAll(
    '.scroll-fade-in, .scroll-slide-left, .scroll-slide-right, .scroll-scale-in, .banner-slide-in'
  );
  animatedElements.forEach(el => observer.observe(el));

  // Enhanced Parallax scroll for hero section
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    let ticking = false;

    const updateParallax = () => {
      const scrollPosition = window.pageYOffset;
      const heroHeight = heroSection.offsetHeight;
      const scrollPercent = scrollPosition / heroHeight;

      // Parallax background
      heroSection.style.backgroundPositionY = `${-scrollPosition * 0.3}px`;

      // Fade out hero content as user scrolls
      if (scrollPosition < heroHeight) {
        const opacity = 1 - (scrollPosition / heroHeight) * 0.5;
        const translateY = scrollPosition * 0.2;
        heroContent.style.opacity = Math.max(opacity, 0.5);
        heroContent.style.transform = `translateY(${translateY}px)`;

        if (videoPreview) {
          videoPreview.style.opacity = Math.max(opacity, 0.5);
          videoPreview.style.transform = `translateY(${translateY * 0.8}px)`;
        }
      }

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    });
  }

  // Parallel Video Section Parallax Effect
  const parallelVideoSection = document.querySelector('.parallel-video-section');
  if (parallelVideoSection) {
    let videoTicking = false;

    const updateVideoParallax = () => {
      const scrollPosition = window.pageYOffset;
      const sectionTop = parallelVideoSection.offsetTop;
      const sectionHeight = parallelVideoSection.offsetHeight;
      const windowHeight = window.innerHeight;

      // Calculate parallax offset when section is in viewport
      if (scrollPosition + windowHeight > sectionTop && scrollPosition < sectionTop + sectionHeight) {
        const parallaxOffset = (scrollPosition - sectionTop) * 0.5;
        const videoWrapper = parallelVideoSection.querySelector('.video-background-wrapper');

        if (videoWrapper) {
          videoWrapper.style.transform = `translateY(${parallaxOffset}px)`;
        }
      }

      videoTicking = false;
    };

    window.addEventListener('scroll', () => {
      if (!videoTicking) {
        window.requestAnimationFrame(updateVideoParallax);
        videoTicking = true;
      }
    });
  }

  // About Section Images - Parallel Movement Effect
  const aboutSection = document.querySelector('.about-section');
  if (aboutSection) {
    let aboutTicking = false;

    const updateAboutParallax = () => {
      const scrollPosition = window.pageYOffset;
      const sectionTop = aboutSection.offsetTop;
      const sectionHeight = aboutSection.offsetHeight;
      const windowHeight = window.innerHeight;

      // Calculate parallax offset when section is in viewport
      if (scrollPosition + windowHeight > sectionTop && scrollPosition < sectionTop + sectionHeight) {
        const progress = (scrollPosition - sectionTop) / (sectionHeight + windowHeight);
        const parallaxOffset1 = progress * -80; // Slower movement for main image
        const parallaxOffset2 = progress * 60;  // Opposite direction for secondary image

        const image1 = aboutSection.querySelector('.image-1 img');
        const image2 = aboutSection.querySelector('.image-2 img');

        if (image1) {
          image1.style.transform = `scaleX(-1) translateY(${parallaxOffset1}px)`;
        }
        if (image2) {
          image2.style.transform = `translateY(${parallaxOffset2}px)`;
        }
      }

      aboutTicking = false;
    };

    window.addEventListener('scroll', () => {
      if (!aboutTicking) {
        window.requestAnimationFrame(updateAboutParallax);
        aboutTicking = true;
      }
    });

    // Initial call to set positions
    updateAboutParallax();
  }

  // Brands Carousel Panel - 3D Carousel Effect
  const brandsCarouselPanel = document.getElementById('brands-carousel-panel');
  if (brandsCarouselPanel) {
    const carouselContainer = brandsCarouselPanel.querySelector('.brands-carousel-container');
    const brandCards = brandsCarouselPanel.querySelectorAll('.brand-card');
    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let currentIndex = 3; // Start at center card (index 3) to show 3 logos on each side
    const totalCards = 7;

    // Array of all available logo URLs (at least 15 for 3 categories)
    const allLogos = [
      '/assets/images/logos/Royal-taj.png',
      '/assets/images/logos/Al-siha.png',
      '/assets/images/logos/Abumnarah.png',
      '/assets/images/logos/Amerikan-Speciality.png',
      '/assets/images/logos/Belkis.png',
      '/assets/images/logos/Prima-1.png',
      '/assets/images/logos/RAWABI-FRESH.png',
      '/assets/images/logos/Rawabi-Gold.png',
      '/assets/images/logos/Green-garden.png',
      '/assets/images/logos/JUMBO.png',
      '/assets/images/logos/kerala-kitchen.png',
      '/assets/images/logos/MAI-QATAR.png',
      '/assets/images/logos/Metro.png',
      '/assets/images/logos/MilkMagic.png',
      '/assets/images/logos/MOONI.png',
      '/assets/images/logos/Mr.-Extra.png',
      '/assets/images/logos/Parrot.png',
      '/assets/images/logos/single-Spoon.png',
      '/assets/images/logos/SONA-MASOORI-RICE.png',
      '/assets/images/logos/Super-excel.png',
      '/assets/images/logos/Winn.png',
      '/assets/images/logos/Royal-taj.png', // Repeat for more options
      '/assets/images/logos/Al-siha.png',
      '/assets/images/logos/Abumnarah.png',
      '/assets/images/logos/Amerikan-Speciality.png',
      '/assets/images/logos/Belkis.png',
      '/assets/images/logos/Prima-1.png',
      '/assets/images/logos/RAWABI-FRESH.png',
      '/assets/images/logos/Rawabi-Gold.png',
      '/assets/images/logos/Green-garden.png',
      '/assets/images/logos/JUMBO.png',
      '/assets/images/logos/kerala-kitchen.png',
      '/assets/images/logos/MAI-QATAR.png',
      '/assets/images/logos/Metro.png',
      '/assets/images/logos/MilkMagic.png',
      '/assets/images/logos/MOONI.png',
      '/assets/images/logos/Mr.-Extra.png',
      '/assets/images/logos/Parrot.png',
      '/assets/images/logos/single-Spoon.png',
      '/assets/images/logos/SONA-MASOORI-RICE.png',
      '/assets/images/logos/Super-excel.png',
      '/assets/images/logos/Winn.png',
    ];

    let currentLogoSet = 0; // Track which set of 5 logos to show

    // Store original logo URLs and product image mapping
    const logoToProductMapping = {
      '/assets/images/logos/Royal-taj.png': '/assets/images/products/p1.png',
      '/assets/images/logos/Al-siha.png': '/assets/images/products/p2.png',
      '/assets/images/logos/Abumnarah.png': '/assets/images/products/p3.png',
      '/assets/images/logos/Amerikan-Speciality.png': '/assets/images/products/p4.png',
      '/assets/images/logos/Belkis.png': '/assets/images/products/p5.png',
      '/assets/images/logos/Prima-1.png': '/assets/images/products/p6.png',
      '/assets/images/logos/RAWABI-FRESH.png': '/assets/images/products/p7.png'
    };

    // Default product image for logos without specific mapping
    const defaultProductImageUrl = '/assets/images/products/product1.png';

    brandCards.forEach((card) => {
      const img = card.querySelector('.brand-card-image');
      if (img && !img.dataset.originalSrc) {
        img.dataset.originalSrc = img.src; // Store original logo URL
      }
    });


    // Initialize carousel positions
    function updateCarouselPositions() {
      brandCards.forEach((card, index) => {
        const offset = index - currentIndex;
        const absOffset = Math.abs(offset);
        const img = card.querySelector('.brand-card-image');
        
        // Change image based on position
        if (img) {
          const actualLogoIndex = (currentIndex + offset + allLogos.length) % allLogos.length;
          const logoSource = allLogos[actualLogoIndex];

          if (offset === 0) {
            // Center card - show product image and add center-card class
            card.classList.add('center-card');
            // Use mapped product image or default based on the logo
            const mappedProductImage = logoToProductMapping[logoSource] || defaultProductImageUrl;
            if (img.src !== mappedProductImage) {
              img.src = mappedProductImage;
              img.alt = 'Product Image';
            }
          } else {
            // Side cards - remove center-card class and show original logo
            card.classList.remove('center-card');
            if (img.src !== logoSource) {
              img.src = logoSource;
              img.alt = 'Brand Logo';
            }
          }
        }
        
        // Calculate position and scale based on offset
        let left = 50; // Start at center (50%)
        let scale = 1;
        let zIndex = 10;
        let opacity = 1;
        let width = 321;
        let height = 321;

        const baseWidth = 400; // Max width for the center card (increased)
        const baseHeight = 400; // Max height for the center card (increased)
        
        // Pixel offsets from center for proper spacing - wider for desktop
        const innerOffset1 = 300; // Distance for first side logos
        const innerOffset2 = 500; // Distance for second side logos
        const innerOffset3 = 650; // Distance for third side logos

        if (offset === 0) {
          // Center card
          scale = 1;
          zIndex = 10;
          opacity = 1;
          width = baseWidth;
          height = baseHeight;
          left = '50%';
        } else if (absOffset === 1) {
          // First side cards (index 2 and 4 when center is 3)
          scale = 0.75;
          zIndex = 9;
          opacity = 0.7;
          width = baseWidth * 0.75;
          height = baseHeight * 0.75;
          left = offset > 0 ? `calc(50% + ${innerOffset1}px)` : `calc(50% - ${innerOffset1}px)`;
        } else if (absOffset === 2) {
          // Second side cards (index 1 and 5 when center is 3)
          scale = 0.55;
          zIndex = 8;
          opacity = 0.5;
          width = baseWidth * 0.55;
          height = baseHeight * 0.55;
          left = offset > 0 ? `calc(50% + ${innerOffset2}px)` : `calc(50% - ${innerOffset2}px)`;
        } else if (absOffset === 3) {
          // Third side cards (index 0 and 6 when center is 3)
          scale = 0.4;
          zIndex = 7;
          opacity = 0.3;
          width = baseWidth * 0.4;
          height = baseHeight * 0.4;
          left = offset > 0 ? `calc(50% + ${innerOffset3}px)` : `calc(50% - ${innerOffset3}px)`;
        } else {
          // Farthest cards (barely visible or off-screen)
          scale = 0.2;
          zIndex = 6;
          opacity = 0.1;
          width = baseWidth * 0.2;
          height = baseHeight * 0.2;
          left = offset > 0 ? `calc(50% + ${innerOffset3 + 150}px)` : `calc(50% - ${innerOffset3 + 150}px)`;
        }

        card.style.left = left;
        card.style.width = `${width}px`;
        card.style.height = `${height}px`;
        card.style.transform = `translate(-50%, -50%) scale(${scale})`;
        card.style.zIndex = zIndex;
        card.style.opacity = opacity;
      });
    }

    // Mouse events
    carouselContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      carouselContainer.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      currentX = e.clientX - startX;

      // Calculate rotation based on drag distance
      const dragThreshold = 100;
      if (Math.abs(currentX) > dragThreshold) {
        if (currentX > 0) {
          // Swipe right - previous card (infinite scroll)
          currentIndex = currentIndex > 0 ? currentIndex - 1 : totalCards - 1;
          startX = e.clientX;
          updateCarouselPositions();
        } else if (currentX < 0) {
          // Swipe left - next card (infinite scroll)
          currentIndex = currentIndex < totalCards - 1 ? currentIndex + 1 : 0;
          startX = e.clientX;
          updateCarouselPositions();
        }
      }
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        carouselContainer.style.cursor = 'grab';
        currentX = 0;
      }
    });

    // Touch events for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    carouselContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    });

    carouselContainer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].clientX;
      handleSwipe();
    });

    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swipe left - next card (infinite scroll)
          currentIndex = currentIndex < totalCards - 1 ? currentIndex + 1 : 0;
        } else if (diff < 0) {
          // Swipe right - previous card (infinite scroll)
          currentIndex = currentIndex > 0 ? currentIndex - 1 : totalCards - 1;
        }
        updateCarouselPositions();
      }
    }


    // Navigation button handlers
    const prevBtn = brandsCarouselPanel.querySelector('.carousel-prev-btn');
    const nextBtn = brandsCarouselPanel.querySelector('.carousel-next-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Infinite scroll: wrap around to end if at beginning
        currentIndex = currentIndex > 0 ? currentIndex - 1 : totalCards - 1;
        updateCarouselPositions();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Infinite scroll: wrap around to beginning if at end
        currentIndex = currentIndex < totalCards - 1 ? currentIndex + 1 : 0;
        updateCarouselPositions();
      });
    }

    // Initialize carousel
    updateCarouselPositions();

    // Category button handlers
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        // Remove active class from all buttons
        categoryButtons.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        
        // Show next 5 logos based on category
        currentLogoSet = index * 5; // Featured = 0, Food = 5, Drinks = 10
        // The actual logo assignment is now handled directly by updateCarouselPositions
        // Allow a brief moment for logos to update before re-calculating positions
        setTimeout(() => {
          updateCarouselPositions();
        }, 50); // Small delay for smooth transition
      });
    });

    // Auto-rotate carousel (optional)
    // setInterval(() => {
    //   currentIndex = (currentIndex + 1) % totalCards;
    //   updateCarouselPositions();
    // }, 5000);

    // Explore Brands Button - Navigate to Products Page
    const exploreBrandsBtn = document.querySelector('.explore-brands-btn');
    if (exploreBrandsBtn) {
      exploreBrandsBtn.addEventListener('click', () => {
        window.location.href = '/products.html';
      });
    }
  }

  // Customer Impressions - Instagram Reels Style Video Cards
  const impressionCards = document.querySelectorAll('.impression-card');
  
  impressionCards.forEach(card => {
    const video = card.querySelector('.reel-video');
    const poster = card.querySelector('.reel-poster');
    const playBtn = card.querySelector('.reel-play-btn');
    let isPlaying = false;
    let hoverTimeout;

    if (!video || !playBtn) return;
    const wrapper = card.querySelector('.reel-media-wrapper');

    // Ensure video starts paused and poster is visible
    video.pause();
    video.currentTime = 0;
    if (wrapper) wrapper.classList.remove('playing');
    video.classList.remove('playing');
    playBtn.classList.remove('hidden');

    // Helper: capture current video frame and set as poster image (data URL)
    function captureFrameToPoster() {
      if (!video || !poster) return;
      try {
        const w = video.videoWidth || video.clientWidth || poster.clientWidth;
        const h = video.videoHeight || video.clientHeight || poster.clientHeight;
        if (!w || !h) return;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Use jpeg for smaller size (quality 0.8)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        poster.src = dataUrl;
      } catch (err) {
        // If capture fails (cross-origin or other), keep existing poster
        // Fail silently to avoid changing UX
        // console.warn('Frame capture failed', err);
      }
    }

    // Hover to auto-play video
    card.addEventListener('mouseenter', () => {
      hoverTimeout = setTimeout(() => {
        if (!isPlaying) {
          video.play().catch(err => console.log('Video play failed:', err));
          video.classList.add('playing');
          if (wrapper) wrapper.classList.add('playing');
          playBtn.classList.add('hidden');
          isPlaying = true;
        }
      }, 300); // Small delay before auto-play
    });

    card.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimeout);
      if (isPlaying) {
        video.pause();
        video.currentTime = 0;
        video.classList.remove('playing');
        if (wrapper) wrapper.classList.remove('playing');
        playBtn.classList.remove('hidden');
        isPlaying = false;
      }
    });

    // Click play button or card to play fullscreen
    const playFullscreen = () => {
      // Set video to maintain aspect ratio in fullscreen
      video.style.objectFit = 'contain';
      
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      } else if (video.mozRequestFullScreen) {
        video.mozRequestFullScreen();
      } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
      }
      
      video.play().then(() => {
        video.classList.add('playing');
        if (wrapper) wrapper.classList.add('playing');
        playBtn.classList.add('hidden');
        isPlaying = true;
      }).catch(err => console.log('Video play failed:', err));
    };

    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playFullscreen();
    });

    card.addEventListener('click', (e) => {
      if (e.target !== playBtn && !playBtn.contains(e.target)) {
        playFullscreen();
      }
    });

    // When video plays/pauses update wrapper class and poster
    video.addEventListener('play', () => {
      if (wrapper) wrapper.classList.add('playing');
      playBtn.classList.add('hidden');
      video.classList.add('playing');
      isPlaying = true;
    });

    video.addEventListener('pause', () => {
      // capture a thumbnail at paused time and set poster
      captureFrameToPoster();
      if (wrapper) wrapper.classList.remove('playing');
      playBtn.classList.remove('hidden');
      video.classList.remove('playing');
      isPlaying = false;
    });

    // Try to set initial poster from first frame once metadata/data is loaded
    video.addEventListener('loadeddata', () => {
      // Pause to ensure the frame is available and then capture
      try {
        const wasPlaying = !video.paused && !video.ended;
        if (wasPlaying) {
          // temporarily pause to capture a clean frame
          video.pause();
          captureFrameToPoster();
          if (!wasPlaying) video.play();
        } else {
          captureFrameToPoster();
        }
      } catch (e) {
        // ignore
      }
    });

    // Handle fullscreen changes
    const handleFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement || 
                          document.webkitFullscreenElement || 
                          document.mozFullScreenElement || 
                          document.msFullscreenElement;
      
      if (!isFullscreen && isPlaying) {
        video.pause();
        video.currentTime = 0;
        video.classList.remove('playing');
        video.style.objectFit = 'cover'; // Reset to cover for card view
        playBtn.classList.remove('hidden');
        isPlaying = false;
      } else if (isFullscreen) {
        video.style.objectFit = 'contain'; // Ensure contain for fullscreen
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
  });

  // What's New Section - Tab Switching
  const newsTabButtons = document.querySelectorAll('.news-tab-btn');
  const newsTabContents = document.querySelectorAll('.news-tab-content');

  if (newsTabButtons.length > 0 && newsTabContents.length > 0) {
    newsTabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        
        // Remove active class from all buttons and contents
        newsTabButtons.forEach(btn => btn.classList.remove('active'));
        newsTabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Show corresponding content
        const targetContent = document.getElementById(`${targetTab}-content`);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });
  }

  // News Grid Scroll Buttons
  const newsGrids = document.querySelectorAll('.news-grid');
  
  newsGrids.forEach(grid => {
    const wrapper = grid.closest('.news-grid-wrapper');
    if (!wrapper) return;
    
    const leftBtn = wrapper.querySelector('.news-scroll-left');
    const rightBtn = wrapper.querySelector('.news-scroll-right');
    
    const updateButtonStates = () => {
      const scrollLeft = grid.scrollLeft;
      const scrollWidth = grid.scrollWidth;
      const clientWidth = grid.clientWidth;
      const maxScroll = scrollWidth - clientWidth;
      
      if (leftBtn) {
        leftBtn.disabled = scrollLeft <= 0;
      }
      if (rightBtn) {
        rightBtn.disabled = scrollLeft >= maxScroll - 1;
      }
    };
    
    // Scroll functions
    const scrollLeft = () => {
      const cardWidth = grid.querySelector('.news-item')?.offsetWidth || 400;
      const gap = 32; // 2rem gap
      grid.scrollBy({
        left: -(cardWidth + gap),
        behavior: 'smooth'
      });
    };
    
    const scrollRight = () => {
      const cardWidth = grid.querySelector('.news-item')?.offsetWidth || 400;
      const gap = 32; // 2rem gap
      grid.scrollBy({
        left: cardWidth + gap,
        behavior: 'smooth'
      });
    };
    
    // Button event listeners
    if (leftBtn) {
      leftBtn.addEventListener('click', scrollLeft);
    }
    if (rightBtn) {
      rightBtn.addEventListener('click', scrollRight);
    }
    
    // Update button states on scroll
    grid.addEventListener('scroll', updateButtonStates);
    
    // Initial state update
    updateButtonStates();
    
    // Create pagination dots for this grid
    (function createDotsForGrid() {
      const items = Array.from(grid.querySelectorAll('.news-item'));
      if (!items.length) return;

      // find or create dots container (placed after the wrapper)
      let dotsContainer = wrapper.parentElement.querySelector('.news-dots');
      if (!dotsContainer) {
        dotsContainer = document.createElement('div');
        dotsContainer.className = 'news-dots';
        wrapper.parentElement.appendChild(dotsContainer);
      }
      dotsContainer.innerHTML = '';

      items.forEach((item, idx) => {
        const btn = document.createElement('button');
        if (idx === 0) btn.classList.add('active');
        btn.addEventListener('click', () => {
          const gap = parseInt(getComputedStyle(grid).gap) || 32;
          grid.scrollTo({ left: idx * (item.offsetWidth + gap), behavior: 'smooth' });
        });
        dotsContainer.appendChild(btn);
      });

      const updateActiveDot = () => {
        const gap = parseInt(getComputedStyle(grid).gap) || 32;
        const cardWidth = items[0]?.offsetWidth || 400;
        const index = Math.round(grid.scrollLeft / (cardWidth + gap));
        const dots = Array.from(dotsContainer.querySelectorAll('button'));
        dots.forEach((d, i) => d.classList.toggle('active', i === index));
      };

      grid.addEventListener('scroll', updateActiveDot);
      window.addEventListener('resize', () => {
        setTimeout(updateActiveDot, 120);
      });
      // initial sync
      updateActiveDot();
    })();
    
    // Update on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateButtonStates, 100);
    });
  });
});

// YouTube modal: open when clicking video preview image or play button
(() => {
  const videoPreview = document.querySelector('.video-preview');
  if (!videoPreview) return;

  const thumbImg = videoPreview.querySelector('img');
  const playButton = videoPreview.querySelector('.play-button');
  const modal = document.getElementById('youtube-modal');
  const iframe = document.getElementById('youtube-iframe');
  const closeSelectors = modal ? modal.querySelectorAll('[data-action="close"]') : [];
  const youtubeUrl = 'https://youtu.be/u-Hr7DxV1uo';

  // Helper to extract video id from various YouTube URLs
  function extractYouTubeId(url) {
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtu.be')) {
        return u.pathname.slice(1);
      }
      if (u.hostname.includes('youtube.com')) {
        return u.searchParams.get('v');
      }
    } catch (e) {
      // fallback regex
      const m = url.match(/(?:v=|\/)([A-Za-z0-9_-]{11})/);
      return m ? m[1] : null;
    }
    return null;
  }

  const videoId = extractYouTubeId(youtubeUrl) || 'u-Hr7DxV1uo';
  const embedBase = `https://www.youtube.com/embed/${videoId}`;
  const embedParams = '?autoplay=1&controls=1&rel=0';
  const embedSrc = embedBase + embedParams;

  function openModal() {
    if (!modal || !iframe) return;
    iframe.src = embedSrc;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal || !iframe) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    // clear src to stop playback
    iframe.src = '';
    document.body.style.overflow = '';
  }

  if (thumbImg) {
    thumbImg.style.cursor = 'pointer';
    thumbImg.addEventListener('click', openModal);
  }
  if (playButton) {
    playButton.style.cursor = 'pointer';
    playButton.addEventListener('click', openModal);
  }

  closeSelectors.forEach(btn => btn.addEventListener('click', closeModal));
  // click backdrop
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('youtube-modal-backdrop')) {
        closeModal();
      }
    });
  }
  // Esc key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeModal();
    }
  });
})();
