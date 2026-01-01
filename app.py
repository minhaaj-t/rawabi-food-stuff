from flask import Flask, render_template, redirect, url_for, flash, request, abort, jsonify
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, TextAreaField, BooleanField, SelectField, FileField
from wtforms.validators import DataRequired, Email, Length
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from models import db, User, Content, Product, ContactMessage

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-this-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///admin_panel.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'static', 'uploads')

# Initialize extensions
db.init_app(app)
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
