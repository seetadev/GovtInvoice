# Flask Application README

## Prerequisites
Before running this Flask application, ensure you have the following installed on your system:
- Python (3.x recommended)
- pip (Python package installer)
- virtualenv (for creating isolated Python environments)
- PHP (for import/export feature)
- Composer (for import/export feature)

## Setup Instructions

### For Windows

1. **Install virtualenv (if not installed)**:
   Open Command Prompt and run:
   ```bash
   pip install virtualenv
   ```

2. **Install PHP and Composer**:
   - Download PHP from [php.net](https://www.php.net/downloads).
   - Install Composer by following the instructions on [getcomposer.org](https://getcomposer.org/download/).

3. **Clone the repository**:
   ```bash
   git clone https://github.com/ManasMadan/c4gt-website.git
   cd c4gt-website
   ```

4. **Install PHP dependencies for excelinterop**:
   Navigate to the `excelinterop` directory and run:
   ```bash
   cd excelinterop
   composer install
   cd ..
   ```

5. **Create a new virtual environment**:
   ```bash
   venv env
   ```

6. **Activate the virtual environment**:
   ```bash
   .\env\Scripts\activate
   ```

7. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

8. **Configure environment variables**:
   Create a `.env` file in the root directory of the project and add the required variables. You can use the provided `.env.example` file as a reference:
   ```bash
   cp .env.example .env
   ```

9. **Run the application**:
   ```bash
   python main.py
   ```

10. Access the application in your web browser at `http://127.0.0.1:5000`.

### For Mac/Linux

1. **Install virtualenv (if not installed)**:
   Open Terminal and run:
   ```bash
   pip3 install virtualenv
   ```

2. **Install PHP and Composer**:
   - Download PHP from [php.net](https://www.php.net/downloads).
   - Install Composer by following the instructions on [getcomposer.org](https://getcomposer.org/download/).

3. **Clone the repository**:
   ```bash
   git clone https://github.com/ManasMadan/c4gt-website.git
   cd c4gt-website
   ```

4. **Install PHP dependencies for excelinterop**:
   Navigate to the `excelinterop` directory and run:
   ```bash
   cd excelinterop
   composer install
   cd ..
   ```

5. **Create a new virtual environment**:
   ```bash
   python3 -m venv env
   ```

6. **Activate the virtual environment**:
   ```bash
   source env/bin/activate
   ```

7. **Install Python dependencies**:
   ```bash
   pip3 install -r requirements.txt
   ```

8. **Configure environment variables**:
   Create a `.env` file in the root directory of the project and add the required variables. You can use the provided `.env.example` file as a reference:
   ```bash
   cp .env.example .env
   ```

9. **Run the application**:
   ```bash
   python3 main.py
   ```

10. Access the application in your web browser at `http://127.0.0.1:5000`.

## Additional Notes

- If you encounter any issues during installation or execution, please refer to the official documentation for [Flask](https://flask.palletsprojects.com/) and ensure all prerequisites are correctly installed.