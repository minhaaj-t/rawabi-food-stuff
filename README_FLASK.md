# AL RAWABI FOOD STUFF - Flask Web Application

This is a Flask web application converted from the static AL RAWABI FOOD STUFF website template.

## Project Structure

```
tea-shop-website-template/
├── app.py                    # Main Flask application
├── requirements.txt          # Python dependencies
├── templates/               # Jinja2 templates with inheritance
│   ├── base.html            # Base template with header/footer
│   ├── index.html           # Home page (extends base.html)
│   ├── about.html           # About page (extends base.html)
│   ├── contact.html         # Contact page (extends base.html)
│   ├── product.html         # Products page (extends base.html)
│   ├── store.html           # Store page (extends base.html)
│   ├── news.html            # News page (extends base.html)
│   ├── blog.html            # Blog page (extends base.html)
│   ├── testimonial.html     # Testimonials page (extends base.html)
│   ├── feature.html         # Features page (extends base.html)
│   ├── cookies-policy.html  # Cookies policy page (extends base.html)
│   └── 404.html             # 404 error page (extends base.html)
└── static/                  # Static files
    ├── css/
    ├── js/
    ├── img/
    ├── lib/
    └── vid/
```

## Installation

1. Make sure you have Python 3.8+ installed
2. Install the required dependencies:

```bash
pip install -r requirements.txt
```

Or using Python module:

```bash
python -m pip install -r requirements.txt
```

## Running the Application

To run the Flask development server:

```bash
python app.py
```

The application will be available at: `http://127.0.0.1:5000`

## Available Routes

- `/` or `/home` - Home page
- `/about` - About page
- `/contact` - Contact page
- `/product` - Products page
- `/store` - Store page
- `/news` - News page
- `/blog` - Blog page
- `/testimonial` - Testimonials page
- `/feature` - Features page
- `/cookies-policy` - Cookies policy page
- `/404` - 404 error page

## Template Structure

The application uses Flask's Jinja2 template inheritance for maintainable code:

- **`base.html`**: Contains the common HTML structure, header navigation, footer, and JavaScript includes
- **Child templates**: Each page extends `base.html` and only contains page-specific content in `{% block content %}` blocks
- **Dynamic navigation**: Active page highlighting using Flask's `request.endpoint`
- **Consistent branding**: Header and footer shared across all pages

## Features

- **Responsive Design**: Bootstrap-based responsive layout
- **Interactive Elements**: Carousel, animations, and dynamic content
- **Video Background**: Hero section with video background
- **Brand Logos Animation**: Scrolling brand logos
- **Product Showcase**: Interactive product display
- **Testimonials**: Customer testimonials with video play buttons
- **Contact Information**: Complete contact details
- **Cookie Consent**: Cookie policy popup
- **Template Inheritance**: DRY principle with shared header/footer
- **Admin Panel**: Complete content management system

## Admin Panel

The application includes a comprehensive admin panel for content management:

### Access
- **URL**: `http://127.0.0.1:5000/admin/login`
- **Default Credentials**: `admin` / `admin123`
- **⚠️ Important**: Change the password after first login!

### Features
- **Dashboard**: Overview of products, messages, and content
- **Content Management**: Edit website text, titles, and descriptions
- **Product Management**: Add, edit, delete, and manage products
- **Message Management**: View and manage contact form messages
- **User Authentication**: Secure login/logout system

### Database
- Uses SQLite database (`admin_panel.db`)
- Automatically creates tables and default admin user on first run

## Static Files

All static files (CSS, JavaScript, images, videos) are served through Flask's static file serving system using `url_for('static', filename='...')`.

## Development

The application runs in debug mode by default. For production deployment, use a WSGI server like Gunicorn.

## Original Template

This Flask application is based on the AL RAWABI FOOD STUFF website template, a wholesale food supply company website for Qatar.
