from flask import Flask, render_template, redirect, url_for, flash, request, abort, jsonify
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_mail import Mail, Message
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, TextAreaField, BooleanField, SelectField, FileField
from wtforms.validators import DataRequired, Email, Length
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from models import db, User, Content, Product, ContactMessage, CareerApplication
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import traceback

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-this-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///admin_panel.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'static', 'uploads')

# Email Configuration
app.config['MAIL_SERVER'] = 'smtp.office365.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = 'developer@alrawabigroup.com'
app.config['MAIL_PASSWORD'] = 'Qatar@9863'
app.config['MAIL_DEFAULT_SENDER'] = 'developer@alrawabigroup.com'
app.config['MAIL_MAX_EMAILS'] = None
app.config['MAIL_ASCII_ATTACHMENTS'] = False
app.config['MAIL_DEBUG'] = True

# Initialize extensions
db.init_app(app)
with app.app_context():
    db.create_all()
    print("Database tables verified/created.")
mail = Mail(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'admin_login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Forms
class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])

class ContentForm(FlaskForm):
    value = TextAreaField('Content', validators=[DataRequired()])

class ProductForm(FlaskForm):
    name = StringField('Product Name', validators=[DataRequired()])
    brand = StringField('Brand')
    description = TextAreaField('Description')
    category = StringField('Category')
    is_featured = BooleanField('Featured Product')
    is_active = BooleanField('Active', default=True)

# Create database tables
with app.app_context():
    db.create_all()

    # Create default admin user if not exists
    if not User.query.filter_by(username='admin').first():
        admin = User(username='admin', email='admin@example.com', is_admin=True)
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()

    # Create sample products for testing search functionality
    if not Product.query.first():
        sample_products = [
            Product(name='Premium Basmati Rice', brand='Golden Harvest', description='Long grain aromatic rice perfect for biryani', category='Rice', is_featured=True, is_active=True),
            Product(name='Brown Rice', brand='Organic Farms', description='Whole grain brown rice rich in nutrients', category='Rice', is_active=True),
            Product(name='White Rice', brand='Daily Essentials', description='Everyday white rice for all cooking needs', category='Rice', is_active=True),
            Product(name='Black Pepper', brand='Spice Masters', description='Premium quality whole black peppercorns', category='Spices', is_featured=True, is_active=True),
            Product(name='Cumin Seeds', brand='Spice Masters', description='Aromatic cumin seeds for authentic flavors', category='Spices', is_active=True),
            Product(name='Turmeric Powder', brand='Pure Herbs', description='Natural turmeric powder with curcumin', category='Spices', is_active=True),
            Product(name='Sunflower Oil', brand='Healthy Choice', description='Refined sunflower oil for cooking', category='Oils', is_featured=True, is_active=True),
            Product(name='Olive Oil', brand='Mediterranean Gold', description='Extra virgin olive oil imported from Spain', category='Oils', is_active=True),
            Product(name='Coconut Oil', brand='Tropical Fresh', description='Pure coconut oil for cooking and beauty', category='Oils', is_active=True),
            Product(name='Tomato Paste', brand='Chef\'s Choice', description='Concentrated tomato paste for sauces', category='Canned Goods', is_active=True),
            Product(name='Chickpeas', brand='Protein Plus', description='Premium quality chickpeas for cooking', category='Pulses', is_featured=True, is_active=True),
            Product(name='Lentils', brand='NutriFoods', description='Red lentils rich in protein', category='Pulses', is_active=True),
        ]

        for product in sample_products:
            db.session.add(product)
        db.session.commit()

# Public routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/product')
def product():
    return render_template('product.html')

@app.route('/store')
def store():
    return render_template('store.html')

@app.route('/news')
def news():
    return render_template('news.html')

@app.route('/career')
def career():
    return render_template('career.html')

@app.route('/blog')
def blog():
    return render_template('blog.html')

@app.route('/testimonial')
def testimonial():
    return render_template('testimonial.html')

@app.route('/feature')
def feature():
    return render_template('feature.html')

@app.route('/cookies-policy')
def cookies_policy():
    return render_template('cookies-policy.html')

@app.route('/404')
def page_404():
    return render_template('404.html')

# API routes
@app.route('/api/search/products')
def search_products():
    query = request.args.get('q', '').strip()
    if not query or len(query) < 2:
        return jsonify([])

    # Search products by name, brand, or category
    products = Product.query.filter(
        db.or_(
            Product.name.ilike(f'%{query}%'),
            Product.brand.ilike(f'%{query}%'),
            Product.category.ilike(f'%{query}%')
        ),
        Product.is_active == True
    ).limit(10).all()

    results = []
    for product in products:
        results.append({
            'id': product.id,
            'name': product.name,
            'brand': product.brand or '',
            'category': product.category or '',
            'description': product.description or '',
            'image_path': product.image_path or ''
        })

    return jsonify(results)

# Direct SMTP Email Function (More Reliable)
def send_email_direct(to_emails, subject, body, attachment_data=None, attachment_filename=None, attachment_mimetype=None):
    """
    Send email using direct SMTP connection (more reliable than Flask-Mail)
    Returns: (success: bool, error_message: str)
    """
    try:
        smtp_server = app.config['MAIL_SERVER']
        smtp_port = app.config['MAIL_PORT']
        smtp_username = app.config['MAIL_USERNAME']
        smtp_password = app.config['MAIL_PASSWORD']
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['Subject'] = subject
        
        # Handle multiple recipients
        if isinstance(to_emails, list):
            msg['To'] = ', '.join(to_emails)
            recipients = to_emails
        else:
            msg['To'] = to_emails
            recipients = [to_emails]
        
        # Add body
        msg.attach(MIMEText(body, 'plain'))
        
        # Add attachment if provided
        if attachment_data and attachment_filename:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(attachment_data)
            encoders.encode_base64(part)
            part.add_header('Content-Disposition', f'attachment; filename= {attachment_filename}')
            msg.attach(part)
            print(f"Attachment added: {attachment_filename}")
        
        # Connect and send
        print(f"Connecting to SMTP server: {smtp_server}:{smtp_port}")
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        print(f"Authenticating as: {smtp_username}")
        server.login(smtp_username, smtp_password)
        print(f"Sending email to: {recipients}")
        server.sendmail(smtp_username, recipients, msg.as_string())
        server.quit()
        print(f"Email sent successfully to: {recipients}")
        return (True, None)
        
    except smtplib.SMTPAuthenticationError as e:
        error_msg = f"SMTP Authentication failed. Please check your email credentials."
        print(f"✗ {error_msg}")
        print(f"Error details: {str(e)}")
        return (False, error_msg)
    except smtplib.SMTPRecipientsRefused as e:
        error_msg = f"Invalid email address(es): {recipients}"
        print(f"✗ {error_msg}")
        print(f"Error details: {str(e)}")
        return (False, error_msg)
    except smtplib.SMTPServerDisconnected as e:
        error_msg = f"SMTP server disconnected. Please check your internet connection and try again."
        print(f"✗ {error_msg}")
        print(f"Error details: {str(e)}")
        return (False, error_msg)
    except Exception as e:
        error_msg = f"Failed to send email: {str(e)}"
        print(f"✗ {error_msg}")
        print(traceback.format_exc())
        return (False, error_msg)

@app.route('/api/career/apply', methods=['POST', 'OPTIONS'])
def career_apply():
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
    
    try:
        print("\n" + "="*60)
        print("NEW CAREER APPLICATION RECEIVED")
        print(f"Request Method: {request.method}")
        print(f"Content Type: {request.content_type}")
        print(f"Form Data Keys: {list(request.form.keys())}")
        print(f"Files: {list(request.files.keys())}")
        print("="*60)
        
        # Get form data
        first_name = request.form.get('firstName', '').strip()
        last_name = request.form.get('lastName', '').strip()
        candidate_email = request.form.get('email', '').strip()
        phone = request.form.get('phone', '').strip()
        experience = request.form.get('experience', '').strip()
        current_position = request.form.get('currentPosition', 'N/A').strip()
        cover_letter = request.form.get('coverLetter', '').strip()
        job_title = request.form.get('jobTitle', 'General Application').strip()
        
        print(f"Job Title: {job_title}")
        print(f"Candidate: {first_name} {last_name}")
        print(f"Email: {candidate_email}")
        print(f"Phone: {phone}")
        
        if not candidate_email or not first_name:
            print("ERROR: Missing required fields")
            return jsonify({'status': 'error', 'message': 'Missing required fields'}), 400

        # Handle file upload (Resume)
        resume_file = request.files.get('resume')
        resume_filename = None
        resume_data = None
        resume_mimetype = None
        
        if resume_file and resume_file.filename:
            print(f"Processing resume: {resume_file.filename}")
            if not os.path.exists(app.config['UPLOAD_FOLDER']):
                os.makedirs(app.config['UPLOAD_FOLDER'])
            
            resume_filename = secure_filename(f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{resume_file.filename}")
            resume_path = os.path.join(app.config['UPLOAD_FOLDER'], resume_filename)
            resume_file.save(resume_path)
            
            # Read data for attachment
            with open(resume_path, 'rb') as f:
                resume_data = f.read()
            resume_mimetype = resume_file.content_type or 'application/pdf'
            print(f"Resume saved: {resume_filename} ({len(resume_data)} bytes)")

        # Save to Database FIRST
        try:
            application = CareerApplication(
                job_title=job_title,
                first_name=first_name,
                last_name=last_name,
                email=candidate_email,
                phone=phone,
                experience=experience,
                current_position=current_position,
                cover_letter=cover_letter,
                resume_path=resume_filename
            )
            db.session.add(application)
            db.session.commit()
            print(f"✓ Application saved to database (ID: {application.id})")
        except Exception as e:
            print(f"✗ Database error: {str(e)}")
            db.session.rollback()

        # Send email to Candidate using DIRECT SMTP
        candidate_email_sent = False
        candidate_error = None
        try:
            print("\n--- Sending Candidate Confirmation Email ---")
            candidate_subject = f"Application Received: {job_title} - AL RAWABI FOOD STUFF"
            candidate_body = f"""Dear {first_name} {last_name},

Thank you for applying for the position of {job_title} at AL RAWABI FOOD STUFF.

We have received your application and our HR team will review it. If your profile matches our requirements, we will contact you for the next steps.

Best regards,
HR Department
AL RAWABI FOOD STUFF"""
            
            candidate_email_sent, candidate_error = send_email_direct(
                to_emails=[candidate_email],
                subject=candidate_subject,
                body=candidate_body
            )
            
            if candidate_email_sent:
                print("✓ Candidate confirmation email sent successfully")
            else:
                print(f"✗ Candidate confirmation email FAILED: {candidate_error}")
        except Exception as e:
            candidate_error = f"Unexpected error: {str(e)}"
            print(f"✗ CRITICAL ERROR: Candidate email failed: {candidate_error}")
            print(traceback.format_exc())

        # Send email to HR and Team Manager using DIRECT SMTP
        staff_email_sent = False
        staff_error = None
        try:
            print("\n--- Sending Staff Notification Email ---")
            hr_email = "minhaj.rawabi@gmail.com"
            manager_email = "rawabihelpdesk@gmail.com"
            developer_email = "developer@alrawabigroup.com"
            
            staff_subject = f"New Job Application: {job_title} - {first_name} {last_name}"
            staff_body = f"""Hello,

A new job application has been submitted through the website.

Candidate Details:
Name: {first_name} {last_name}
Email: {candidate_email}
Phone: {phone}
Job Title: {job_title}
Experience: {experience}
Current Position: {current_position}

Cover Letter:
{cover_letter}

Regards,
Website System"""
            
            staff_email_sent, staff_error = send_email_direct(
                to_emails=[hr_email, manager_email, developer_email],
                subject=staff_subject,
                body=staff_body,
                attachment_data=resume_data,
                attachment_filename=resume_file.filename if resume_file else None,
                attachment_mimetype=resume_mimetype
            )
            
            if staff_email_sent:
                print("✓ Staff notification email sent successfully")
            else:
                print(f"✗ Staff notification email FAILED: {staff_error}")
        except Exception as e:
            staff_error = f"Unexpected error: {str(e)}"
            print(f"✗ CRITICAL ERROR: Staff email failed: {staff_error}")
            print(traceback.format_exc())

        # Determine response based on email sending results
        print("\n" + "="*60)
        if candidate_email_sent and staff_email_sent:
            print("✓ APPLICATION PROCESS COMPLETED SUCCESSFULLY")
            print("="*60 + "\n")
            response = jsonify({
                'status': 'success', 
                'message': 'Application submitted successfully! Confirmation email has been sent.'
            })
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        else:
            # Build error message
            error_messages = []
            if not candidate_email_sent:
                error_messages.append(f"Failed to send confirmation email: {candidate_error or 'Unknown error'}")
            if not staff_email_sent:
                error_messages.append(f"Failed to send notification to HR: {staff_error or 'Unknown error'}")
            
            error_message = " | ".join(error_messages)
            
            if candidate_email_sent:
                print("⚠ APPLICATION SAVED BUT STAFF EMAIL FAILED")
            elif staff_email_sent:
                print("⚠ APPLICATION SAVED BUT CANDIDATE EMAIL FAILED")
            else:
                print("✗ APPLICATION SAVED BUT ALL EMAILS FAILED")
            print("="*60 + "\n")
            
            response = jsonify({
                'status': 'error',
                'message': f'Application was saved, but email sending failed. {error_message}'
            })
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 500
    
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"\n✗ GENERAL PROCESS ERROR: {str(e)}")
        print(error_trace)
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Test Email Route
@app.route('/api/test-email', methods=['GET'])
def test_email():
    """Test email sending functionality"""
    try:
        test_email_address = request.args.get('email', 'developer@alrawabigroup.com')
        print(f"\n--- Testing Email Sending to {test_email_address} ---")
        
        success, error_msg = send_email_direct(
            to_emails=[test_email_address],
            subject="Test Email from AL RAWABI FOOD STUFF Website",
            body="This is a test email to verify email functionality is working correctly."
        )
        
        if success:
            return jsonify({'status': 'success', 'message': f'Test email sent successfully to {test_email_address}'})
        else:
            return jsonify({'status': 'error', 'message': f'Failed to send test email: {error_msg}'}), 500
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Admin routes
@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if current_user.is_authenticated:
        return redirect(url_for('admin_dashboard'))

    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and user.check_password(form.password.data) and user.is_admin:
            login_user(user)
            return redirect(url_for('admin_dashboard'))
        flash('Invalid username or password')
    return render_template('admin/login.html', form=form, now=datetime.now())

@app.route('/admin/logout')
@login_required
def admin_logout():
    logout_user()
    return redirect(url_for('home'))

@app.route('/admin')
@login_required
def admin_dashboard():
    if not current_user.is_admin:
        abort(403)

    products = Product.query.all()
    messages = ContactMessage.query.all()
    content_items = Content.query.all()

    return render_template('admin/dashboard.html',
                         products=products,
                         messages=messages,
                         content_items=content_items,
                         now=datetime.now())

@app.route('/admin/content', methods=['GET', 'POST'])
@login_required
def admin_content():
    if not current_user.is_admin:
        abort(403)

    page = request.args.get('page', 'home')
    section = request.args.get('section', 'hero')

    contents = Content.query.filter_by(page=page, section=section).all()
    content_dict = {c.key: c for c in contents}

    if request.method == 'POST':
        for key in request.form:
            if key.startswith('content_'):
                content_key = key.replace('content_', '')
                value = request.form[key]

                content = content_dict.get(content_key)
                if content:
                    content.value = value
                else:
                    content = Content(page=page, section=section, key=content_key, value=value)
                    db.session.add(content)

        db.session.commit()
        flash('Content updated successfully')
        return redirect(url_for('admin_content', page=page, section=section))

    return render_template('admin/content.html', page=page, section=section, content_dict=content_dict, now=datetime.now())

@app.route('/admin/products')
@login_required
def admin_products():
    if not current_user.is_admin:
        abort(403)
    products = Product.query.all()
    return render_template('admin/products.html', products=products, now=datetime.now())

@app.route('/admin/products/add', methods=['GET', 'POST'])
@login_required
def admin_add_product():
    if not current_user.is_admin:
        abort(403)

    form = ProductForm()
    if form.validate_on_submit():
        product = Product(
            name=form.name.data,
            brand=form.brand.data,
            description=form.description.data,
            category=form.category.data,
            is_featured=form.is_featured.data,
            is_active=form.is_active.data
        )
        db.session.add(product)
        db.session.commit()
        flash('Product added successfully')
        return redirect(url_for('admin_products'))

    return render_template('admin/product_form.html', form=form, title='Add Product', now=datetime.now())

@app.route('/admin/products/<int:id>/edit', methods=['GET', 'POST'])
@login_required
def admin_edit_product(id):
    if not current_user.is_admin:
        abort(403)

    product = Product.query.get_or_404(id)
    form = ProductForm(obj=product)

    if form.validate_on_submit():
        form.populate_obj(product)
        db.session.commit()
        flash('Product updated successfully')
        return redirect(url_for('admin_products'))

    return render_template('admin/product_form.html', form=form, title='Edit Product', now=datetime.now())

@app.route('/admin/products/<int:id>/delete')
@login_required
def admin_delete_product(id):
    if not current_user.is_admin:
        abort(403)

    product = Product.query.get_or_404(id)
    db.session.delete(product)
    db.session.commit()
    flash('Product deleted successfully')
    return redirect(url_for('admin_products'))

@app.route('/admin/messages')
@login_required
def admin_messages():
    if not current_user.is_admin:
        abort(403)
    messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
    return render_template('admin/messages.html', messages=messages, now=datetime.now())

@app.route('/admin/messages/<int:id>/mark-read')
@login_required
def admin_mark_message_read(id):
    if not current_user.is_admin:
        abort(403)

    message = ContactMessage.query.get_or_404(id)
    message.is_read = True
    db.session.commit()
    return redirect(url_for('admin_messages'))

if __name__ == '__main__':
    app.run(debug=True)
