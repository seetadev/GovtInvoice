# Setting Up Flask Application on AWS EC2 Instance

This guide walks you through the steps to deploy a Flask application on an AWS EC2 instance using Ubuntu Server 20.04 LTS.

## Step 1: Launch an EC2 Instance

1. **Go to EC2 Dashboard:**

   - Sign in to AWS Management Console.
   - Navigate to the EC2 Dashboard.

2. **Launch Instance:**

   - Click on "Launch Instance".
   - Choose "Ubuntu Server 20.04 LTS" (or latest LTS version).
   - Select instance type "t2.medium".

3. **Configure Instance:**

   - Use default settings for VPC and subnet.
   - Add storage as needed (default is fine for most cases).
   - Add tags for easier identification (optional).

4. **Configure Security Group:**

   - Create a new security group or use an existing one.
   - Configure inbound rules:
     - SSH (port 22) from your IP (to access the instance).
     - HTTP (port 80) from anywhere (to allow web traffic).
     - HTTPS (port 443) from anywhere (if using SSL).

5. **Review and Launch:**

   - Review your instance configuration.
   - Click "Launch" and select or create a new key pair to connect to your instance securely.

6. **Allocate an Elastic IP:**

   - In the EC2 Dashboard, go to "Elastic IPs".
   - Click "Allocate Elastic IP address".
   - Select the allocated IP and associate it with your instance.

7. **Update Domain DNS:**
   - Go to your domain registrar's website.
   - Update the A record to point to your Elastic IP.

## Step 2: SSH into your Instance

Use the following command to SSH into your instance:

```bash
ssh -i your-key.pem ubuntu@your-elastic-ip
```

Replace `your-key.pem` with the path to your private key file and `your-elastic-ip` with your instance's Elastic IP address.

## Step 3: Set Up the Environment

1. **Update and Install Dependencies:**

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y make build-essential libssl-dev zlib1g-dev libbz2-dev \
    libreadline-dev libsqlite3-dev wget curl llvm libncurses5-dev \
    libncursesw5-dev xz-utils tk-dev libffi-dev liblzma-dev \
    python3-openssl git
```

2. **Install pyenv:**

```bash
curl https://pyenv.run | bash
```

3. **Add pyenv to your path:**

```bash
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init --path)"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
source ~/.bashrc
```

4. **Install Python 3.9.6:**

```bash
pyenv install 3.9.6
pyenv global 3.9.6
```

5. **Create a Virtual Environment:**

```bash
python -m venv venv
source venv/bin/activate
```

6. **Install wkhtmltopdf:**

```bash
sudo apt-get update
sudo apt-get install -y wkhtmltopdf
```

7. **Verify the installation:**

```bash
wkhtmltopdf --version
```

## Step 4: Deploy Your Flask Application

1. **Clone your repository and install dependencies:**

```bash
git clone your-repo-url
cd your-repo-directory
pip install -r requirements.txt
```

2. **Create .env file:**

```bash
nano .env
# Add your environment variables here
```

3. **Install and Configure Nginx:**

```bash
sudo apt install nginx
sudo cp configs/nginx.conf /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl enable nginx
```

4. **Install Gunicorn:**

```bash
pip install gunicorn
```

5. **Make your run scripts executable:**

```bash
chmod +x run.sh runwithlogs.sh runnginx.sh
```

6. **Create a systemd service file for your application:**

```bash
sudo nano /etc/systemd/system/flask_app.service
```

Add the following content:

```ini
[Unit]
Description=Gunicorn instance to serve flask app
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/your-repo-directory
Environment="PATH=/home/ubuntu/venv/bin"
ExecStart=/home/ubuntu/your-repo-directory/runwithlogs.sh

[Install]
WantedBy=multi-user.target
```

7. **Start and Enable the Service:**

```bash
sudo systemctl start flask_app
sudo systemctl enable flask_app
```

8. **Start Nginx:**

```bash
sudo systemctl start nginx
```

## Step 5: Configure SSH for Better Security (Optional)

1. **Install Certbot and the Nginx plugin:**

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

2. **Obtain SSL Certificate, Replace your-domain.com with your actual domain:**

```bash
sudo certbot --nginx -d your-domain.com
```

3. **Configure SSH to use the SSL Certificate, Edit the SSH configuration file:**

```bash
sudo nano /etc/ssh/sshd_config
```

## Step 6: Verify and Access Your Application

Your Flask application should now be running on your EC2 instance. Access it via your domain name or Elastic IP address in a web browser.
