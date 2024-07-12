from flask import Flask, g, session
from flask_sqlalchemy import SQLAlchemy
import json
from dotenv import load_dotenv
import os

# Route Handlers
from route_handlers.Auth.UserLoginHandler import UserLoginHandler
from route_handlers.Auth.UserRegisterHandler import UserRegisterHandler
from route_handlers.Auth.UserLostPasswordHandler import UserLostPasswordHandler
from route_handlers.Auth.UserLogoutHandler import UserLogoutHandler
from route_handlers.Auth.PWResetHandler import PWResetHandler
from route_handlers.SaveHandler import SaveHandler
from route_handlers.HomeHandler import HomeHandler
from route_handlers.UserSheetHandler import UserSheetHandler
from route_handlers.DownloadFileHander import DownloadFileHander
from route_handlers.ImportHandler import ImportHandler
from route_handlers.HTMLToPDFHandler import HtmlToPdfHandler

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__, template_folder='templates')
app.secret_key = os.getenv('SECRET_KEY')

app.config.update(
    MYSQL_HOST=os.getenv('MYSQL_HOST'),
    MYSQL_DATABASE=os.getenv('MYSQL_DATABASE'),
    MYSQL_USER=os.getenv('MYSQL_USER'),
    MYSQL_PASSWORD=os.getenv('MYSQL_PASSWORD'),
    SQLALCHEMY_DATABASE_URI=os.getenv('SQLALCHEMY_DATABASE_URI'),
    SQLALCHEMY_TRACK_MODIFICATIONS=os.getenv('SQLALCHEMY_TRACK_MODIFICATIONS'),
    APP_TITLE=os.getenv('APP_TITLE')
)

# Initialising Database
db = SQLAlchemy(app)

@app.context_processor
def inject_app_title():
    return dict(APP_TITLE=app.config['APP_TITLE'])

# Base Handlers
class BaseHandler:
    @property
    def db(self):
        if 'db' not in g:
            g.db = db
        return g.db

    def get_current_user(self):
        user_json = session.get('user')
        if user_json:
            return json.loads(user_json)
        return None

    def set_current_user(self, user):
        if user:
            session['user'] = json.dumps(user)
        else:
            session.pop('user', None)

# This code runs before every request
@app.before_request
def before_request():
    g.handler = BaseHandler()

# This code runs when app shuts down
@app.teardown_appcontext
def teardown_db(error):
    if 'db' in g:
        g.db.session.close()

# Routes
@app.route('/', methods=['GET'])
def index():
    return HomeHandler.get()

@app.route('/login', methods=['GET'])
def login_get():
    return UserLoginHandler.get()

@app.route('/login', methods=['POST'])
def login_post():
    return UserLoginHandler.post()

@app.route('/register', methods=['GET'])
def register_get():
    return UserRegisterHandler.get()

@app.route('/register', methods=['POST'])
def register_post():
    return UserRegisterHandler.post()

@app.route('/lostpw', methods=['GET'])
def lostpw_get():
    return UserLostPasswordHandler.get()

@app.route('/lostpw', methods=['POST'])
def lostpw_post():
    return UserLostPasswordHandler.post()

@app.route('/logout', methods=['GET'])
def logout_get():
    return UserLogoutHandler.get()

@app.route('/logout', methods=['POST'])
def logout_post():
    return UserLogoutHandler.post()

@app.route('/save', methods=['GET'])
def save_get():
    return SaveHandler.get()

@app.route('/save', methods=['POST'])
def save_post():
    return SaveHandler.post()

@app.route('/usersheet', methods=['POST'])
def usersheet_post():
    return UserSheetHandler.post()

@app.route('/pwreset', methods=['GET'])
def pwreset_get():
    return PWResetHandler.get()

@app.route('/pwreset', methods=['POST'])
def pwreset_post():
    return PWResetHandler.post()

@app.route('/downloadfile', methods=['POST'])
def download_post():
    return DownloadFileHander.post()

@app.route('/import', methods=['GET'])
def import_get():
    return ImportHandler.get()

@app.route('/import', methods=['POST'])
def import_post():
    return ImportHandler.post()

@app.route('/htmltopdf', methods=['GET'])
def import_post():
    return HtmlToPdfHandler.get()

@app.route('/htmltopdf', methods=['POST'])
def import_post():
    return HtmlToPdfHandler.post()

if __name__ == '__main__':
    app.run(debug=True)
