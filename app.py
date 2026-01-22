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
import base64

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

# Email Template Helper Function
def get_logo_base64():
    """Get logo as base64 encoded string for email embedding"""
    try:
        logo_path = os.path.join(app.root_path, 'static', 'img', 'logo.png')
        if os.path.exists(logo_path):
            with open(logo_path, 'rb') as f:
                logo_data = f.read()
            logo_base64 = base64.b64encode(logo_data).decode('utf-8')
            return f"data:image/png;base64,{logo_base64}"
    except Exception as e:
        print(f"[WARN] Could not load logo for email: {str(e)}")
    return None

def create_html_email_template(title, content, logo_url=None):
    """
    Create HTML email template with theme colors and logo
    Theme colors: Primary: #14A751, Secondary: #FB9F38, Light: #F5F8F2, Dark: #252C30
    """
    logo_html = ""
    if logo_url:
        logo_html = f'<img src="{logo_url}" alt="AL RAWABI FOOD STUFF Logo" style="width: 120px; height: auto; display: block; margin: 0 auto 20px;">'
    
    html_template = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Open Sans', Arial, sans-serif; background-color: #F5F8F2;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F5F8F2;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #FFFFFF; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #14A751; padding: 30px 40px; text-align: center; border-radius: 8px 8px 0 0;">
                            {logo_html}
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            {content}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #252C30; padding: 30px 40px; text-align: center; border-radius: 0 0 8px 8px; color: #FFFFFF;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #FFFFFF;">
                                <strong>AL RAWABI FOOD STUFF W.L.L</strong>
                            </p>
                            <p style="margin: 0 0 5px 0; font-size: 12px; color: #F5F8F2;">
                                Industrial Area-37, Building No: 19, Doha-Qatar
                            </p>
                            <p style="margin: 0 0 5px 0; font-size: 12px; color: #F5F8F2;">
                                Phone: +974 4497 1777 | Email: info@alrawabigroup.com
                            </p>
                            <p style="margin: 15px 0 0 0; font-size: 11px; color: #F5F8F2; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px;">
                                &copy; {datetime.now().year} AL RAWABI FOOD STUFF. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""
    return html_template

# Direct SMTP Email Function (More Reliable)
def send_email_direct(to_emails, subject, body, attachment_data=None, attachment_filename=None, attachment_mimetype=None):
    """
    Send email using direct SMTP connection (more reliable than Flask-Mail)
    Returns: (success: bool, error_message: str)
    """
    server = None
    try:
        smtp_server = app.config['MAIL_SERVER']
        smtp_port = app.config['MAIL_PORT']
        smtp_username = app.config['MAIL_USERNAME']
        smtp_password = app.config['MAIL_PASSWORD']
        
        # Validate inputs
        if not to_emails:
            return (False, "No recipient email address provided")
        if not subject or not body:
            return (False, "Subject and body are required")
        
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
        
        # Validate email addresses
        for email in recipients:
            if '@' not in email or '.' not in email.split('@')[1]:
                return (False, f"Invalid email address format: {email}")
        
        # Add body (support both plain and HTML)
        # Check if body is HTML (contains HTML tags)
        is_html = isinstance(body, str) and ('<html' in body.lower() or '<div' in body.lower() or '<p' in body.lower() or '<br' in body.lower())
        
        if is_html:
            # Create alternative for email clients that don't support HTML
            plain_text = body
            # Remove HTML tags for plain text version
            import re
            plain_text = re.sub(r'<[^>]+>', '', plain_text)
            plain_text = plain_text.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
            
            # Create multipart alternative (HTML + plain text)
            msg_alternative = MIMEMultipart('alternative')
            msg_alternative.attach(MIMEText(plain_text, 'plain'))
            msg_alternative.attach(MIMEText(body, 'html'))
            msg.attach(msg_alternative)
        else:
            msg.attach(MIMEText(body if isinstance(body, str) else str(body), 'plain'))
        
        # Add attachment if provided
        if attachment_data and attachment_filename:
            try:
                # Determine content type
                if attachment_mimetype:
                    maintype, subtype = attachment_mimetype.split('/', 1) if '/' in attachment_mimetype else ('application', 'octet-stream')
                else:
                    # Guess from filename extension
                    ext = attachment_filename.lower().split('.')[-1] if '.' in attachment_filename else ''
                    if ext in ['pdf']:
                        maintype, subtype = 'application', 'pdf'
                    elif ext in ['doc', 'docx']:
                        maintype, subtype = 'application', 'msword'
                    elif ext in ['jpg', 'jpeg']:
                        maintype, subtype = 'image', 'jpeg'
                    elif ext in ['png']:
                        maintype, subtype = 'image', 'png'
                    else:
                        maintype, subtype = 'application', 'octet-stream'
                
                part = MIMEBase(maintype, subtype)
                part.set_payload(attachment_data)
                encoders.encode_base64(part)
                # Properly encode filename for international characters
                from email.header import Header
                part.add_header('Content-Disposition', 'attachment', filename=Header(attachment_filename, 'utf-8').encode())
                msg.attach(part)
                print(f"[OK] Attachment added: {attachment_filename} ({len(attachment_data)} bytes)")
            except Exception as e:
                print(f"[WARN] Failed to add attachment: {str(e)}")
                # Continue without attachment rather than failing completely
        
        # Connect and send with timeout
        print(f"[INFO] Connecting to SMTP server: {smtp_server}:{smtp_port}")
        server = smtplib.SMTP(smtp_server, smtp_port, timeout=30)
        server.starttls()
        print(f"[INFO] Authenticating as: {smtp_username}")
        server.login(smtp_username, smtp_password)
        print(f"[INFO] FROM: {smtp_username}")
        print(f"[INFO] TO: {recipients}")
        print(f"[INFO] SUBJECT: {subject}")
        server.sendmail(smtp_username, recipients, msg.as_string())
        server.quit()
        server = None  # Mark as closed
        print(f"[SUCCESS] Email sent successfully FROM {smtp_username} TO {recipients}")
        return (True, None)
        
    except smtplib.SMTPAuthenticationError as e:
        error_msg = f"SMTP Authentication failed. Please check your email credentials."
        print(f"[ERROR] {error_msg}")
        print(f"[ERROR] Details: {str(e)}")
        return (False, error_msg)
    except smtplib.SMTPRecipientsRefused as e:
        error_msg = f"Invalid email address(es): {recipients}"
        print(f"[ERROR] {error_msg}")
        print(f"[ERROR] Details: {str(e)}")
        return (False, error_msg)
    except smtplib.SMTPServerDisconnected as e:
        error_msg = f"SMTP server disconnected. Please check your internet connection and try again."
        print(f"[ERROR] {error_msg}")
        print(f"[ERROR] Details: {str(e)}")
        return (False, error_msg)
    except smtplib.SMTPConnectError as e:
        error_msg = f"Failed to connect to SMTP server. Check server address and port."
        print(f"[ERROR] {error_msg}")
        print(f"[ERROR] Details: {str(e)}")
        return (False, error_msg)
    except smtplib.SMTPDataError as e:
        error_msg = f"SMTP server rejected the email data."
        print(f"[ERROR] {error_msg}")
        print(f"[ERROR] Details: {str(e)}")
        return (False, error_msg)
    except smtplib.SMTPException as e:
        error_msg = f"SMTP error occurred: {str(e)}"
        print(f"[ERROR] {error_msg}")
        print(f"[ERROR] Details: {str(e)}")
        return (False, error_msg)
    except Exception as e:
        error_msg = f"Failed to send email: {str(e)}"
        print(f"[ERROR] {error_msg}")
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        return (False, error_msg)
    finally:
        # Ensure server connection is closed
        if server:
            try:
                server.quit()
            except:
                try:
                    server.close()
                except:
                    pass

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
            print(f"[OK] Application saved to database (ID: {application.id})")
        except Exception as e:
            print(f"[ERROR] Database error: {str(e)}")
            db.session.rollback()

        # EMAIL 1: Send email FROM developer@alrawabigroup.com TO Candidate
        candidate_email_sent = False
        candidate_error = None
        try:
            print("\n" + "-"*60)
            print("EMAIL 1: Sending Candidate Confirmation Email")
            print(f"FROM: developer@alrawabigroup.com")
            print(f"TO: {candidate_email}")
            print("-"*60)
            
            candidate_subject = f"Application Received: {job_title} - AL RAWABI FOOD STUFF"
            
            # Create HTML email content
            logo_url = get_logo_base64()
            candidate_content = f"""
            <h2 style="color: #14A751; margin-top: 0; font-size: 24px; font-weight: 600;">Application Received</h2>
            <p style="color: #252C30; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                Dear <strong>{first_name} {last_name}</strong>,
            </p>
            <p style="color: #252C30; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                Thank you for applying for the position of <strong style="color: #14A751;">{job_title}</strong> at AL RAWABI FOOD STUFF.
            </p>
            <p style="color: #252C30; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                We have received your application and our HR team will review it. If your profile matches our requirements, we will contact you for the next steps.
            </p>
            <div style="margin: 30px 0; padding: 20px; background-color: #F5F8F2; border-left: 4px solid #14A751; border-radius: 4px;">
                <p style="margin: 0; color: #252C30; font-size: 14px;">
                    <strong>Application Details:</strong><br>
                    Position: {job_title}<br>
                    Submitted: {datetime.now().strftime('%B %d, %Y')}
                </p>
            </div>
            <p style="color: #252C30; font-size: 16px; line-height: 1.6; margin: 30px 0 20px 0;">
                Best regards,<br>
                <strong style="color: #14A751;">HR Department</strong><br>
                AL RAWABI FOOD STUFF
            </p>
            """
            candidate_body = create_html_email_template(
                title=candidate_subject,
                content=candidate_content,
                logo_url=logo_url
            )
            
            candidate_email_sent, candidate_error = send_email_direct(
                to_emails=[candidate_email],
                subject=candidate_subject,
                body=candidate_body
            )
            
            if candidate_email_sent:
                print(f"[SUCCESS] EMAIL 1: Candidate confirmation sent to {candidate_email}")
            else:
                print(f"[FAIL] EMAIL 1 FAILED: {candidate_error}")
        except Exception as e:
            candidate_error = f"Unexpected error: {str(e)}"
            print(f"[ERROR] EMAIL 1 CRITICAL ERROR: {candidate_error}")
            print(traceback.format_exc())

        # EMAIL 2: Send email FROM developer@alrawabigroup.com TO HR and Manager
        staff_email_sent = False
        staff_error = None
        try:
            print("\n" + "-"*60)
            print("EMAIL 2: Sending Staff Notification Email")
            print(f"FROM: developer@alrawabigroup.com")
            hr_email = "minhaj.rawabi@gmail.com"
            manager_email = "rawabihelpdesk@gmail.com"
            print(f"TO: {hr_email}, {manager_email}")
            print("-"*60)
            
            staff_subject = f"New Job Application: {job_title} - {first_name} {last_name}"
            
            # Create HTML email content for staff
            logo_url = get_logo_base64()
            cover_letter_html = cover_letter.replace('\n', '<br>') if cover_letter else 'N/A'
            staff_content = f"""
            <h2 style="color: #14A751; margin-top: 0; font-size: 24px; font-weight: 600;">New Job Application Received</h2>
            <p style="color: #252C30; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                A new job application has been submitted through the website.
            </p>
            <div style="margin: 30px 0; padding: 25px; background-color: #F5F8F2; border-radius: 8px; border: 1px solid #E0E0E0;">
                <h3 style="color: #14A751; margin-top: 0; margin-bottom: 20px; font-size: 18px; font-weight: 600;">Candidate Details</h3>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="color: #252C30; font-size: 14px;">
                    <tr>
                        <td style="padding: 8px 0; width: 150px;"><strong>Name:</strong></td>
                        <td style="padding: 8px 0;">{first_name} {last_name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0;"><strong>Email:</strong></td>
                        <td style="padding: 8px 0;"><a href="mailto:{candidate_email}" style="color: #14A751; text-decoration: none;">{candidate_email}</a></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0;"><strong>Phone:</strong></td>
                        <td style="padding: 8px 0;"><a href="tel:{phone}" style="color: #14A751; text-decoration: none;">{phone}</a></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0;"><strong>Job Title:</strong></td>
                        <td style="padding: 8px 0;"><span style="background-color: #14A751; color: #FFFFFF; padding: 4px 12px; border-radius: 4px; font-size: 12px;">{job_title}</span></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0;"><strong>Experience:</strong></td>
                        <td style="padding: 8px 0;">{experience}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0;"><strong>Current Position:</strong></td>
                        <td style="padding: 8px 0;">{current_position}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; vertical-align: top;"><strong>Cover Letter:</strong></td>
                        <td style="padding: 8px 0;">{cover_letter_html}</td>
                    </tr>
                </table>
            </div>
            <div style="margin: 20px 0; padding: 15px; background-color: #FFF9E6; border-left: 4px solid #FB9F38; border-radius: 4px;">
                <p style="margin: 0; color: #252C30; font-size: 13px;">
                    <strong>Note:</strong> Resume/CV is attached to this email.
                </p>
            </div>
            <p style="color: #252C30; font-size: 16px; line-height: 1.6; margin: 30px 0 20px 0;">
                Regards,<br>
                <strong style="color: #14A751;">Website System</strong><br>
                AL RAWABI FOOD STUFF
            </p>
            """
            staff_body = create_html_email_template(
                title=staff_subject,
                content=staff_content,
                logo_url=logo_url
            )
            
            staff_email_sent, staff_error = send_email_direct(
                to_emails=[hr_email, manager_email],
                subject=staff_subject,
                body=staff_body,
                attachment_data=resume_data,
                attachment_filename=resume_file.filename if resume_file else None,
                attachment_mimetype=resume_mimetype
            )
            
            if staff_email_sent:
                print(f"[SUCCESS] EMAIL 2: Staff notification sent to HR and Manager")
            else:
                print(f"[FAIL] EMAIL 2 FAILED: {staff_error}")
        except Exception as e:
            staff_error = f"Unexpected error: {str(e)}"
            print(f"[ERROR] EMAIL 2 CRITICAL ERROR: {staff_error}")
            print(traceback.format_exc())

        # Determine response based on email sending results
        print("\n" + "="*60)
        if candidate_email_sent and staff_email_sent:
            print("[SUCCESS] APPLICATION PROCESS COMPLETED SUCCESSFULLY")
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
                print("[WARNING] APPLICATION SAVED BUT STAFF EMAIL FAILED")
            elif staff_email_sent:
                print("[WARNING] APPLICATION SAVED BUT CANDIDATE EMAIL FAILED")
            else:
                print("[FAIL] APPLICATION SAVED BUT ALL EMAILS FAILED")
            print("="*60 + "\n")
            
            response = jsonify({
                'status': 'error',
                'message': f'Application was saved, but email sending failed. {error_message}'
            })
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 500
    
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"\n[ERROR] GENERAL PROCESS ERROR: {str(e)}")
        print(error_trace)
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Test Email Route
@app.route('/api/test-email', methods=['GET'])
def test_email():
    """Test email sending functionality"""
    try:
        test_email_address = request.args.get('email', 'developer@alrawabigroup.com')
        print(f"\n--- Testing Email Sending to {test_email_address} ---")
        
        # Create HTML test email
        logo_url = get_logo_base64()
        test_content = """
            <h2 style="color: #14A751; margin-top: 0; font-size: 24px; font-weight: 600;">Email System Test</h2>
            <p style="color: #252C30; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                This is a test email to verify email functionality is working correctly.
            </p>
            <div style="margin: 30px 0; padding: 20px; background-color: #F5F8F2; border-left: 4px solid #14A751; border-radius: 4px;">
                <p style="margin: 0; color: #252C30; font-size: 14px;">
                    <strong>Test Details:</strong><br>
                    Date: """ + datetime.now().strftime('%B %d, %Y at %I:%M %p') + """<br>
                    Status: Email system is operational
                </p>
            </div>
            <p style="color: #252C30; font-size: 16px; line-height: 1.6; margin: 30px 0 20px 0;">
                If you received this email, the email system is working correctly!
            </p>
        """
        test_body = create_html_email_template(
            title="Test Email from AL RAWABI FOOD STUFF Website",
            content=test_content,
            logo_url=logo_url
        )
        
        success, error_msg = send_email_direct(
            to_emails=[test_email_address],
            subject="Test Email from AL RAWABI FOOD STUFF Website",
            body=test_body
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
